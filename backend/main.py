from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import pyodbc
import pandas as pd
import os
import re
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, List, Optional

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

# Configuration
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY must be set in .env file")

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# Create FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
def get_connection_string():
    server = os.getenv('DB_SERVER')
    database = os.getenv('DB_NAME')
    return f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};Trusted_Connection=yes;"

class QueryRequest(BaseModel):
    question: str

class SchemaInfo(BaseModel):
    tables: Dict[str, List[str]]
    relations: List[Dict[str, str]]

def get_database_schema(conn):
    """Récupère dynamiquement le schéma de la base de données"""
    try:
        cursor = conn.cursor()
        
        # Récupérer toutes les tables
        cursor.execute("""
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        schema = {}
        for table in tables:
            cursor.execute(f"""
                SELECT 
                    COLUMN_NAME,
                    DATA_TYPE,
                    CHARACTER_MAXIMUM_LENGTH,
                    NUMERIC_PRECISION,
                    NUMERIC_SCALE,
                    IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            """, table)
            
            columns = []
            for col in cursor.fetchall():
                col_name = col[0]
                data_type = col[1]
                max_length = col[2]
                precision = col[3]
                scale = col[4]
                
                type_desc = data_type
                if data_type in ('varchar', 'nvarchar', 'char', 'nchar'):
                    type_desc += f"({max_length if max_length != -1 else 'max'})"
                elif data_type in ('decimal', 'numeric'):
                    type_desc += f"({precision},{scale})"
                    
                columns.append(f"{col_name} ({type_desc})")
            
            schema[table] = columns
        
        # Récupérer les relations entre les tables
        cursor.execute("""
            SELECT 
                fk.name AS FK_name,
                tp.name AS parent_table,
                cp.name AS parent_column,
                tr.name AS referenced_table,
                cr.name AS referenced_column
            FROM 
                sys.foreign_keys fk
                INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
                INNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
                INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
                INNER JOIN sys.columns cp ON fkc.parent_column_id = cp.column_id AND fkc.parent_object_id = cp.object_id
                INNER JOIN sys.columns cr ON fkc.referenced_column_id = cr.column_id AND fkc.referenced_object_id = cr.object_id
        """)
        
        relations = cursor.fetchall()
        schema['relations'] = []
        for rel in relations:
            schema['relations'].append({
                'name': rel[0],
                'from_table': rel[1],
                'from_column': rel[2],
                'to_table': rel[3],
                'to_column': rel[4]
            })
        
        cursor.close()
        return schema
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database schema error: {str(e)}")

def generate_sql_query(question: str, schema: dict) -> str:
    """Traduit le langage naturel en SQL avec Gemini"""
    if not schema:
        raise HTTPException(status_code=500, detail="Schema not available")
        
    # Construire la description du schéma
    schema_desc = "Schéma de la base de données:\n"
    for table, columns in schema.items():
        if table != 'relations':
            schema_desc += f"\nTable '{table}':\n"
            for col in columns:
                schema_desc += f"  - {col}\n"
    
    if schema.get('relations'):
        schema_desc += "\nRelations entre les tables:\n"
        for rel in schema['relations']:
            schema_desc += f"  - {rel['from_table']}.{rel['from_column']} → {rel['to_table']}.{rel['to_column']}\n"
    
    prompt = f"""Tu es un expert en SQL Server. Traduis cette question en requête SQL.

{schema_desc}

Question : {question}

INSTRUCTIONS IMPORTANTES:
1. Retourne UNIQUEMENT la requête SQL, sans explication ni commentaire
2. Utilise les noms exacts des tables et colonnes du schéma
3. Pour les ID spécifiques, respecte la casse exacte
"""
    
    try:
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="No response from AI model")
            
        sql_query = response.text.strip()
        sql_query = sql_query.rstrip(';')
        sql_query = re.sub(r'```sql\s*|\s*```', '', sql_query)
        sql_query = sql_query.strip()
        
        if not sql_query or not sql_query.upper().startswith('SELECT'):
            raise HTTPException(status_code=400, detail="Invalid SQL query generated")
        
        return sql_query
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query generation error: {str(e)}")

@app.get("/api/schema")
async def get_schema():
    """Get database schema"""
    try:
        conn = pyodbc.connect(get_connection_string(), timeout=10)
        schema = get_database_schema(conn)
        conn.close()
        return schema
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def execute_sql_query(request: QueryRequest):
    """Generate and execute SQL query"""
    try:
        # Connect to database
        conn = pyodbc.connect(get_connection_string(), timeout=10)
        
        # Get schema
        schema = get_database_schema(conn)
        
        # Generate SQL query
        sql_query = generate_sql_query(request.question, schema)
        
        # Execute query
        cursor = conn.cursor()
        cursor.execute(sql_query)
        
        # Get results
        columns = [column[0] for column in cursor.description]
        results = cursor.fetchall()
        
        # Convert to list of dicts for JSON response
        data = []
        for row in results:
            data.append(dict(zip(columns, row)))
        
        cursor.close()
        conn.close()
        
        return {
            "query": sql_query,
            "results": data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

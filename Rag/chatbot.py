import streamlit as st

# Set page config
st.set_page_config(
    page_title="Assistant PDF",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
import google.generativeai as genai
import os
from pathlib import Path
import tempfile
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from uuid import uuid4
from dotenv import load_dotenv
import chromadb
import time

# import the .env file
load_dotenv()

# configuration
CHROMA_PATH = "chroma_db"

# Configure Google Gemini
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize embeddings model
embeddings_model = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=GOOGLE_API_KEY
)

# Initialize ChromaDB client
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

# initiate the model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.5,
    google_api_key=GOOGLE_API_KEY
)

def process_pdf(pdf_file):
    """Process uploaded PDF file and add to vector store"""
    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(pdf_file.getvalue())
            tmp_path = tmp_file.name

        # Load and split PDF with optimized chunk size
        loader = PyPDFLoader(tmp_path)
        raw_documents = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,  # Increased chunk size
            chunk_overlap=50,  # Reduced overlap
            length_function=len,
            is_separator_regex=False,
        )
        chunks = text_splitter.split_documents(raw_documents)
        
        if not chunks:
            return False, "❌ Le PDF semble être vide ou illisible"
            
        # Generate UUIDs
        uuids = [str(uuid4()) for _ in range(len(chunks))]
        
        # Reset collection
        try:
            chroma_client.delete_collection(name="example_collection")
        except:
            pass
            
        # Create new collection and vector store
        collection = chroma_client.create_collection(name="example_collection")
        vector_store = Chroma(
            client=chroma_client,
            collection_name="example_collection",
            embedding_function=embeddings_model,
        )
        
        # Add documents in batches
        batch_size = 5
        for i in range(0, len(chunks), batch_size):
            batch_end = min(i + batch_size, len(chunks))
            vector_store.add_documents(
                documents=chunks[i:batch_end],
                ids=uuids[i:batch_end]
            )
        
        # Cleanup and save
        os.unlink(tmp_path)
        st.session_state.vector_store = vector_store
        return True, f"✅ PDF traité avec succès! ({len(chunks)} segments créés)"
        
    except Exception as e:
        return False, f"❌ Erreur: {str(e)}"

def get_chat_response(message, history):
    try:
        if 'vector_store' not in st.session_state:
            return "⚠️ Veuillez d'abord télécharger un fichier PDF!"
            
        # Get relevant chunks with smaller k
        retriever = st.session_state.vector_store.as_retriever(search_kwargs={'k': 3})
        docs = retriever.invoke(message)
        
        if not docs:
            return "Je ne trouve pas d'information pertinente dans le document pour répondre à cette question."
            
        knowledge = "\n\n".join([doc.page_content for doc in docs])
        
        # Simplified prompt
        rag_prompt = f"""En tant qu'assistant, réponds à la question en utilisant uniquement les informations fournies ci-dessous. 
        Réponds toujours en français de manière concise et précise.

        Question: {message}
        Informations: {knowledge}
        """
        
        response = llm.invoke(rag_prompt)
        return response.content
                
    except Exception as e:
        return f"❌ Erreur: {str(e)}"

# Initialize session states
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []
if 'processing' not in st.session_state:
    st.session_state.processing = False
if 'last_uploaded_file' not in st.session_state:
    st.session_state.last_uploaded_file = None

# Sidebar for file upload
with st.sidebar:
    st.title("📚 Assistant PDF")
    uploaded_file = st.file_uploader("Importer un PDF", type=['pdf'])
    
    if uploaded_file and (st.session_state.last_uploaded_file != uploaded_file.name or not st.session_state.processing):
        st.session_state.processing = True
        st.session_state.last_uploaded_file = uploaded_file.name
        
        with st.spinner("Traitement du document..."):
            success, message = process_pdf(uploaded_file)
            if success:
                st.success(message)
            else:
                st.error(message)
        st.session_state.processing = False
    
    if st.session_state.chat_history:
        if st.button("🗑️ Effacer la conversation"):
            st.session_state.chat_history = []
            st.rerun()

# Main chat area
for message in st.session_state.chat_history:
    with st.chat_message(message["role"]):
        st.write(message["content"])

if user_input := st.chat_input("Posez votre question..."):
    if 'vector_store' not in st.session_state:
        st.error("⚠️ Veuillez d'abord importer un document PDF")
    else:
        st.session_state.chat_history.append({"role": "user", "content": user_input})
        
        with st.chat_message("assistant"):
            with st.spinner("Recherche..."):
                response = get_chat_response(user_input, st.session_state.chat_history)
                st.write(response)
                st.session_state.chat_history.append({"role": "assistant", "content": response})
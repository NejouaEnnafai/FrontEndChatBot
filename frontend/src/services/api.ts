const API_BASE_URL = 'http://localhost:8000/api';

export interface QueryResponse {
  query: string;
  results: Record<string, any>[];
}

export interface DatabaseSchema {
  [table: string]: string[] | Array<{
    name: string;
    from_table: string;
    from_column: string;
    to_table: string;
    to_column: string;
  }>;
}

export const fetchSchema = async (): Promise<DatabaseSchema> => {
  const response = await fetch(`${API_BASE_URL}/schema`);
  if (!response.ok) {
    throw new Error('Failed to fetch schema');
  }
  return response.json();
};

export const executeQuery = async (question: string): Promise<QueryResponse> => {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to execute query');
  }

  return response.json();
};

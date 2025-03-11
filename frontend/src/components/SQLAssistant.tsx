import React, { useState, useEffect } from 'react';
import { fetchSchema, executeQuery, QueryResponse, DatabaseSchema } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const SQLAssistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<DatabaseSchema | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);

  useEffect(() => {
    const loadSchema = async () => {
      try {
        const data = await fetchSchema();
        setSchema(data);
      } catch (err) {
        setError('Failed to load database schema');
        console.error(err);
      }
    };

    loadSchema();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setQueryResult(null);

    try {
      const result = await executeQuery(question);
      setQueryResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!queryResult?.results.length) return null;

    const columns = Object.keys(queryResult.results[0]);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {queryResult.results.map((row, i) => (
              <tr key={i}>
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300"
                  >
                    {row[column]?.toString() || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Posez votre question en langage naturel..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !question.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Envoyer'}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}

          {queryResult && (
            <div className="mt-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Requête SQL générée :
                </h3>
                <pre className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
                  {queryResult.query}
                </pre>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-md shadow">
                {renderResults()}
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default SQLAssistant;

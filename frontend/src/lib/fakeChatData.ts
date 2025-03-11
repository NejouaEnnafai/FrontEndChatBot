
export type MessageType = 'user' | 'bot';

export interface SqlResult {
  columns: string[];
  rows: Record<string, any>[];
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  sqlQuery?: string;
  sqlResult?: SqlResult;
  isLoading?: boolean;
}

export const initialMessages: Message[] = [
  {
    id: '1',
    type: 'bot',
    content: "Bonjour, je suis votre assistant SQL. Comment puis-je vous aider aujourd'hui ?",
    timestamp: new Date(Date.now() - 60000 * 5),
  },
  {
    id: '2',
    type: 'user',
    content: "Montre-moi la liste des utilisateurs",
    timestamp: new Date(Date.now() - 60000 * 4),
  },
  {
    id: '3',
    type: 'bot',
    content: "Voici la requête SQL pour afficher la liste des utilisateurs:",
    timestamp: new Date(Date.now() - 60000 * 3),
    sqlQuery: "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 10;",
    sqlResult: {
      columns: ['id', 'username', 'email', 'created_at'],
      rows: [
        { id: 1, username: 'johndoe', email: 'john@example.com', created_at: '2023-05-15 10:30:00' },
        { id: 2, username: 'janedoe', email: 'jane@example.com', created_at: '2023-05-14 14:12:30' },
        { id: 3, username: 'robertsmith', email: 'robert@example.com', created_at: '2023-05-12 09:45:10' },
        { id: 4, username: 'sarahparker', email: 'sarah@example.com', created_at: '2023-05-10 16:22:45' },
        { id: 5, username: 'michaelbrown', email: 'michael@example.com', created_at: '2023-05-08 11:05:33' },
      ]
    }
  },
  {
    id: '4',
    type: 'user',
    content: "Combien d'utilisateurs se sont inscrits le mois dernier ?",
    timestamp: new Date(Date.now() - 60000 * 2),
  },
  {
    id: '5',
    type: 'bot',
    content: "Pour compter les utilisateurs inscrits le mois dernier, vous pouvez utiliser cette requête SQL:",
    timestamp: new Date(Date.now() - 60000),
    sqlQuery: "SELECT COUNT(*) as user_count FROM users WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH);",
    sqlResult: {
      columns: ['user_count'],
      rows: [
        { user_count: 28 }
      ]
    }
  }
];


import { useState, useCallback } from 'react';
import { Message, initialMessages } from '@/lib/fakeChatData';
import { toast } from 'sonner';

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage.id;
  }, []);

  const simulateBotResponse = useCallback((userQuery: string) => {
    setIsTyping(true);
    
    // Simulate network delay
    setTimeout(() => {
      const botResponses: Record<string, Partial<Message>> = {
        default: {
          content: "Je ne suis pas sûr de comprendre votre demande. Pourriez-vous reformuler ?",
        },
        "utilisateurs": {
          content: "Voici les 5 derniers utilisateurs actifs sur la plateforme:",
          sqlQuery: "SELECT id, username, last_login_at, status FROM users WHERE status = 'active' ORDER BY last_login_at DESC LIMIT 5;",
          sqlResult: {
            columns: ['id', 'username', 'last_login_at', 'status'],
            rows: [
              { id: 12, username: 'emilyjohnson', last_login_at: '2023-06-02 14:22:10', status: 'active' },
              { id: 8, username: 'alexwilliams', last_login_at: '2023-06-01 09:45:30', status: 'active' },
              { id: 15, username: 'davidmiller', last_login_at: '2023-05-31 16:35:12', status: 'active' },
              { id: 3, username: 'oliviabrown', last_login_at: '2023-05-30 11:20:45', status: 'active' },
              { id: 21, username: 'jameswilson', last_login_at: '2023-05-29 10:05:22', status: 'active' },
            ]
          }
        },
        "ventes": {
          content: "Voici un résumé des ventes du dernier trimestre:",
          sqlQuery: "SELECT DATE_FORMAT(transaction_date, '%Y-%m') AS month, SUM(amount) AS total_sales, COUNT(*) AS transaction_count FROM sales WHERE transaction_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH) GROUP BY month ORDER BY month;",
          sqlResult: {
            columns: ['month', 'total_sales', 'transaction_count'],
            rows: [
              { month: '2023-04', total_sales: 125680.50, transaction_count: 1245 },
              { month: '2023-05', total_sales: 142320.75, transaction_count: 1382 },
              { month: '2023-06', total_sales: 138450.25, transaction_count: 1310 },
            ]
          }
        },
        "produits": {
          content: "Voici les produits les plus vendus:",
          sqlQuery: "SELECT p.product_name, p.category, SUM(o.quantity) AS total_sold, AVG(p.price) AS avg_price FROM products p JOIN order_items o ON p.id = o.product_id GROUP BY p.id ORDER BY total_sold DESC LIMIT 5;",
          sqlResult: {
            columns: ['product_name', 'category', 'total_sold', 'avg_price'],
            rows: [
              { product_name: 'Smartphone X Pro', category: 'Electronics', total_sold: 1250, avg_price: 899.99 },
              { product_name: 'Wireless Earbuds', category: 'Audio', total_sold: 980, avg_price: 129.99 },
              { product_name: 'Laptop Ultra', category: 'Electronics', total_sold: 845, avg_price: 1299.99 },
              { product_name: 'Smart Watch', category: 'Wearables', total_sold: 720, avg_price: 249.99 },
              { product_name: 'Bluetooth Speaker', category: 'Audio', total_sold: 650, avg_price: 79.99 },
            ]
          }
        }
      };
      
      let responseKey = 'default';
      
      if (userQuery.toLowerCase().includes('utilisateur')) {
        responseKey = 'utilisateurs';
      } else if (userQuery.toLowerCase().includes('vente') || userQuery.toLowerCase().includes('chiffre')) {
        responseKey = 'ventes';
      } else if (userQuery.toLowerCase().includes('produit')) {
        responseKey = 'produits';
      }
      
      const botResponse = botResponses[responseKey];
      
      addMessage({
        type: 'bot',
        ...botResponse as any,
      });
      
      setIsTyping(false);
    }, 1500);
  }, [addMessage]);
  
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    
    const messageId = addMessage({
      type: 'user',
      content,
    });
    
    simulateBotResponse(content);
    
    return messageId;
  }, [addMessage, simulateBotResponse]);
  
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Copié dans le presse-papier');
      })
      .catch(err => {
        toast.error('Impossible de copier le texte');
        console.error('Failed to copy: ', err);
      });
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    copyToClipboard
  };
}

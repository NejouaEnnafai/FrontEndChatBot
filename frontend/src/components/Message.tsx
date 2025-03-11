
import React, { useState } from 'react';
import { Message as MessageType } from '@/lib/fakeChatData';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import CodeBlock from './CodeBlock';
import ResultPanel from './ResultPanel';
import { MessageSquare, User, Copy, Check } from 'lucide-react';

interface MessageProps {
  message: MessageType;
  copyToClipboard: (text: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, copyToClipboard }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), { 
    addSuffix: true,
    locale: fr 
  });
  
  const isUser = message.type === 'user';

  const handleCopy = () => {
    copyToClipboard(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  return (
    <div className={`group py-5 ${isUser ? 'bg-white dark:bg-[#343541]' : 'bg-gray-50 dark:bg-[#444654]'}`}>
      <div className="max-w-3xl mx-auto flex gap-4 px-4">
        <div className="flex-shrink-0 pt-0.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gray-300 text-gray-800' 
              : 'bg-primary/20 text-primary'
          }`}>
            {isUser ? (
              <User className="h-5 w-5" />
            ) : (
              <MessageSquare className="h-5 w-5" />
            )}
          </div>
        </div>
        
        <div className="flex flex-col flex-1 min-w-0">
          <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            {isUser ? 'Vous' : 'Assistant Immobilier'}
          </div>
          
          <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          
          {message.sqlQuery && (
            <div className={`w-full mt-4 transition-all ${isExpanded ? 'opacity-100' : 'opacity-70'}`}>
              <CodeBlock code={message.sqlQuery} onCopy={copyToClipboard} />
            </div>
          )}
          
          {message.sqlResult && isExpanded && (
            <div className="w-full mt-4 transition-all">
              <ResultPanel result={message.sqlResult} />
            </div>
          )}
          
          {(message.sqlQuery || message.sqlResult) && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary hover:text-primary/80 mt-2 transition-colors"
            >
              {isExpanded ? 'Réduire les résultats' : 'Afficher les résultats'}
            </button>
          )}
        </div>
        
        {!isUser && (
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Copier le message"
            >
              {isCopied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;

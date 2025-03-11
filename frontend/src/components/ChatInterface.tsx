import React, { useRef, useEffect } from 'react';
import Message from './Message';
import ChatInput from './ChatInput';
import { useChatMessages } from '@/hooks/useChatMessages';
import { Building } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const { messages, isTyping, sendMessage, copyToClipboard } = useChatMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-[#343541]">
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-xl">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                Assistant Immobilier Groupe Addoha
              </h2>
              <p className="text-muted-foreground dark:text-gray-400">
                Posez vos questions concernant les projets immobiliers et les services du Groupe Addoha
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <React.Fragment key={message.id}>
                <Message 
                  message={message} 
                  copyToClipboard={copyToClipboard} 
                />
                {index < messages.length - 1 && (
                  <div className="h-[1px] my-4 bg-gray-100 dark:bg-gray-800" />
                )}
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <ChatInput onSendMessage={sendMessage} isTyping={isTyping} />
    </div>
  );
};

export default ChatInterface;

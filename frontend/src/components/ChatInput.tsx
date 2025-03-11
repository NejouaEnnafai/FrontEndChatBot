
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isTyping }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      // Auto-resize the textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isTyping) {
      onSendMessage(message);
      setMessage('');
      
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <div className="w-full p-4 border-t border-border bg-white/70 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        {isTyping && (
          <div className="text-xs text-muted-foreground mb-2 animate-pulse-soft">
            <span>Assistant est en train d'écrire</span>
            <span className="typing-dots"></span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question SQL ici..."
            className="w-full pl-4 pr-12 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-shadow resize-none min-h-[52px] max-h-[200px]"
            rows={1}
            disabled={isTyping}
          />
          
          <button
            type="submit"
            disabled={!message.trim() || isTyping}
            className={`absolute right-2 bottom-1/2 transform translate-y-1/2 p-2 rounded-lg transition-all ${
              message.trim() && !isTyping
                ? 'text-primary hover:bg-primary/10'
                : 'text-muted-foreground opacity-50 cursor-not-allowed'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        
        <div className="text-xs text-muted-foreground mt-2">
          Appuyez sur Entrée pour envoyer, Maj+Entrée pour sauter une ligne
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

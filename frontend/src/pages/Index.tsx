
import React from 'react';
import Header from '@/components/Header';
import ChatInterface from '@/components/ChatInterface';
import { Building } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#343541]">
      <Header />
      <main className="flex-1">
        <ChatInterface />
      </main>
    </div>
  );
};

export default Index;

import Header from '@/components/Header';
import SQLAssistant from '@/components/SQLAssistant';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#343541]">
      <Header />
      <SQLAssistant />
    </main>
  );
}

import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FoliviewChatbot } from '../chatbot/FoliviewChatbot';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <Navbar />
      <main className="flex-1 pt-18">
        <Outlet />
      </main>
      <Footer />
      <FoliviewChatbot />
    </div>
  );
}

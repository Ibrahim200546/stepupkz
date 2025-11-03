import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import Navbar from '@/components/layout/Navbar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const { chats, loading: chatsLoading } = useChat();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-8">
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const showChatList = !isMobile || !selectedChatId;
  const showChatWindow = !isMobile || selectedChatId;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container py-4">
        <div className="h-[calc(100vh-140px)] bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-[350px,1fr] h-full">
            {showChatList && (
              <div className={`${selectedChatId && isMobile ? 'hidden' : 'block'}`}>
                <ChatList
                  chats={chats}
                  selectedChatId={selectedChatId || undefined}
                  onSelectChat={(chatId) => {
                    setSelectedChatId(chatId);
                  }}
                  onNewChat={() => setShowNewChat(true)}
                />
              </div>
            )}

            {showChatWindow && selectedChatId ? (
              <div className={`${!selectedChatId && isMobile ? 'hidden' : 'block'}`}>
                <ChatWindow
                  chatId={selectedChatId}
                  onBack={isMobile ? () => setSelectedChatId(null) : undefined}
                />
              </div>
            ) : (
              !isMobile && (
                <div className="flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Выберите чат для начала общения</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <NewChatDialog
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onChatCreated={(chatId) => setSelectedChatId(chatId)}
      />
    </div>
  );
};

export default Chat;

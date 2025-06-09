import { SocketProvider } from './contexts/SocketContext';
import { ChatProvider } from './contexts/ChatContext';
import { Toaster } from '@/components/ui/toaster';
import { LoginModal } from './components/LoginModal';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { MobileSidebar } from './components/MobileSidebar';
import { Route, Switch } from 'wouter';
import FeaturesPage from './pages/features';
import NotFound from './pages/not-found';

function App() {
  return (
    <SocketProvider>
      <ChatProvider>
        <Switch>
          <Route path="/">
            <div className="h-screen flex flex-col bg-neutral-100">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <ChatArea />
              </div>
              <LoginModal />
              <MobileSidebar />
            </div>
          </Route>
          
          <Route path="/features">
            <FeaturesPage />
          </Route>
          
          <Route>
            <NotFound />
          </Route>
        </Switch>
        <Toaster />
      </ChatProvider>
    </SocketProvider>
  );
}

export default App;

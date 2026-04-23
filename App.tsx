import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Header from './components/Header';
import Feed from './components/Feed';
import Chat from './components/Chat';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import UsersList from './components/UsersList';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('feed');
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');

  if (!user) {
    if (authPage === 'login') {
      return <LoginPage onSwitchToRegister={() => setAuthPage('register')} />;
    }
    return <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'feed':
        return <Feed />;
      case 'chat':
        return <Chat />;
      case 'profile':
        return <Profile />;
      case 'admin':
        return <AdminPanel />;
      case 'users':
        return <UsersList />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 relative">
      <div className="horus-bg">
        <div className="mystical-ring"></div>
        <div className="mystical-particles"></div>
        <div className="horus-eye-container">
          <img 
            src="/images/horus-eye-bg.jpg" 
            alt="Horus Eye" 
            className="horus-eye-image"
          />
        </div>
      </div>
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="relative z-10">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

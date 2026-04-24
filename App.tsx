import { useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Header from './components/Header';

// Lazy loading components
const LoginPage = lazy(() => import('./components/LoginPage'));
const RegisterPage = lazy(() => import('./components/RegisterPage'));
const Feed = lazy(() => import('./components/Feed'));
const Chat = lazy(() => import('./components/Chat'));
const Profile = lazy(() => import('./components/Profile'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const UsersList = lazy(() => import('./components/UsersList'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
  </div>
);

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('feed');
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');

  if (!user) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {authPage === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthPage('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />
        )}
      </Suspense>
    );
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
            loading="eager"
          />
        </div>
      </div>
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="relative z-10">
        <Suspense fallback={<LoadingFallback />}>
          {renderPage()}
        </Suspense>
      </main>
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

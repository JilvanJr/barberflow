import React, { useState, createContext, useMemo } from 'react';
import { Role } from './types';
import type { User, Client } from './types';
import Dashboard from './components/Dashboard';
import AuthPage from './pages/AuthPage';
import ClientPortal from './pages/ClientPortal';

// FIX: Add 'Home' to the Page type to resolve type errors in Sidebar.tsx
export type Page = 'Home' | 'Agenda' | 'Clientes' | 'Serviços' | 'Fluxo de Caixa' | 'Equipe';

interface AppContextType {
  activePage: Page;
  setActivePage: React.Dispatch<React.SetStateAction<Page>>;
  currentUser: User;
  logout: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

// StaffPortal component to handle the dashboard for authenticated staff users
const StaffPortal: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  // FIX: Set initial active page to 'Home'.
  const [activePage, setActivePage] = useState<Page>('Home');

  const contextValue = useMemo(() => ({
    activePage,
    setActivePage,
    currentUser: user,
    logout: onLogout,
  }), [activePage, user, onLogout]);

  return (
    <AppContext.Provider value={contextValue}>
      <Dashboard />
    </AppContext.Provider>
  );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | Client | null>(null);

  const handleLogin = (user: User | Client) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (currentUser.role === Role.CLIENT) {
    return <ClientPortal client={currentUser as Client} onLogout={handleLogout} />;
  }
  
  // If user is Admin or Barber, render the StaffPortal
  return <StaffPortal user={currentUser as User} onLogout={handleLogout} />;
};

export default App;

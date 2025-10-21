
import React, { useState, createContext, useMemo, useEffect, useCallback, useContext } from 'react';
import { Role } from './types';
import type { User, Client } from './types';
import Dashboard from './components/Dashboard';
import AuthPage from './pages/AuthPage';
import ClientPortal from './pages/ClientPortal';
import { api } from './api';

export type Page = 'Home' | 'Agenda' | 'Clientes' | 'Serviços' | 'Fluxo de Caixa' | 'Equipe' | 'Permissões';

interface AppContextType {
  activePage: Page;
  setActivePage: React.Dispatch<React.SetStateAction<Page>>;
  currentUser: User | Client | null;
  logout: () => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  token: string | null;
  setToken: (token: string | null) => void;
  isLoading: boolean;
}

export const AppContext = createContext<AppContextType | null>(null);

const StaffPortal: React.FC = () => {
  // FIX: useContext was not defined. It is now imported from React.
  const context = useContext(AppContext);
  if (!context) throw new Error('Context is missing');

  const { currentUser, logout, setUsers, users } = context;
  const [activePage, setActivePage] = useState<Page>('Home');

  // Ensure the currentUser from context is always up-to-date
  const currentUserInState = users.find(u => u.id === currentUser?.id) || currentUser;

  const contextValue = useMemo(() => ({
    ...context,
    activePage,
    setActivePage,
    currentUser: currentUserInState,
    logout,
    users,
    setUsers
  }), [activePage, currentUserInState, logout, users, context]);

  return (
    <AppContext.Provider value={contextValue}>
      <Dashboard />
    </AppContext.Provider>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | Client | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = useCallback((user: User | Client, authToken: string) => {
    localStorage.setItem('authToken', authToken);
    setToken(authToken);
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const { user, users: allUsers } = await api.validateToken(token);
          setCurrentUser(user);
          if (user.role !== Role.CLIENT) {
            setUsers(allUsers as User[]);
          }
        } catch (error) {
          console.error("Token validation failed", error);
          handleLogout();
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, [token, handleLogout]);

  const contextValue = useMemo(() => ({
    currentUser,
    logout: handleLogout,
    users,
    setUsers,
    token,
    setToken: (t: string | null) => setToken(t),
    // FIX: Explicitly cast 'Home' to Page type to satisfy AppContextType.
    activePage: 'Home' as Page, // Default value, will be overridden in StaffPortal
    setActivePage: () => {}, // Default value
    isLoading
  }), [currentUser, handleLogout, users, token, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Carregando BarberFlow...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {!currentUser ? (
        <AuthPage onLogin={handleLogin} />
      ) : currentUser.role === Role.CLIENT ? (
        <ClientPortal client={currentUser as Client} onLogout={handleLogout} />
      ) : (
        <StaffPortal />
      )}
    </AppContext.Provider>
  );
};

export default App;

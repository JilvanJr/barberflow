import React, { useContext, useState, Suspense } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { AppContext } from '../App';

// FIX: Lazily load page components to break circular dependency.
// Using standard lazy loading with default exports, which are available on all page components.
const AgendaPage = React.lazy(() => import('../pages/AgendaPage'));
const ClientsPage = React.lazy(() => import('../pages/ClientsPage'));
const ServicesPage = React.lazy(() => import('../pages/ServicesPage'));
const CashFlowPage = React.lazy(() => import('../pages/CashFlowPage'));
const TeamPage = React.lazy(() => import('../pages/TeamPage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const HomePage = React.lazy(() => import('../pages/HomePage'));

const Dashboard: React.FC = () => {
    const context = useContext(AppContext);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const renderContent = () => {
        switch (context?.activePage) {
            case 'Home':
                return <HomePage />;
            case 'Agenda':
                return <AgendaPage />;
            case 'Clientes':
                return <ClientsPage />;
            case 'Serviços':
                return <ServicesPage />;
            case 'Equipe':
                return <TeamPage />;
            case 'Caixa':
                return <CashFlowPage />;
            case 'Configurações':
                return <SettingsPage />;
            default:
                return <HomePage />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {/* FIX: Add Suspense boundary for lazy-loaded components */}
                    <Suspense fallback={<div className="text-center p-8">Carregando...</div>}>
                        {renderContent()}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
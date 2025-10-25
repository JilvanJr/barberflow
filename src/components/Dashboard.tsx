import React, { useContext, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { AppContext } from '../App';
import AgendaPage from '../pages/AgendaPage';
import ClientsPage from '../pages/ClientsPage';
import ServicesPage from '../pages/ServicesPage';
import CashFlowPage from '../pages/CashFlowPage';
import TeamPage from '../pages/TeamPage';
import SettingsPage from '../pages/SettingsPage';
import HomePage from '../pages/HomePage';

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
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
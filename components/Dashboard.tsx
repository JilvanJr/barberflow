import React, { useContext } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { AppContext } from '../App';
import AgendaPage from '../pages/AgendaPage';
import ClientsPage from '../pages/ClientsPage';
import ServicesPage from '../pages/ServicesPage';
import CashFlowPage from '../pages/CashFlowPage';
import TeamPage from '../pages/TeamPage';

const Dashboard: React.FC = () => {
    const context = useContext(AppContext);

    const renderContent = () => {
        switch (context?.activePage) {
            // FIX: Add 'Home' case to render AgendaPage as the home screen.
            case 'Home':
            case 'Agenda':
                return <AgendaPage />;
            case 'Clientes':
                return <ClientsPage />;
            case 'Serviços':
                return <ServicesPage />;
            case 'Equipe':
                return <TeamPage />;
            case 'Fluxo de Caixa':
                return <CashFlowPage />;
            default:
                return <AgendaPage />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
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

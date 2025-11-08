import React, { useState, useEffect, useMemo, useContext } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { Transaction, Barber, Appointment, Client, Service, TransactionType } from '../types';
import { TrendingUpIcon, UsersIcon, CalendarIcon } from '../components/icons';

const getTodayLocalISOString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const HomePage: React.FC = () => {
    const context = useContext(AppContext);
    
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [trans, bar, apps, cli, serv] = await Promise.all([
                    api.getTransactions(),
                    api.getBarbers(),
                    api.getAppointments(),
                    api.getClients(),
                    api.getServices()
                ]);
                setTransactions(trans);
                setBarbers(bar);
                setAppointments(apps);
                setClients(cli);
                setServices(serv);
            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const today = getTodayLocalISOString();

    const todaysRevenue = useMemo(() => {
        return transactions
            .filter(t => t.date === today && t.type === TransactionType.INCOME && t.paymentStatus === 'completed')
            .reduce((sum, t) => sum + t.value, 0);
    }, [transactions, today]);

    const availableBarbers = useMemo(() => {
        const workingBarberIds = new Set(
            appointments.filter(app => app.date === today).map(app => app.barberId)
        );
        // FIX: Ensure only active barbers are considered "available"
        return barbers.filter(barber => barber.status === 'active' && workingBarberIds.has(barber.id));
    }, [barbers, appointments, today]);

    const todaysAppointments = useMemo(() => {
        return appointments
            .filter(app => app.date === today)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [appointments, today]);

    if (isLoading) {
        return <div className="text-center p-8">Carregando dashboard...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Receita Card */}
                <div 
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all"
                    onClick={() => context?.setActivePage('Caixa')}
                >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Receita</h3>
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUpIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-800">
                                R$ {todaysRevenue.toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-sm font-medium text-gray-500">Faturamento de hoje</p>
                        </div>
                    </div>
                </div>

                {/* Barbeiros Disponíveis Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Barbeiros Disponíveis</h3>
                     <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <UsersIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-800">
                                {availableBarbers.length > 0 ? `${availableBarbers.length} profissional(is)` : 'Nenhum barbeiro atuando'}
                            </p>
                             <p className="text-sm font-medium text-gray-500">Atuando hoje</p>
                        </div>
                    </div>
                     {availableBarbers.length > 0 && (
                        <div className="flex -space-x-2 mt-4 overflow-hidden pl-2">
                            {availableBarbers.map(barber => (
                                <img 
                                    key={barber.id}
                                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                                    src={barber.avatarUrl}
                                    alt={barber.name}
                                    title={barber.name}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Agendamentos do Dia Card */}
            <div 
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all"
                onClick={() => context?.setActivePage('Agenda')}
            >
                 <h3 className="text-lg font-bold text-gray-800 mb-4">Agendamentos do Dia</h3>
                <div className="max-h-96 overflow-y-auto pr-2">
                    {todaysAppointments.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {todaysAppointments.map(app => {
                                const client = clients.find(c => c.id === app.clientId);
                                const service = services.find(s => s.id === app.serviceId);
                                const barber = barbers.find(b => b.id === app.barberId);
                                return (
                                    <li key={app.id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-md text-sm">{app.startTime}</span>
                                            <div>
                                                <p className="font-medium text-gray-900">{client?.name || 'Cliente não encontrado'}</p>
                                                <p className="text-sm text-gray-500">{service?.name || 'Serviço não encontrado'}</p>
                                            </div>
                                        </div>
                                        {barber && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <img src={barber.avatarUrl} alt={barber.name} className="w-6 h-6 rounded-full" />
                                                <span className="hidden sm:inline">{barber.name}</span>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="text-center py-10">
                             <CalendarIcon className="w-12 h-12 mx-auto text-gray-400" />
                            <p className="mt-4 text-gray-500">Nenhum agendamento para hoje.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
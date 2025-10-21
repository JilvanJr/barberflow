import React, { useState } from 'react';
import { Client, Service, Barber, Appointment } from '../types';
import { BARBERS, SERVICES, APPOINTMENTS as MOCK_APPOINTMENTS } from '../constants';
import { MustacheIcon, LogoutIcon, XIcon } from '../components/icons';

const availableTimes = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

const BookingModal: React.FC<{
    service: Service | null;
    onClose: () => void;
    onConfirm: (bookingDetails: Omit<Appointment, 'id' | 'clientId'>) => void;
}> = ({ service, onClose, onConfirm }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    if (!service) return null;

    const handleConfirm = () => {
        if (selectedBarber && selectedTime && service) {
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const startTime = new Date();
            startTime.setHours(hours, minutes, 0, 0);
            const endTime = new Date(startTime.getTime() + service.duration * 60000);
            const endTimeString = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
            
            onConfirm({
                barberId: selectedBarber.id,
                serviceId: service.id,
                date: selectedDate,
                startTime: selectedTime,
                endTime: endTimeString,
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg text-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Agendar {service.name}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500 hover:text-gray-800" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Selecione uma data</label>
                        <input
                            type="date"
                            className="w-full bg-gray-50 text-gray-800 p-2 rounded border border-gray-300"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Selecione um profissional</label>
                        <div className="flex space-x-4">
                            {BARBERS.map(barber => (
                                <div key={barber.id} onClick={() => setSelectedBarber(barber)} className={`text-center cursor-pointer p-2 rounded-lg border-2 ${selectedBarber?.id === barber.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-100'}`}>
                                    <img src={barber.avatarUrl} alt={barber.name} className="w-16 h-16 rounded-full mx-auto" />
                                    <p className="mt-2 text-sm font-semibold">{barber.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedBarber && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Escolha um horário para {new Date(selectedDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</label>
                            <div className="grid grid-cols-4 gap-2">
                                {availableTimes.map(time => (
                                    <button key={time} onClick={() => setSelectedTime(time)} className={`p-2 rounded ${selectedTime === time ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>{time}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={!selectedDate || !selectedBarber || !selectedTime}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mt-6">
                    Confirmar Agendamento
                </button>
            </div>
        </div>
    );
};

const MyApointments: React.FC<{ appointments: Appointment[], onCancel: (id: number) => void }> = ({ appointments, onCancel }) => {
    const upcomingAppointments = appointments.filter(a => new Date(a.date) >= new Date());
    const pastAppointments = appointments.filter(a => new Date(a.date) < new Date());

    const AppointmentCard: React.FC<{app: Appointment, isUpcoming?: boolean}> = ({ app, isUpcoming = false }) => {
        const barber = BARBERS.find(b => b.id === app.barberId);
        const service = SERVICES.find(s => s.id === app.serviceId);
        return (
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <p className="font-bold text-lg">{service?.name}</p>
                <p className="text-sm text-gray-600">Com: {barber?.name}</p>
                <p className="text-sm text-gray-600">Data: {new Date(app.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} às {app.startTime}</p>
                {isUpcoming && (
                     <button onClick={() => onCancel(app.id)} className="mt-2 text-sm text-red-600 hover:underline">Cancelar</button>
                )}
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold mb-4">Próximos Agendamentos</h3>
                {upcomingAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingAppointments.map(app => <AppointmentCard key={app.id} app={app} isUpcoming />)}
                    </div>
                ) : <p className="text-gray-500">Você não possui agendamentos futuros.</p>}
            </div>
             <div>
                <h3 className="text-xl font-bold mb-4">Agendamentos Anteriores</h3>
                {pastAppointments.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pastAppointments.map(app => <AppointmentCard key={app.id} app={app} />)}
                    </div>
                ) : <p className="text-gray-500">Você não possui agendamentos anteriores.</p>}
            </div>
        </div>
    );
};

const ClientPortal: React.FC<{ client: Client; onLogout: () => void; }> = ({ client, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'services' | 'appointments'>('services');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [myAppointments, setMyAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS.filter(a => a.clientId === client.id));

    const handleStartBooking = (service: Service) => {
        setSelectedService(service);
        setIsBookingModalOpen(true);
    };

    const handleConfirmBooking = (bookingDetails: Omit<Appointment, 'id' | 'clientId'>) => {
        const newAppointment: Appointment = {
            ...bookingDetails,
            id: Date.now(),
            clientId: client.id,
        };
        setMyAppointments(prev => [...prev, newAppointment]);
        alert('Agendamento confirmado com sucesso! (Funcionalidade simulada)');
        setIsBookingModalOpen(false);
        setSelectedService(null);
    };

    const handleCancelAppointment = (id: number) => {
        if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
            setMyAppointments(prev => prev.filter(a => a.id !== id));
        }
    }

    const NavButton: React.FC<{ tabName: 'services' | 'appointments'; label: string; }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 rounded-md font-semibold text-sm ${activeTab === tabName ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <MustacheIcon className="w-8 h-8" />
                        <h1 className="font-bold text-xl">BarberFlow</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="font-semibold">Olá, {client.name}</span>
                        <button onClick={onLogout} className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-800">
                            <LogoutIcon className="w-5 h-5" />
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex space-x-4 border-b border-gray-200 mb-6">
                    <NavButton tabName="services" label="Nossos Serviços" />
                    <NavButton tabName="appointments" label="Meus Agendamentos" />
                </div>

                {activeTab === 'services' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {SERVICES.map(service => (
                            <div key={service.id} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between border border-gray-200">
                                <div>
                                    <h3 className="font-bold text-lg">{service.name}</h3>
                                    <p className="text-gray-500 mt-2">Duração: {service.duration} min</p>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <p className="text-xl font-semibold text-blue-600">R$ {service.price.toFixed(2).replace('.', ',')}</p>
                                    <button onClick={() => handleStartBooking(service)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                                        Agendar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <MyApointments appointments={myAppointments} onCancel={handleCancelAppointment} />
                )}
            </main>

            <BookingModal
                service={selectedService}
                onClose={() => setIsBookingModalOpen(false)}
                onConfirm={handleConfirmBooking}
            />
        </div>
    );
};

export default ClientPortal;
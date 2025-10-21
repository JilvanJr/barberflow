
import React, { useState, useCallback, useMemo, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { Appointment, Barber, Client, Service, User } from '../types';
import { PlusIcon, XIcon, CalendarIcon, SearchIcon, ChevronDownIcon } from '../components/icons';

// Helper to get today's date in YYYY-MM-DD format based on local timezone
const getTodayLocalISOString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const CalendarPopup: React.FC<{
    selectedDate: string; // YYYY-MM-DD
    onDateChange: (date: string) => void;
    onClose: () => void;
}> = ({ selectedDate, onDateChange, onClose }) => {
    const calendarRef = useRef<HTMLDivElement>(null);
    const [viewDate, setViewDate] = useState(new Date(selectedDate + 'T00:00:00'));

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [calendarRef, onClose]);
    
    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onDateChange(newDate.toISOString().split('T')[0]);
    };
    
    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const selected = new Date(selectedDate + 'T00:00:00');

        const days = [];
        
        for (let i = firstDayOfMonth; i > 0; i--) {
            const day = daysInPrevMonth - i + 1;
            days.push(<div key={`prev-${day}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-500">{day}</div>);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const isSelected = selected.getTime() === currentDate.getTime();
            
            const className = `w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors cursor-pointer ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-600'}`;
            days.push(<button key={day} type="button" onClick={() => handleDateClick(day)} className={className}>{day}</button>);
        }
        
        const totalRendered = firstDayOfMonth + daysInMonth;
        const cellsToFill = totalRendered > 35 ? 42 - totalRendered : 35 - totalRendered;

        for (let i = 1; i <= cellsToFill; i++) {
             days.push(<div key={`next-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-500">{i}</div>);
        }
        return days;
    };

    const monthYearFormat = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div ref={calendarRef} className="absolute top-full mt-2 bg-gray-800 text-white border border-gray-700 rounded-lg shadow-lg z-20 p-4 w-72">
            <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-sm capitalize">{monthYearFormat.format(viewDate)}</span>
                <div className="flex items-center space-x-2">
                    <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-700">
                        <svg className="w-4 h-4 transform rotate-180" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path></svg>
                    </button>
                    <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-700">
                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path></svg>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2 font-bold">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => <div key={i}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1 place-items-center">
                {renderDays()}
            </div>
            <div className="flex justify-between mt-4 text-sm font-semibold border-t border-gray-700 pt-3">
                <button type="button" onClick={onClose} className="text-blue-400 hover:text-blue-300">Limpar</button>
                <button type="button" onClick={() => onDateChange(getTodayLocalISOString())} className="text-blue-400 hover:text-blue-300">Hoje</button>
            </div>
        </div>
    );
};

const AppointmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (app: Omit<Appointment, 'id' | 'endTime'>) => Promise<void>;
    clients: Client[];
    services: Service[];
    barbers: Barber[];
    appointments: Appointment[];
    initialData?: Partial<Omit<Appointment, 'id' | 'endTime'>>;
}> = ({ isOpen, onClose, onSave, clients, services, barbers, appointments, initialData }) => {
    
    const initialAppointmentState = {
        clientId: '',
        serviceId: initialData?.serviceId?.toString() || '',
        barberId: initialData?.barberId?.toString() || '',
        date: initialData?.date || getTodayLocalISOString(),
        startTime: initialData?.startTime || ''
    };
    
    const [step, setStep] = useState(1);
    const [appointmentData, setAppointmentData] = useState(initialAppointmentState);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const resetModalState = useCallback(() => {
        const isPreFilled = initialData?.barberId && initialData?.startTime;
        setAppointmentData({
            clientId: '',
            serviceId: '',
            barberId: initialData?.barberId?.toString() || '',
            date: initialData?.date || getTodayLocalISOString(),
            startTime: initialData?.startTime || ''
        });
        setStep(isPreFilled ? 2 : 1);
        setClientSearch('');
        setAvailableTimes([]);
        setIsClientDropdownOpen(false);
        setIsSaving(false);
    }, [initialData]);

    useEffect(() => {
        if (isOpen) {
            resetModalState();
        }
    }, [initialData, isOpen, resetModalState]);

    // Effect for calculating available times
    useEffect(() => {
        if (!appointmentData.date || !appointmentData.barberId || !appointmentData.serviceId) {
            setAvailableTimes([]);
            return;
        }

        const selectedService = services.find(s => s.id === Number(appointmentData.serviceId));
        if (!selectedService) {
            setAvailableTimes([]);
            return;
        }

        const barberAppointments = appointments
            .filter(app => app.barberId === Number(appointmentData.barberId) && app.date === appointmentData.date)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        const newAvailableTimes: string[] = [];
        const dayStart = 9 * 60; // 9:00 in minutes
        const dayEnd = 19 * 60;   // 19:00 in minutes
        const serviceDuration = selectedService.duration;

        for (let time = dayStart; time <= dayEnd - serviceDuration; time += 15) { // Check every 15 minutes
            const slotStart = time;
            const slotEnd = time + serviceDuration;
            
            let isAvailable = true;
            for (const app of barberAppointments) {
                const appStart = parseInt(app.startTime.split(':')[0]) * 60 + parseInt(app.startTime.split(':')[1]);
                const appEnd = parseInt(app.endTime.split(':')[0]) * 60 + parseInt(app.endTime.split(':')[1]);

                if (slotStart < appEnd && slotEnd > appStart) {
                    isAvailable = false;
                    break;
                }
            }

            if (isAvailable) {
                const hour = Math.floor(time / 60);
                const minute = time % 60;
                newAvailableTimes.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
            }
        }
        setAvailableTimes(newAvailableTimes);
    }, [appointmentData.serviceId, appointmentData.date, appointmentData.barberId, appointments, services]);
    
    // Effect for managing wizard steps
    useEffect(() => {
        if (!appointmentData.serviceId) {
            setStep(1);
        } else if (!appointmentData.date || !appointmentData.barberId) {
            setStep(2);
        } else if (!appointmentData.startTime) {
            setStep(3);
        } else {
            setStep(4);
        }
    }, [appointmentData.serviceId, appointmentData.date, appointmentData.barberId, appointmentData.startTime]);
    
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({
            clientId: Number(appointmentData.clientId),
            serviceId: Number(appointmentData.serviceId),
            barberId: Number(appointmentData.barberId),
            date: appointmentData.date,
            startTime: appointmentData.startTime,
        });
        setIsSaving(false);
        onClose();
    };

    const handleClientSelect = (client: Client) => {
        setAppointmentData({...appointmentData, clientId: client.id.toString() });
        setClientSearch(client.name);
        setIsClientDropdownOpen(false);
    }
    
    const filteredClients = (clientSearch
        ? clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
        : [...clients]
    ).sort((a, b) => a.name.localeCompare(b.name));
    
    const stepHeaders: { [key: number]: string } = {
        1: "Passo 1 de 4: Selecione o Serviço",
        2: "Passo 2 de 4: Escolha a Data e o Barbeiro",
        3: "Passo 3 de 4: Selecione um Horário",
        4: "Passo 4 de 4: Identifique o Cliente"
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-all">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">Novo Agendamento</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <p className="text-sm text-gray-500 mb-6">{stepHeaders[step]}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Step 1: Service */}
                    <div style={{ display: step >= 1 ? 'block' : 'none' }}>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Serviço</label>
                        <select required value={appointmentData.serviceId} onChange={e => setAppointmentData({...appointmentData, serviceId: e.target.value, startTime: ''})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                            <option value="">Selecione o Serviço</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>)}
                        </select>
                    </div>

                    {/* Step 2: Date & Barber */}
                    <div className="grid grid-cols-2 gap-4" style={{ display: step >= 2 ? 'grid' : 'none' }}>
                         <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Data</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsDatePickerOpen(prev => !prev)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-left flex justify-between items-center"
                                >
                                    <span>{new Date(appointmentData.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                                    <CalendarIcon className="w-5 h-5 text-gray-800" />
                                </button>
                                {isDatePickerOpen && (
                                    <CalendarPopup
                                        selectedDate={appointmentData.date}
                                        onDateChange={(date) => {
                                            setAppointmentData({...appointmentData, date: date, startTime: ''});
                                            setIsDatePickerOpen(false);
                                        }}
                                        onClose={() => setIsDatePickerOpen(false)}
                                    />
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Barbeiro</label>
                            <select required value={appointmentData.barberId} onChange={e => setAppointmentData({...appointmentData, barberId: e.target.value, startTime: ''})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                                <option value="">Selecione o Barbeiro</option>
                                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {/* Step 3: Time */}
                     <div style={{ display: step >= 3 ? 'block' : 'none' }}>
                         <label className="block mb-2 text-sm font-medium text-gray-700">Horários disponíveis</label>
                         <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2">
                             {availableTimes.length > 0 ? availableTimes.map(time => (
                                <button key={time} type="button" onClick={() => setAppointmentData({...appointmentData, startTime: time})} className={`p-2 rounded text-sm font-semibold ${appointmentData.startTime === time ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                                    {time}
                                </button>
                            )) : <p className="text-sm text-gray-500 col-span-4">Nenhum horário disponível para esta data/barbeiro.</p>}
                         </div>
                     </div>

                    {/* Step 4: Client */}
                    <div className="relative" style={{ display: step >= 4 ? 'block' : 'none' }}>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Cliente</label>
                         <input
                            type="text"
                            placeholder="Digite para buscar o cliente..."
                            value={clientSearch}
                            onChange={e => {
                                setClientSearch(e.target.value);
                                setIsClientDropdownOpen(true);
                                setAppointmentData({...appointmentData, clientId: ''});
                            }}
                            onFocus={() => setIsClientDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setIsClientDropdownOpen(false), 150)}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                        {isClientDropdownOpen && (
                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                                {filteredClients.map(client => (
                                    <div key={client.id} onMouseDown={() => handleClientSelect(client)} className="p-2.5 hover:bg-gray-100 cursor-pointer text-sm text-gray-900">
                                        {client.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-6">
                         <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300">
                            Cancelar
                        </button>
                        <button type="submit" disabled={!appointmentData.clientId || isSaving} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isSaving ? 'Salvando...' : 'Salvar Agendamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CancelAppointmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (appointmentId: number) => void;
    appointment: Appointment | null;
    canCancel: boolean;
    clients: Client[];
    services: Service[];
    barbers: Barber[];
}> = ({ isOpen, onClose, onConfirm, appointment, canCancel, clients, services, barbers }) => {
    if (!isOpen || !appointment) return null;

    const client = clients.find(c => c.id === appointment.clientId);
    const service = services.find(s => s.id === appointment.serviceId);
    const barber = barbers.find(b => b.id === appointment.barberId);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Detalhes do Agendamento</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                {!canCancel && <p className="text-sm bg-yellow-100 text-yellow-800 p-3 rounded-md mb-4">Você não tem permissão para cancelar agendamentos.</p>}
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200 mb-6 text-sm text-gray-800">
                    <p><strong>Cliente:</strong> {client?.name}</p>
                    <p><strong>Serviço:</strong> {service?.name}</p>
                    <p><strong>Barbeiro:</strong> {barber?.name}</p>
                    <p><strong>Horário:</strong> {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {appointment.startTime} - {appointment.endTime}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="w-full px-5 py-3 text-sm font-semibold text-center text-gray-800 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200"
                    >
                        Fechar
                    </button>
                    <button 
                        onClick={() => onConfirm(appointment.id)}
                        disabled={!canCancel}
                        className="w-full px-5 py-3 text-sm font-semibold text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Cancelar Agendamento
                    </button>
                </div>
            </div>
        </div>
    );
};

const AgendaPage: React.FC = () => {
    const context = useContext(AppContext);
    const [selectedDate, setSelectedDate] = useState('2025-10-01');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [initialModalData, setInitialModalData] = useState<Partial<Appointment> | undefined>();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // FIX: Cast currentUser to User to safely access permissions.
    const currentUserPermissions = (context?.currentUser as User)?.permissions;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [appointmentsData, barbersData, clientsData, servicesData] = await Promise.all([
                    api.getAppointments(),
                    api.getBarbers(),
                    api.getClients(),
                    api.getServices()
                ]);
                setAppointments(appointmentsData);
                setBarbers(barbersData);
                setClients(clientsData);
                setServices(servicesData);
            } catch (error) {
                console.error("Failed to fetch agenda data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const timeSlots = useMemo(() => Array.from({ length: 22 }, (_, i) => { // 9:00 to 19:30
        const hour = 9 + Math.floor(i / 2);
        const minute = (i % 2) * 30;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }), []);
    
    const timeSlotHeight = 80; // in pixels for a 30-min slot
    const pixelsPerMinute = timeSlotHeight / 30;

    const handleSaveAppointment = useCallback(async (newApp: Omit<Appointment, 'id' | 'endTime'>) => {
        const savedAppointment = await api.createAppointment(newApp);
        setAppointments(prev => [...prev, savedAppointment].sort((a,b) => a.startTime.localeCompare(b.startTime)));
    }, []);

    const handleCancelAppointment = async (appointmentId: number) => {
        await api.deleteAppointment(appointmentId);
        setAppointments(prev => prev.filter(app => app.id !== appointmentId));
        setIsCancelModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleAppointmentClick = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsCancelModalOpen(true);
    };

    const todaysAppointments = useMemo(() => appointments.filter(a => a.date === selectedDate), [appointments, selectedDate]);
    
    const timeToPosition = (time: string) => {
        const [hour, minute] = time.split(':').map(Number);
        const totalMinutesFromStart = (hour - 9) * 60 + minute;
        return totalMinutesFromStart * pixelsPerMinute;
    };

    const getAppointmentDuration = (startTime: string, endTime: string) => {
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        return (end.getTime() - start.getTime()) / (1000 * 60);
    }

    const handleSlotClick = (barberId: number, e: React.MouseEvent<HTMLDivElement>) => {
        if (!currentUserPermissions?.canCreateAppointment) return;
        // Prevent opening new appointment modal if clicking on an existing one
        if ((e.target as HTMLElement).closest('.appointment-card')) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;

        const minutesFromStart = Math.floor(offsetY / pixelsPerMinute);
        const snappedMinutes = Math.floor(minutesFromStart / 15) * 15;
        
        const hour = 9 + Math.floor(snappedMinutes / 60);
        const minute = snappedMinutes % 60;
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        
        setInitialModalData({
            barberId,
            startTime: time,
            date: selectedDate
        });
        setIsModalOpen(true);
    };

    const handleOpenModal = () => {
        setInitialModalData({ date: selectedDate });
        setIsModalOpen(true);
    }
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').replace(/ de /g, ' ');
    }
    
    if (isLoading) {
        return <div className="text-center p-8">Carregando agenda...</div>;
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <button onClick={() => setIsCalendarOpen(prev => !prev)} className="flex items-center space-x-3 px-4 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer shadow-sm hover:bg-gray-50">
                            <CalendarIcon className="w-5 h-5 text-gray-500"/>
                            <span className="font-semibold text-gray-700">{formatDate(selectedDate)}</span>
                        </button>
                        {isCalendarOpen && (
                            <CalendarPopup 
                                selectedDate={selectedDate}
                                onDateChange={(date) => {
                                    setSelectedDate(date);
                                    setIsCalendarOpen(false);
                                }}
                                onClose={() => setIsCalendarOpen(false)}
                            />
                        )}
                    </div>
                    <button onClick={() => setSelectedDate(getTodayLocalISOString())} className="px-4 py-2 border border-gray-200 rounded-lg bg-white font-semibold text-sm text-gray-700 hover:bg-gray-50 shadow-sm">Hoje</button>
                    {/* Placeholder filters */}
                    <div className="relative"><select className="appearance-none w-40 pl-4 pr-8 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 shadow-sm"><option>Todos os Profissionais</option></select><ChevronDownIcon className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/></div>
                    <div className="relative"><select className="appearance-none w-40 pl-4 pr-8 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 shadow-sm"><option>Tipo de Serviço</option></select><ChevronDownIcon className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/></div>
                    <div className="relative">
                        <input type="text" placeholder="Buscar clientes agendados" className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm shadow-sm" />
                        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
                {currentUserPermissions?.canCreateAppointment && (
                    <button onClick={handleOpenModal} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                        <PlusIcon className="w-5 h-5" />
                        <span>Novo Agendamento</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-md">
                <div className="flex border-b border-gray-200">
                    <div className="w-24 flex-shrink-0"></div> {/* Time column spacer */}
                    <div className="flex-1 grid" style={{gridTemplateColumns: `repeat(${barbers.length}, 1fr)`}}>
                         {barbers.map(barber => (
                            <div key={barber.id} className="p-4 text-center">
                                <img src={barber.avatarUrl} alt={barber.name} className="w-12 h-12 rounded-full mx-auto mb-2"/>
                                <p className="font-semibold text-gray-700">{barber.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="overflow-y-auto" style={{ height: 'calc(100vh - 280px)' }}>
                    <div className="flex relative">
                        <div className="w-24 flex-shrink-0 text-right pr-4 pt-10">
                            {timeSlots.map(time => (
                                <div key={time} style={{height: `${timeSlotHeight}px`}} className="relative">
                                    <span className="text-sm text-gray-500 absolute -top-2.5 right-4">{time.endsWith('00') ? time : ''}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex-1 grid relative" style={{gridTemplateColumns: `repeat(${barbers.length}, 1fr)`}}>
                            {/* Background Lines */}
                            <div className="absolute inset-0">
                                {timeSlots.map((_, index) => (
                                    <div key={index} style={{height: `${timeSlotHeight}px`}} className={`border-t border-gray-100 ${index % 2 === 0 ? '' : 'border-dashed'}`}></div>
                                ))}
                            </div>
                            
                            {/* Barber columns with appointments */}
                            {barbers.map((barber, index) => (
                                <div 
                                    key={barber.id}
                                    className={`relative ${index > 0 ? 'border-l border-gray-100' : ''}`}
                                    onClick={(e) => handleSlotClick(barber.id, e)}
                                >
                                    {todaysAppointments.filter(a => a.barberId === barber.id).map(app => {
                                        const client = clients.find(c => c.id === app.clientId);
                                        const service = services.find(s => s.id === app.serviceId);
                                        const top = timeToPosition(app.startTime);
                                        const height = getAppointmentDuration(app.startTime, app.endTime) * pixelsPerMinute;
                                        return (
                                            <div 
                                                key={app.id} 
                                                className="absolute w-full px-1 z-10 appointment-card"
                                                style={{ top: `${top}px`, height: `${height}px` }}
                                            >
                                               <div 
                                                    onClick={() => handleAppointmentClick(app)}
                                                    className="bg-blue-100 border border-blue-300 rounded-lg p-2 h-full overflow-hidden cursor-pointer shadow-sm hover:bg-blue-200 transition-colors"
                                                >
                                                    <p className="font-bold text-blue-800 truncate">{client?.name}</p>
                                                    <p className="text-sm text-blue-700 truncate">{service?.name}</p>
                                                    <p className="text-sm text-blue-600">{app.startTime} - {app.endTime}</p>
                                               </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {currentUserPermissions?.canCreateAppointment && (
                <AppointmentModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveAppointment}
                    clients={clients}
                    services={services}
                    barbers={barbers}
                    appointments={appointments}
                    initialData={initialModalData}
                />
            )}
             <CancelAppointmentModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancelAppointment}
                appointment={selectedAppointment}
                canCancel={!!currentUserPermissions?.canCancelAppointment}
                clients={clients}
                services={services}
                barbers={barbers}
            />
        </>
    );
};

export default AgendaPage;

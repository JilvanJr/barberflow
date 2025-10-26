import React, { useState, useCallback, useMemo, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { Appointment, Barber, Client, Service, User, Role, OperatingHours } from '../types';
import { PlusIcon, XIcon, CalendarIcon, SearchIcon, ChevronDownIcon, EditIcon, TrashIcon } from '../components/icons';

// Helper to get today's date in YYYY-MM-DD format based on local timezone
const getTodayLocalISOString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to convert "HH:MM" to minutes from midnight
const timeToMinutes = (time: string): number => {
    if (!time || typeof time !== 'string' || !time.includes(':')) {
        return 0;
    }
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
        return 0;
    }
    return hours * 60 + minutes;
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
            days.push(<div key={`prev-${day}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">{day}</div>);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const isSelected = selected.getTime() === currentDate.getTime();
            
            const className = `w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors cursor-pointer ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-700'}`;
            days.push(<button key={day} type="button" onClick={() => handleDateClick(day)} className={className}>{day}</button>);
        }
        
        const totalRendered = firstDayOfMonth + daysInMonth;
        const cellsToFill = totalRendered > 35 ? 42 - totalRendered : 35 - totalRendered;

        for (let i = 1; i <= cellsToFill; i++) {
             days.push(<div key={`next-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">{i}</div>);
        }
        return days;
    };

    const monthYearFormat = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div ref={calendarRef} className="absolute top-full mt-2 bg-white text-gray-800 border border-gray-200 rounded-lg shadow-lg z-20 p-4 w-72">
            <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-sm capitalize">{monthYearFormat.format(viewDate)}</span>
                <div className="flex items-center space-x-2">
                    <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100">
                        <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100">
                         <svg className="w-4 h-4 transform -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2 font-bold">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => <div key={i}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1 place-items-center">
                {renderDays()}
            </div>
            <div className="flex justify-between mt-4 text-sm font-semibold border-t border-gray-200 pt-3">
                <button type="button" onClick={onClose} className="text-gray-600 hover:text-blue-600">Fechar</button>
                <button type="button" onClick={() => onDateChange(getTodayLocalISOString())} className="text-blue-600 hover:text-blue-800">Hoje</button>
            </div>
        </div>
    );
};

const AppointmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (app: Partial<Appointment>) => Promise<void>;
    clients: Client[];
    services: Service[];
    barbers: Barber[];
    appointments: Appointment[];
    operatingHours: OperatingHours;
    initialData?: Partial<Appointment>;
}> = ({ isOpen, onClose, onSave, clients, services, barbers, appointments, operatingHours, initialData }) => {
    
    const initialAppointmentState = {
        clientId: initialData?.clientId?.toString() || '',
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

    const isEditing = !!initialData?.id;

    const resetModalState = useCallback(() => {
        const isEditingMode = !!initialData?.id;
        setAppointmentData({
            clientId: initialData?.clientId?.toString() || '',
            serviceId: initialData?.serviceId?.toString() || '',
            barberId: initialData?.barberId?.toString() || '',
            date: initialData?.date || getTodayLocalISOString(),
            startTime: isEditingMode ? initialData?.startTime || '' : ''
        });

        if (isEditingMode && initialData?.clientId) {
            const client = clients.find(c => c.id === initialData.clientId);
            setClientSearch(client?.name || '');
        } else {
             setClientSearch('');
        }

        if (isEditingMode) {
            setStep(4);
        } else {
            const isPreFilledForNew = initialData?.barberId && initialData?.startTime;
            setStep(isPreFilledForNew ? 2 : 1);
        }

        setAvailableTimes([]);
        setIsClientDropdownOpen(false);
        setIsSaving(false);
    }, [initialData, clients]);

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
        const selectedBarber = barbers.find(b => b.id === Number(appointmentData.barberId));
        if (!selectedService || !selectedBarber) {
            setAvailableTimes([]);
            return;
        }

        const dayOfWeek = new Date(appointmentData.date + 'T00:00:00').toLocaleString('en-US', { weekday: 'long' }).toLowerCase() as keyof OperatingHours;
        const dayOperatingHours = operatingHours[dayOfWeek];

        if (!dayOperatingHours.isOpen) {
            setAvailableTimes([]);
            return;
        }
        
        const barberAppointments = appointments
            .filter(app => app.barberId === Number(appointmentData.barberId) && app.date === appointmentData.date && app.id !== initialData?.id)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        const newAvailableTimes: string[] = [];
        
        const shopOpen = timeToMinutes(dayOperatingHours.openTime);
        const shopClose = timeToMinutes(dayOperatingHours.closeTime);
        const barberWorkStart = timeToMinutes(selectedBarber.workStartTime || '00:00');
        const barberWorkEnd = timeToMinutes(selectedBarber.workEndTime || '23:59');
        const barberLunchStart = timeToMinutes(selectedBarber.lunchStartTime || '00:00');
        const barberLunchEnd = timeToMinutes(selectedBarber.lunchEndTime || '00:00');

        const dayStart = Math.max(shopOpen, barberWorkStart);
        const dayEnd = Math.min(shopClose, barberWorkEnd);
        const serviceDuration = selectedService.duration;

        for (let time = dayStart; time <= dayEnd - serviceDuration; time += 15) { // Check every 15 minutes
            const slotStart = time;
            const slotEnd = time + serviceDuration;
            
            // Check for lunch break
            if (slotStart < barberLunchEnd && slotEnd > barberLunchStart) {
                continue;
            }

            let isAvailable = true;
            for (const app of barberAppointments) {
                const appStart = timeToMinutes(app.startTime);
                const appEnd = timeToMinutes(app.endTime);

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
    }, [appointmentData.serviceId, appointmentData.date, appointmentData.barberId, appointments, services, barbers, operatingHours, initialData]);
    
    // Effect for managing wizard steps
    useEffect(() => {
        if (isEditing) {
            setStep(4);
            return;
        };

        if (!appointmentData.serviceId) {
            setStep(1);
        } else if (!appointmentData.date || !appointmentData.barberId) {
            setStep(2);
        } else if (!appointmentData.startTime) {
            setStep(3);
        } else {
            setStep(4);
        }
    }, [isEditing, appointmentData.serviceId, appointmentData.date, appointmentData.barberId, appointmentData.startTime]);
    
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({
            id: initialData?.id,
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

    const isFormComplete = !!appointmentData.serviceId && !!appointmentData.barberId && !!appointmentData.date && !!appointmentData.startTime && !!appointmentData.clientId;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-all">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                {!isEditing && <p className="text-sm text-gray-500 mb-6">{stepHeaders[step]}</p>}

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
                            )) : <p className="text-sm text-gray-500 col-span-4">Nenhum horário disponível. Verifique o horário da barbearia e do profissional.</p>}
                         </div>
                     </div>

                    {/* Step 4: Client */}
                    <div className="relative" style={{ display: step >= 4 ? 'block' : 'none' }}>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Cliente</label>
                         <input
                            type="text"
                            required
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
                        <button
                            type="submit"
                            disabled={!isFormComplete || isSaving}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Salvando...' : 'Salvar Agendamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AppointmentDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCancel: (appointmentId: number) => void;
    onEdit: () => void;
    appointment: Appointment | null;
    canCancel: boolean;
    canEdit: boolean;
    clients: Client[];
    services: Service[];
    barbers: Barber[];
}> = ({ isOpen, onClose, onCancel, onEdit, appointment, canCancel, canEdit, clients, services, barbers }) => {
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
                {(!canCancel && !canEdit) && <p className="text-sm bg-yellow-100 text-yellow-800 p-3 rounded-md mb-4">Você não tem permissão para editar ou excluir agendamentos.</p>}
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200 mb-6 text-sm text-gray-800">
                    <p><strong>Cliente:</strong> {client?.name}</p>
                    <p><strong>Serviço:</strong> {service?.name}</p>
                    <p><strong>Barbeiro:</strong> {barber?.name}</p>
                    <p><strong>Horário:</strong> {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {appointment.startTime} - {appointment.endTime}</p>
                </div>

                <div className="flex justify-end items-center gap-3 mt-8">
                     <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-5 py-2.5 text-sm font-semibold text-center text-gray-800 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200"
                    >
                        Fechar
                    </button>
                    <button 
                        onClick={onEdit}
                        disabled={!canEdit}
                        className="px-5 py-2.5 text-sm font-semibold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <EditIcon className="w-4 h-4" />
                        Editar
                    </button>
                    <button 
                        onClick={() => onCancel(appointment.id)}
                        disabled={!canCancel}
                        className="px-5 py-2.5 text-sm font-semibold text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <TrashIcon className="w-4 h-4" />
                        Excluir
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
    const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [initialModalData, setInitialModalData] = useState<Partial<Appointment> | undefined>();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    if (!context || !context.currentUser || context.currentUser.role === Role.CLIENT) {
        return <div className="text-center p-8">Acesso não autorizado.</div>;
    }
    const { currentUser } = context;
    const currentUserPermissions = currentUser.permissions;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [appointmentsData, barbersData, clientsData, servicesData, opHoursData] = await Promise.all([
                    api.getAppointments(),
                    api.getBarbers(),
                    api.getClients(),
                    api.getServices(),
                    api.getOperatingHours()
                ]);
                setAppointments(appointmentsData);
                setBarbers(barbersData);
                setClients(clientsData);
                setServices(servicesData);
                setOperatingHours(opHoursData);
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

    const handleSaveAppointment = useCallback(async (appData: Partial<Appointment>) => {
        if (appData.id) { // UPDATE
            const updatedAppointment = await api.updateAppointment(appData.id, appData);
            setAppointments(prev => prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a).sort((a,b) => a.startTime.localeCompare(b.startTime)));
        } else { // CREATE
             const createData: Omit<Appointment, 'id' | 'endTime'> = {
                clientId: appData.clientId!,
                serviceId: appData.serviceId!,
                barberId: appData.barberId!,
                date: appData.date!,
                startTime: appData.startTime!,
            };
            const savedAppointment = await api.createAppointment(createData);
            setAppointments(prev => [...prev, savedAppointment].sort((a,b) => a.startTime.localeCompare(b.startTime)));
        }
    }, []);

    const handleCancelAppointment = async (appointmentId: number) => {
        await api.deleteAppointment(appointmentId);
        setAppointments(prev => prev.filter(app => app.id !== appointmentId));
        setIsDetailsModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleAppointmentClick = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsDetailsModalOpen(true);
    };
    
    const handleEditClick = () => {
        if (selectedAppointment) {
            setInitialModalData(selectedAppointment);
            setIsDetailsModalOpen(false);
            setIsModalOpen(true);
        }
    };

    const todaysAppointments = useMemo(() => appointments.filter(a => a.date === selectedDate), [appointments, selectedDate]);
    
    const timeToPosition = (time: string) => {
        const totalMinutesFromStart = timeToMinutes(time) - timeToMinutes('09:00');
        return totalMinutesFromStart * pixelsPerMinute;
    };

    const getAppointmentDuration = (startTime: string, endTime: string) => {
        return timeToMinutes(endTime) - timeToMinutes(startTime);
    }

    const handleSlotClick = (barberId: number, e: React.MouseEvent<HTMLDivElement>) => {
        if (!currentUserPermissions?.canCreateAppointment) return;
        if ((e.target as HTMLElement).closest('.appointment-card') || (e.target as HTMLElement).closest('.unavailable-block')) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;

        const minutesFromStart = Math.floor(offsetY / pixelsPerMinute);
        const snappedMinutes = Math.floor(minutesFromStart / 15) * 15;
        
        const totalMinutes = timeToMinutes('09:00') + snappedMinutes;
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
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

    const dayOfWeek = useMemo(() => {
        const date = new Date(selectedDate + 'T00:00:00');
        return date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase() as keyof OperatingHours;
    }, [selectedDate]);

    const dayOperatingHours = operatingHours ? operatingHours[dayOfWeek] : null;
    
    const UnavailableBlock: React.FC<{ top: number; height: number; label: string }> = ({ top, height, label }) => {
        if (height <= 10) return null;

        let containerClasses = "h-full rounded-xl p-2";
        let textClasses = "font-semibold text-sm";

        if (label === 'Almoço') {
            containerClasses += " border-2 border-dashed border-orange-400 bg-orange-50";
            textClasses += " text-orange-600";
        } else { // 'Fechado' or 'Ausência'
            containerClasses += " border-2 border-dashed border-slate-500 bg-slate-400";
            textClasses += " text-white";
        }

        return (
            <div
                className="absolute w-full px-1 z-0 unavailable-block"
                style={{ top: `${top}px`, height: `${height}px` }}
            >
                <div className={containerClasses}>
                    <span className={textClasses}>{label}</span>
                </div>
            </div>
        );
    };

    if (isLoading || !operatingHours) {
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
                            <div key={barber.id} className="p-4 text-center border-l border-gray-100 first:border-l-0">
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
                            {barbers.map((barber, index) => {
                                const isShopOpen = dayOperatingHours?.isOpen ?? false;
    
                                return (
                                <div 
                                    key={barber.id}
                                    className={`relative ${index > 0 ? 'border-l border-gray-100' : ''}`}
                                    onClick={(e) => handleSlotClick(barber.id, e)}
                                >
                                    {/* Unavailable slots renderer */}
                                    <div className="absolute inset-0">
                                        {!isShopOpen || !dayOperatingHours ? (
                                            <div 
                                                className="absolute inset-0 bg-slate-50 bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,theme(colors.slate.200)_4px,theme(colors.slate.200)_5px)] z-0 flex items-center justify-center p-2"
                                            >
                                                <span className="font-bold text-slate-400 transform -rotate-12 bg-slate-50/70 px-4 py-2 rounded-md shadow-sm">Barbearia Fechada</span>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Before Shop opens */}
                                                <UnavailableBlock 
                                                    top={timeToPosition('09:00')}
                                                    height={timeToPosition(dayOperatingHours.openTime) - timeToPosition('09:00')}
                                                    label="Fechado"
                                                />
                                                {/* Barber absent before work */}
                                                <UnavailableBlock 
                                                    top={timeToPosition(dayOperatingHours.openTime)}
                                                    height={timeToPosition(barber.workStartTime || dayOperatingHours.openTime) - timeToPosition(dayOperatingHours.openTime)}
                                                    label="Ausência"
                                                />

                                                {/* Lunch Break */}
                                                {barber.lunchStartTime && barber.lunchEndTime && (
                                                    <UnavailableBlock 
                                                        top={timeToPosition(barber.lunchStartTime)}
                                                        height={getAppointmentDuration(barber.lunchStartTime, barber.lunchEndTime) * pixelsPerMinute}
                                                        label="Almoço"
                                                    />
                                                )}
                                                
                                                {/* Barber absent after work */}
                                                <UnavailableBlock
                                                    top={timeToPosition(barber.workEndTime || dayOperatingHours.closeTime)}
                                                    height={timeToPosition(dayOperatingHours.closeTime) - timeToPosition(barber.workEndTime || dayOperatingHours.closeTime)}
                                                    label="Ausência"
                                                />

                                                {/* After Shop closes */}
                                                <UnavailableBlock
                                                    top={timeToPosition(dayOperatingHours.closeTime)}
                                                    height={timeToPosition('19:30') - timeToPosition(dayOperatingHours.closeTime)}
                                                    label="Fechado"
                                                />
                                            </>
                                        )}
                                    </div>
                                    {/* Appointments */}
                                    {todaysAppointments.filter(a => a.barberId === barber.id).map(app => {
                                        const client = clients.find(c => c.id === app.clientId);
                                        const service = services.find(s => s.id === app.serviceId);
                                        const top = timeToPosition(app.startTime);
                                        const height = getAppointmentDuration(app.startTime, app.endTime) * pixelsPerMinute;
                                        const tooltipText = `${client?.name} - ${service?.name} - ${app.startTime} ~ ${app.endTime}`;
                                        return (
                                            <div 
                                                key={app.id} 
                                                className="absolute w-full px-1 z-10 appointment-card"
                                                style={{ top: `${top}px`, height: `${height}px` }}
                                            >
                                               <div 
                                                    onClick={() => handleAppointmentClick(app)}
                                                    title={tooltipText}
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
                            )})}
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
                    operatingHours={operatingHours}
                    initialData={initialModalData}
                />
            )}
             <AppointmentDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                onCancel={handleCancelAppointment}
                onEdit={handleEditClick}
                appointment={selectedAppointment}
                canCancel={!!currentUserPermissions?.canCancelAppointment}
                canEdit={!!currentUserPermissions?.canCreateAppointment}
                clients={clients}
                services={services}
                barbers={barbers}
            />
        </>
    );
};

export default AgendaPage;
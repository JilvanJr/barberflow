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
            
            const className = `w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                isSelected 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-200 text-gray-700 cursor-pointer'
            }`;

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
    const [serviceSearch, setServiceSearch] = useState('');
    const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isEditing = !!initialData?.id;

    const barbersForDropdown = useMemo(() => {
        if (!isEditing) {
            return barbers.filter(barber => barber.status === 'active');
        }
        return barbers.filter(barber => {
            if (barber.status === 'active') {
                return true;
            }
            if (barber.id === initialData?.barberId) {
                return true;
            }
            return false;
        });
    }, [barbers, isEditing, initialData]);

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

        if (isEditingMode && initialData?.serviceId) {
            const service = services.find(s => s.id === initialData.serviceId);
            setServiceSearch(service ? `${service.name} (${service.duration} min)` : '');
        } else {
            setServiceSearch('');
        }

        if (isEditingMode) {
            setStep(4);
        } else {
            const isPreFilledForNew = initialData?.barberId && initialData?.startTime;
            setStep(isPreFilledForNew ? 2 : 1);
        }

        setAvailableTimes([]);
        setIsClientDropdownOpen(false);
        setIsServiceDropdownOpen(false);
        setIsSaving(false);
    }, [initialData, clients, services]);

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

        const barberSchedule = selectedBarber;

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
        const barberWorkStart = timeToMinutes(barberSchedule.workStartTime);
        const barberWorkEnd = timeToMinutes(barberSchedule.workEndTime);
        const barberLunchStart = timeToMinutes(barberSchedule.lunchStartTime);
        const barberLunchEnd = timeToMinutes(barberSchedule.lunchEndTime);

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

    const filteredClients = useMemo(() => (clientSearch
        ? clients.filter(c => c.status === 'active' && c.name.toLowerCase().includes(clientSearch.toLowerCase()))
        : clients.filter(c => c.status === 'active')
    ).sort((a, b) => a.name.localeCompare(b.name)), [clients, clientSearch]);

    const filteredServices = useMemo(() => {
        const searchInput = appointmentData.serviceId ? '' : serviceSearch; // Don't filter if an ID is already set
        return services
            .filter(s => s.status === 'active' && s.name.toLowerCase().includes(searchInput.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [services, serviceSearch, appointmentData.serviceId]);
    
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

    const handleServiceSelect = (service: Service) => {
        setAppointmentData({ ...appointmentData, serviceId: service.id.toString(), startTime: '' });
        setServiceSearch(`${service.name} (${service.duration} min)`);
        setIsServiceDropdownOpen(false);
    }
    
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
                    <div className="relative" style={{ display: step >= 1 ? 'block' : 'none' }}>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Serviço</label>
                        <input
                            type="text"
                            required
                            placeholder="Digite para buscar o serviço..."
                            value={serviceSearch}
                            onChange={e => {
                                setServiceSearch(e.target.value);
                                setIsServiceDropdownOpen(true);
                                setAppointmentData({ ...appointmentData, serviceId: '', startTime: '' });
                            }}
                            onFocus={() => setIsServiceDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setIsServiceDropdownOpen(false), 150)}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        />
                        {isServiceDropdownOpen && (
                            <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                                {filteredServices.length > 0 ? (
                                    filteredServices.map(service => (
                                        <div
                                            key={service.id}
                                            onMouseDown={() => handleServiceSelect(service)}
                                            className="p-2.5 hover:bg-gray-100 cursor-pointer text-sm text-gray-900"
                                        >
                                            {service.name} ({service.duration} min)
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2.5 text-sm text-gray-500">Nenhum serviço encontrado</div>
                                )}
                            </div>
                        )}
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
                                {barbersForDropdown.map(b => (
                                    <option key={b.id} value={b.id} disabled={b.status === 'inactive'}>
                                        {b.name}{b.status === 'inactive' ? ' (Inativo)' : ''}
                                    </option>
                                ))}
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

// FIX: Change to a named export to avoid issues with circular dependencies.
export const AgendaPage: React.FC = () => {
    const context = useContext(AppContext);
    
    if (!context || !context.currentUser || context.currentUser.role === Role.CLIENT) {
        return <div className="text-center p-8">Acesso não autorizado.</div>;
    }
    const { currentUser, mockAppointmentsDate, showToast } = context;
    const currentUserPermissions = currentUser.permissions;

    const [selectedDate, setSelectedDate] = useState(mockAppointmentsDate || getTodayLocalISOString());
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

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [appointmentsData, barbersData, clientsData, servicesData, opHoursData] = await Promise.all([
                api.getAppointments(),
                api.getUsers(), // Fetch all users to ensure we have schedule data
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
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const activeBarbers = useMemo(() => barbers.filter(b => b.status === 'active' && b.jobTitle === 'Barbeiro'), [barbers]);

    const dayOfWeek = useMemo(() => {
        const date = new Date(selectedDate + 'T00:00:00');
        return date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase() as keyof OperatingHours;
    }, [selectedDate]);

    const { timelineStart, timelineEnd, timeSlots } = useMemo(() => {
        if (!operatingHours) {
            return { timelineStart: '09:00', timelineEnd: '19:00', timeSlots: [] };
        }
        
        const currentDayHours = operatingHours[dayOfWeek];
        
        let minStart, maxEnd;

        if (currentDayHours && currentDayHours.isOpen) {
            minStart = timeToMinutes(currentDayHours.openTime);
            maxEnd = timeToMinutes(currentDayHours.closeTime);
        } else {
            minStart = 540; // 09:00
            maxEnd = 1140; // 19:00
        }

        const startHour = Math.floor(minStart / 60);
        const endHour = Math.ceil(maxEnd / 60);

        const timelineStartTime = `${String(startHour).padStart(2, '0')}:00`;
        const timelineEndTime = `${String(endHour).padStart(2, '0')}:00`;

        const slots = [];
        for (let time = startHour * 60; time < maxEnd; time += 30) {
             const hour = Math.floor(time / 60);
             const minute = time % 60;
             slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
        }

        return { timelineStart: timelineStartTime, timelineEnd: timelineEndTime, timeSlots: slots };
    }, [operatingHours, dayOfWeek]);

    
    const timeSlotHeight = 80; // in pixels for a 30-min slot
    const pixelsPerMinute = timeSlotHeight / 30;

    const handleSaveAppointment = useCallback(async (appData: Partial<Appointment>) => {
        try {
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
            showToast('Agendamento salvo com sucesso!', 'success');
        } catch (error) {
            console.error("Failed to save appointment", error);
            showToast('Erro ao salvar agendamento.', 'error');
        }
    }, [showToast]);

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

    const handleTodayClick = () => {
        setSelectedDate(getTodayLocalISOString());
    };

    const todaysAppointments = useMemo(() => appointments.filter(a => a.date === selectedDate), [appointments, selectedDate]);
    
    const timeToPosition = useCallback((time: string) => {
        const totalMinutesFromStart = timeToMinutes(time) - timeToMinutes(timelineStart);
        return totalMinutesFromStart * pixelsPerMinute;
    }, [timelineStart, pixelsPerMinute]);

    const getAppointmentDuration = (startTime: string, endTime: string) => {
        return timeToMinutes(endTime) - timeToMinutes(startTime);
    }

    const isPastDate = selectedDate < getTodayLocalISOString();

    const handleSlotClick = (barberId: number, e: React.MouseEvent<HTMLDivElement>) => {
        if (isPastDate || !currentUserPermissions?.canCreateAppointment) return;

        if ((e.target as HTMLElement).closest('.appointment-card') || (e.target as HTMLElement).closest('.unavailable-block')) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;

        const minutesFromStart = Math.floor(offsetY / pixelsPerMinute);
        const snappedMinutes = Math.floor(minutesFromStart / 15) * 15;
        
        const totalMinutes = timeToMinutes(timelineStart) + snappedMinutes;
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

    const dayOperatingHours = operatingHours ? operatingHours[dayOfWeek] : null;
    
    const UnavailableBlock: React.FC<{ top: number; height: number; label: string }> = ({ top, height, label }) => {
        if (height <= 0) return null;
        
        return (
            <div
                className="absolute w-full px-1 z-0 unavailable-block"
                style={{ top: `${top}px`, height: `${height}px` }}
            >
                <div className="h-full rounded-lg bg-gray-100/70 border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                     <div className="w-full h-full flex items-start">
                        <div className="w-1.5 h-full bg-gray-300/80 flex-shrink-0" />
                        <div className="pl-2 pt-1">
                             <span className="font-medium text-xs text-gray-400">{label}</span>
                        </div>
                    </div>
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
                 <div className="flex items-center space-x-2 h-10">
                    <div className="relative h-full">
                        <button onClick={() => setIsCalendarOpen(prev => !prev)} className="h-full flex items-center space-x-3 px-4 border border-gray-200 rounded-lg bg-white cursor-pointer shadow-sm hover:bg-gray-50">
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
                    <button onClick={handleTodayClick} className="h-full px-4 border border-gray-200 rounded-lg bg-white font-semibold text-sm text-gray-700 hover:bg-gray-50 shadow-sm">Hoje</button>
                </div>
                {currentUserPermissions?.canCreateAppointment && (
                    <button 
                        onClick={handleOpenModal} 
                        disabled={isPastDate}
                        className="h-10 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Novo Agendamento</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-md">
                <div className="flex border-b border-gray-200 pr-4">
                    <div className="w-24 flex-shrink-0"></div> {/* Time column spacer */}
                    <div className="flex-1 grid" style={{gridTemplateColumns: `repeat(${activeBarbers.length}, 1fr)`}}>
                         {activeBarbers.map(barber => (
                            <div key={barber.id} className="p-4 text-center border-l border-gray-100 first:border-l-0">
                                <img src={barber.avatarUrl} alt={barber.name} className="w-12 h-12 rounded-full mx-auto mb-2"/>
                                <p className="font-semibold text-gray-700">{barber.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="overflow-y-scroll" style={{ height: 'calc(100vh - 280px)' }}>
                    <div className="flex relative">
                        <div className="w-24 flex-shrink-0 text-right pr-4 pt-4">
                            {timeSlots.map(time => (
                                <div key={time} style={{height: `${timeSlotHeight}px`}} className="relative">
                                    {time.endsWith(':00') && <span className="text-xs text-gray-500 absolute -top-2 right-4">{time}</span>}
                                </div>
                            ))}
                        </div>
                        <div className="flex-1 grid relative" style={{gridTemplateColumns: `repeat(${activeBarbers.length}, 1fr)`}}>
                            {/* Background Lines */}
                            <div className="absolute inset-0">
                                {timeSlots.map((_, index) => (
                                    <div key={index} style={{height: `${timeSlotHeight}px`}} className={`border-t border-gray-100 ${index % 2 !== 0 ? '' : 'border-dashed'}`}></div>
                                ))}
                            </div>
                            
                            {/* Barber columns with appointments */}
                            {activeBarbers.map((barber, index) => {
                                const isShopOpen = dayOperatingHours?.isOpen ?? false;
                                const barberSchedule = barber;
    
                                return (
                                <div 
                                    key={barber.id}
                                    className={`relative ${index > 0 ? 'border-l border-gray-100' : ''} ${isPastDate ? 'cursor-not-allowed' : ''}`}
                                    onClick={(e) => handleSlotClick(barber.id, e)}
                                >
                                    {/* Unavailable slots renderer */}
                                    <div className="absolute inset-0">
                                        {!isShopOpen || !dayOperatingHours || !barberSchedule ? (
                                            <div 
                                                className="absolute inset-0 bg-slate-50 bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,theme(colors.slate.200)_4px,theme(colors.slate.200)_5px)] z-0 flex items-center justify-center p-2"
                                            >
                                                <span className="font-bold text-slate-400 transform -rotate-12 bg-slate-50/70 px-4 py-2 rounded-md shadow-sm">Barbearia Fechada</span>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Before Shop opens */}
                                                <UnavailableBlock 
                                                    top={0}
                                                    height={timeToPosition(dayOperatingHours.openTime)}
                                                    label="Agenda Bloqueada"
                                                />
                                                {/* Barber absent before work */}
                                                <UnavailableBlock 
                                                    top={timeToPosition(dayOperatingHours.openTime)}
                                                    height={timeToPosition(barberSchedule.workStartTime) - timeToPosition(dayOperatingHours.openTime)}
                                                    label="Agenda Bloqueada"
                                                />

                                                {/* Lunch Break */}
                                                {barberSchedule.lunchStartTime && barberSchedule.lunchEndTime && (
                                                    <UnavailableBlock 
                                                        top={timeToPosition(barberSchedule.lunchStartTime)}
                                                        height={getAppointmentDuration(barberSchedule.lunchStartTime, barberSchedule.lunchEndTime) * pixelsPerMinute}
                                                        label="Agenda Bloqueada"
                                                    />
                                                )}
                                                
                                                {/* Barber absent after work */}
                                                <UnavailableBlock
                                                    top={timeToPosition(barberSchedule.workEndTime)}
                                                    height={timeToPosition(dayOperatingHours.closeTime) - timeToPosition(barberSchedule.workEndTime)}
                                                    label="Agenda Bloqueada"
                                                />

                                                {/* After Shop closes */}
                                                <UnavailableBlock
                                                    top={timeToPosition(dayOperatingHours.closeTime)}
                                                    height={timeToPosition(timelineEnd) - timeToPosition(dayOperatingHours.closeTime)}
                                                    label="Agenda Bloqueada"
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
                                        
                                        const cardBaseClasses = "rounded-lg flex h-full overflow-hidden shadow-sm transition-colors";
                                        const interactiveClasses = "bg-blue-100 border border-blue-300 cursor-pointer hover:bg-blue-200";
                                        const pastClasses = "bg-gray-100 border border-gray-200 cursor-default";
                                        const cardSideBorderBase = "w-1.5 flex-shrink-0";
                                        const interactiveSideBorder = "bg-blue-600";
                                        const pastSideBorder = "bg-gray-400";
                                        
                                        return (
                                            <div 
                                                key={app.id} 
                                                className="absolute w-full px-1 z-10 appointment-card"
                                                style={{ top: `${top}px`, height: `${height}px` }}
                                            >
                                               <div 
                                                    onClick={() => !isPastDate && handleAppointmentClick(app)}
                                                    title={tooltipText}
                                                    className={`${cardBaseClasses} ${isPastDate ? pastClasses : interactiveClasses}`}
                                                >
                                                    <div className={`${cardSideBorderBase} ${isPastDate ? pastSideBorder : interactiveSideBorder}`}></div>
                                                    <div className="p-2 overflow-hidden flex-grow">
                                                        <p className={`font-semibold text-sm truncate ${isPastDate ? 'text-gray-600' : 'text-blue-900'}`}>{client?.name}</p>
                                                        <p className="text-xs text-gray-600 truncate">{app.startTime} - {app.endTime}</p>
                                                        <p className="text-xs text-gray-600 truncate">{service?.name}</p>
                                                    </div>
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
                canCancel={!isPastDate && !!currentUserPermissions?.canCancelAppointment}
                canEdit={!isPastDate && !!currentUserPermissions?.canCreateAppointment}
                clients={clients}
                services={services}
                barbers={barbers}
            />
        </>
    );
};

export default AgendaPage;
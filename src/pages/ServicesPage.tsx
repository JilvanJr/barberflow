import React, { useState, useCallback, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { Service, Role } from '../types';
import { PlusIcon, XIcon, AlertTriangleIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon, SearchIcon } from '../components/icons';

type StatusFilter = 'all' | 'active' | 'inactive';

const FormError: React.FC<{ message?: string }> = ({ message }) => {
    if (!message) return null;
    return (
        <div className="flex items-center text-red-600 text-xs mt-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75(1.334)-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
        </div>
    );
};

// Modal para CRIAR um novo serviço
const ServiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Service) => void;
    services: Service[];
}> = ({ isOpen, onClose, onSave, services }) => {
    const [formData, setFormData] = useState<Partial<Service>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', price: undefined, duration: undefined });
            setErrors({});
        }
    }, [isOpen]);

    const validateField = (name: keyof Service, value: any): string => {
        switch (name) {
            case 'name':
                return !value?.trim() ? 'O nome do serviço é obrigatório.' : '';
            case 'price':
                if (value === undefined || value === null || value <= 0) {
                    return 'O preço deve ser um número positivo.';
                }
                return '';
            case 'duration':
                 if (value === undefined || value === null || value <= 0) {
                    return 'A duração deve ser um número positivo.';
                }
                if (!Number.isInteger(Number(value))) {
                    return 'A duração deve ser em minutos (número inteiro).';
                }
                return '';
            default:
                return '';
        }
    };
    
    const handleInputChange = (field: keyof Service, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
        }
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof Service;
        setErrors(prev => ({...prev, [fieldName]: validateField(fieldName, value)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors: Record<string, string> = {};
        const fieldsToValidate: (keyof Service)[] = ['name', 'price', 'duration'];
        
        const trimmedName = formData.name?.trim().toLowerCase() || '';
        if (services.some(s => s.name.trim().toLowerCase() === trimmedName)) {
            validationErrors.name = 'Este nome de serviço já existe.';
        }
        
        fieldsToValidate.forEach(key => {
            const error = validateField(key, formData[key]);
            if(error && !validationErrors[key]) validationErrors[key] = error;
        });

        setErrors(validationErrors);
        if (Object.values(validationErrors).every(v => !v)) {
            const processedData: Partial<Service> = {
                ...formData,
                price: Number(formData.price),
                duration: Number(formData.duration)
            }
            onSave(processedData as Service);
        }
    };
    
    if (!isOpen) return null;

    const inputClasses = "w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 placeholder:italic placeholder:text-gray-400";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-md transform transition-all overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Novo Serviço</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 space-y-5">
                        <div>
                            <label className={labelClasses}>Nome do Serviço</label>
                            <input type="text" name="name" placeholder="Ex: Corte de Cabelo" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} onBlur={handleBlur} className={inputClasses} />
                            <FormError message={errors.name} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Preço (R$)</label>
                                <input type="number" name="price" step="0.01" placeholder="0,00" value={formData.price || ''} onChange={e => handleInputChange('price', e.target.value)} onBlur={handleBlur} className={inputClasses} />
                                <FormError message={errors.price} />
                            </div>
                            <div>
                                <label className={labelClasses}>Duração (minutos)</label>
                                <input type="number" name="duration" placeholder="30" value={formData.duration || ''} onChange={e => handleInputChange('duration', e.target.value)} onBlur={handleBlur} className={inputClasses} />
                                <FormError message={errors.duration} />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t">
                        <div className="flex items-center space-x-4">
                            <button type="button" onClick={onClose} className="flex-1 text-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100">
                                Cancelar
                            </button>
                            <button type="submit" className="flex-1 text-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                Salvar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ServiceDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Service) => void;
    service: Service | null;
    services: Service[];
}> = ({ isOpen, onClose, onSave, service, services }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Service>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (service) {
            setFormData(service);
            setIsEditing(false);
            setErrors({});
        }
    }, [service]);

    const validateField = (name: keyof Service, value: any): string => {
        switch (name) {
            case 'name':
                return !value?.trim() ? 'O nome do serviço é obrigatório.' : '';
            case 'price':
                if (value === undefined || value === null || value <= 0) {
                    return 'O preço deve ser um número positivo.';
                }
                return '';
            case 'duration':
                 if (value === undefined || value === null || value <= 0) {
                    return 'A duração deve ser um número positivo.';
                }
                if (!Number.isInteger(Number(value))) {
                    return 'A duração deve ser em minutos (número inteiro).';
                }
                return '';
            default:
                return '';
        }
    };
    
    const handleInputChange = (field: keyof Service, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof Service;
        setErrors(prev => ({ ...prev, [fieldName]: validateField(fieldName, value) }));
    };
    
    const handleSave = () => {
        const validationErrors: Record<string, string> = {};
        const fieldsToValidate: (keyof Service)[] = ['name', 'price', 'duration'];
        
        const trimmedName = formData.name?.trim().toLowerCase() || '';
        if (services.some(s => s.id !== formData.id && s.name.trim().toLowerCase() === trimmedName)) {
            validationErrors.name = 'Este nome de serviço já existe.';
        }
        
        fieldsToValidate.forEach(key => {
            const error = validateField(key, formData[key]);
            if (error && !validationErrors[key]) validationErrors[key] = error;
        });

        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            onSave(formData as Service);
            setIsEditing(false);
        }
    };
    
    const handleCancel = () => {
        setIsEditing(false);
        if (service) setFormData(service);
        setErrors({});
    };

    if (!isOpen || !service) return null;

    const inputClasses = "w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 disabled:bg-gray-100 disabled:text-gray-500 placeholder:italic placeholder:text-gray-400";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";
    const toggleBgClass = formData.status === 'active' 
        ? (isEditing ? 'bg-blue-600' : 'bg-gray-300') 
        : 'bg-gray-200';

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-md transform transition-all overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Detalhes do Serviço</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 space-y-4">
                     <div>
                        <label className={labelClasses}>Nome do Serviço</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} onBlur={handleBlur} className={inputClasses} disabled={!isEditing} />
                        <FormError message={errors.name} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Preço (R$)</label>
                            <input type="number" name="price" step="0.01" value={formData.price || ''} onChange={e => handleInputChange('price', e.target.value)} onBlur={handleBlur} className={inputClasses} disabled={!isEditing} />
                            <FormError message={errors.price} />
                        </div>
                        <div>
                            <label className={labelClasses}>Duração (minutos)</label>
                            <input type="number" name="duration" value={formData.duration || ''} onChange={e => handleInputChange('duration', e.target.value)} onBlur={handleBlur} className={inputClasses} disabled={!isEditing} />
                            <FormError message={errors.duration} />
                        </div>
                    </div>
                    <div className="border-t pt-4">
                         <label htmlFor="service-status-toggle" className={`flex items-center justify-between ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                            <span className="text-sm font-medium text-gray-700">Status</span>
                             <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${toggleBgClass}`}>
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${formData.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </label>
                         <input id="service-status-toggle" type="checkbox" className="sr-only" checked={formData.status === 'active'} disabled={!isEditing} onChange={e => handleInputChange('status', e.target.checked ? 'active' : 'inactive')} />
                    </div>
                </div>
                <div className="p-6 bg-gray-50 border-t">
                    <div className="flex items-center space-x-4">
                        {isEditing ? (
                            <>
                                <button onClick={handleCancel} className="flex-1 text-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100">Cancelar</button>
                                <button onClick={handleSave} className="flex-1 text-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Salvar Alterações</button>
                            </>
                        ) : (
                            <>
                                <button onClick={onClose} className="flex-1 text-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100">Fechar</button>
                                <button onClick={() => setIsEditing(true)} className="flex-1 text-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Editar</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    isDestructive: boolean;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDestructive }) => {
    if (!isOpen) return null;
    
    const confirmButtonClasses = isDestructive
        ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
        : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all text-center">
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isDestructive ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <AlertTriangleIcon className={`h-6 w-6 ${isDestructive ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mt-4">{title}</h2>
                <p className="text-gray-600 my-4 text-sm">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 w-36 bg-gray-200 text-gray-800 font-semibold text-sm rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">Cancelar</button>
                    <button type="button" onClick={onConfirm} className={`px-6 py-2.5 w-36 text-white font-semibold text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 ${confirmButtonClasses}`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

const FilterButton: React.FC<{
    filter: StatusFilter;
    label: string;
    currentFilter: StatusFilter;
    onClick: (filter: StatusFilter) => void;
}> = ({ filter, label, currentFilter, onClick }) => (
    <button
        onClick={() => onClick(filter)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${currentFilter === filter ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}
    >
        {label}
    </button>
);

export const ServicesPage: React.FC = () => {
    const context = useContext(AppContext);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Service | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [serviceToToggle, setServiceToToggle] = useState<Service | null>(null);
    
    if (!context || !context.currentUser || context.currentUser.role === Role.CLIENT) {
        return <div className="text-center p-8">Acesso não autorizado.</div>;
    }
    const { currentUser, showToast } = context;
    const currentUserPermissions = currentUser.permissions;

    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getServices();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

     useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, itemsPerPage]);

    const requestSort = (key: keyof Service) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const processedServices = useMemo(() => {
        let sortableServices = services
            .filter(service => {
                if (statusFilter === 'all') return true;
                return service.status === statusFilter;
            })
            .filter(service =>
                service.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

        if (sortConfig.key) {
            sortableServices.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableServices;
    }, [services, searchTerm, statusFilter, sortConfig]);

    const paginatedServices = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedServices.slice(startIndex, startIndex + itemsPerPage);
    }, [processedServices, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(processedServices.length / itemsPerPage);

    const handleAddNew = () => {
        setIsCreateModalOpen(true);
    };

    const handleViewDetails = (service: Service) => {
        setSelectedService(service);
        setIsDetailsModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (serviceToToggle) {
            try {
                await api.updateService(serviceToToggle.id!, serviceToToggle);
                showToast('Status do serviço atualizado com sucesso!', 'success');
                fetchServices();
            } catch (error) {
                console.error("Failed to update service status", error);
                showToast('Falha ao atualizar o status do serviço.', 'error');
            } finally {
                setIsConfirmModalOpen(false);
                setServiceToToggle(null);
                setIsDetailsModalOpen(false);
            }
        }
    };

    const handleSave = useCallback(async (serviceToSave: Service) => {
        try {
            if (serviceToSave.id) { // UPDATE
                const originalService = services.find(s => s.id === serviceToSave.id);
                if (originalService && originalService.status !== serviceToSave.status) {
                    setServiceToToggle(serviceToSave);
                    setIsConfirmModalOpen(true);
                } else {
                    await api.updateService(serviceToSave.id, serviceToSave);
                    showToast('Serviço atualizado com sucesso!', 'success');
                    setIsDetailsModalOpen(false);
                    fetchServices();
                }
            } else { // CREATE
                await api.createService(serviceToSave);
                showToast('Serviço salvo com sucesso!', 'success');
                setIsCreateModalOpen(false);
                setSortConfig({ key: 'name', direction: 'ascending' });
                fetchServices();
            }
        } catch(error) {
             console.error("Failed to save service", error);
            showToast("Falha ao salvar o serviço.", 'error');
        }
    }, [services, fetchServices, showToast]);

    const SortableHeader: React.FC<{ columnKey: keyof Service; title: string; }> = ({ columnKey, title }) => {
        const isSorted = sortConfig.key === columnKey;
        const icon = isSorted 
            ? (sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-4 h-4 ml-1 text-gray-800" /> : <ArrowDownIcon className="w-4 h-4 ml-1 text-gray-800" />) 
            : <div className="w-4 h-4 ml-1" />;
        
        return (
             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button onClick={() => requestSort(columnKey)} className="flex items-center group">
                    <span className="group-hover:text-gray-900">{title}</span>
                    {icon}
                </button>
            </th>
        );
    };
    
    if (isLoading) {
        return <div className="text-center p-8">Carregando serviços...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center space-x-2">
                    <FilterButton filter="all" label="Todos" currentFilter={statusFilter} onClick={setStatusFilter} />
                    <FilterButton filter="active" label="Ativos" currentFilter={statusFilter} onClick={setStatusFilter} />
                    <FilterButton filter="inactive" label="Inativos" currentFilter={statusFilter} onClick={setStatusFilter} />
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar serviço..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {currentUserPermissions?.canCreateService && (
                        <button onClick={handleAddNew} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <PlusIcon className="w-5 h-5" />
                            <span>Novo Serviço</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <SortableHeader columnKey="name" title="Serviço" />
                            <SortableHeader columnKey="price" title="Preço" />
                            <SortableHeader columnKey="duration" title="Duração" />
                            <SortableHeader columnKey="status" title="Status" />
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedServices.map(service => (
                           <tr key={service.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {Number(service.price).toFixed(2).replace('.', ',')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.duration} min</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {service.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleViewDetails(service)} className="text-gray-500 hover:text-blue-600" title="Ver Detalhes">
                                        <EyeIcon className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {totalPages > 0 && (
                    <div className="py-4 px-6 flex items-center justify-between border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                            Mostrando <span className="font-semibold">{Math.min(processedServices.length, (currentPage - 1) * itemsPerPage + 1)}</span> a <span className="font-semibold">{Math.min(currentPage * itemsPerPage, processedServices.length)}</span> de <span className="font-semibold">{processedServices.length}</span> resultados
                        </span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <span className="text-sm text-gray-700">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                )}
            </div>

             {currentUserPermissions?.canCreateService && (
                <ServiceModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={handleSave} services={services} />
             )}
            
            <ServiceDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                service={selectedService}
                onSave={handleSave}
                services={services}
            />

             <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmToggleStatus}
                title={serviceToToggle?.status === 'active' ? "Reativar Serviço" : "Inativar Serviço"}
                message={
                    serviceToToggle?.status === 'active'
                        ? `Tem certeza que deseja reativar ${serviceToToggle?.name}? O serviço voltará a ficar disponível.`
                        : `Tem certeza que deseja inativar ${serviceToToggle?.name}? O serviço não aparecerá para novos agendamentos.`
                }
                confirmText={serviceToToggle?.status === 'active' ? "Sim, Reativar" : "Sim, Inativar"}
                isDestructive={serviceToToggle?.status === 'inactive'}
            />
        </div>
    );
};

export default ServicesPage;
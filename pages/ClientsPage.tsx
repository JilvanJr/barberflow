import React, { useState, useCallback, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { Client, Role } from '../types';
import { SearchIcon, PlusIcon, EditIcon, XIcon, AlertTriangleIcon, UsersIcon, UserCheckIcon, UserXIcon, EyeIcon, ArrowUpIcon, ArrowDownIcon } from '../components/icons';

type StatusFilter = 'all' | 'active' | 'inactive';

const FormError: React.FC<{ message?: string }> = ({ message }) => {
    if (!message) return null;
    return (
        <div className="flex items-center text-red-600 text-xs mt-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
        </div>
    );
};

// Modal para CRIAR um novo cliente
const ClientModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client) => void;
    client: Partial<Client> | null;
}> = ({ isOpen, onClose, onSave, client }) => {
    const [formData, setFormData] = useState<Partial<Client>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(client || {});
            setErrors({});
        }
    }, [client, isOpen]);
    
    const validateField = (name: keyof Client, value: any): string => {
        switch (name) {
            case 'name':
                return !value?.trim() ? 'O nome é obrigatório.' : '';
            case 'email':
                if (!value) return 'O e-mail é obrigatório.';
                if (!/\S+@\S+\.\S+/.test(value)) return 'Formato de e-mail inválido.';
                return '';
            case 'phone':
                const phoneDigits = value?.replace(/\D/g, '') || '';
                if (!phoneDigits) return 'O telefone é obrigatório.';
                if (phoneDigits.length < 10) return 'O telefone deve ter no mínimo 10 dígitos.';
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (field: keyof Client, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
        }
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof Client;
        setErrors(prev => ({...prev, [fieldName]: validateField(fieldName, value)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors: Record<string, string> = {};
        const requiredFields: (keyof Client)[] = ['name', 'email', 'phone'];

        requiredFields.forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) validationErrors[key] = error;
        });

        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            onSave(formData as Client);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.substring(0, 11);
        
        let formattedValue;
        if (value.length <= 2) {
            formattedValue = `(${value}`;
        } else if (value.length <= 7) {
            formattedValue = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        } else {
            formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
        }
    
        handleInputChange('phone', formattedValue);
    };

    if (!isOpen) return null;

    const inputClasses = "w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Novo Cliente</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className={labelClasses}>Nome</label>
                        <input type="text" name="name" placeholder="Nome completo do cliente" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} onBlur={handleBlur} className={`${inputClasses} placeholder:italic placeholder:text-gray-400`} />
                        <FormError message={errors.name} />
                    </div>
                     <div>
                        <label className={labelClasses}>Email</label>
                        <input type="email" name="email" placeholder="exemplo@email.com" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} onBlur={handleBlur} className={`${inputClasses} placeholder:italic placeholder:text-gray-400`} />
                        <FormError message={errors.email} />
                    </div>
                     <div>
                        <label className={labelClasses}>Telefone</label>
                        <input type="tel" name="phone" placeholder="(11) 99999-9999" value={formData.phone || ''} onChange={handlePhoneChange} onBlur={handleBlur} className={`${inputClasses} placeholder:italic placeholder:text-gray-400`} maxLength={16} />
                        <FormError message={errors.phone} />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">Cancelar</button>
                        <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal para VER e EDITAR um cliente
const ClientDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client) => void;
    client: Client | null;
}> = ({ isOpen, onClose, onSave, client }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Client>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (client) {
            setFormData(client);
            setIsEditing(false);
            setErrors({});
        }
    }, [client]);

    const validateField = (name: keyof Client, value: any): string => {
        switch (name) {
            case 'name':
                return !value?.trim() ? 'O nome é obrigatório.' : '';
            case 'email':
                if (!value) return 'O e-mail é obrigatório.';
                if (!/\S+@\S+\.\S+/.test(value)) return 'Formato de e-mail inválido.';
                return '';
            case 'phone':
                const phoneDigits = value?.replace(/\D/g, '') || '';
                if (!phoneDigits) return 'O telefone é obrigatório.';
                if (phoneDigits.length < 10) return 'O telefone deve ter no mínimo 10 dígitos.';
                return '';
            default:
                return '';
        }
    };
    
    const handleInputChange = (field: keyof Client, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof Client;
        setErrors(prev => ({ ...prev, [fieldName]: validateField(fieldName, value) }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.substring(0, 11);
        
        let formattedValue;
        if (value.length <= 2) {
            formattedValue = `(${value}`;
        } else if (value.length <= 7) {
            formattedValue = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        } else {
            formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
        }
    
        handleInputChange('phone', formattedValue);
    };

    const handleSave = () => {
        const validationErrors: Record<string, string> = {};
        const requiredFields: (keyof Client)[] = ['name', 'email', 'phone'];
        requiredFields.forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) validationErrors[key] = error;
        });

        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            onSave(formData as Client);
            setIsEditing(false);
        }
    };
    
    const handleCancel = () => {
        setIsEditing(false);
        if (client) setFormData(client);
        setErrors({});
    };

    if (!isOpen || !client) return null;

    const inputClasses = "w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-200 disabled:text-gray-500";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Detalhes do Cliente</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className={labelClasses}>Nome</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} onBlur={handleBlur} className={inputClasses} disabled={!isEditing} />
                        <FormError message={errors.name} />
                    </div>
                    <div>
                        <label className={labelClasses}>Email</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} onBlur={handleBlur} className={inputClasses} disabled={!isEditing} />
                        <FormError message={errors.email} />
                    </div>
                    <div>
                        <label className={labelClasses}>Telefone</label>
                        <input type="tel" name="phone" value={formData.phone || ''} onChange={handlePhoneChange} onBlur={handleBlur} className={inputClasses} maxLength={16} disabled={!isEditing} />
                        <FormError message={errors.phone} />
                    </div>
                    <div>
                        <label className={labelClasses}>Situação</label>
                        {!isEditing ? (
                            <span className={`px-2.5 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${formData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {formData.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                        ) : (
                            <select name="status" value={formData.status || ''} onChange={e => handleInputChange('status', e.target.value)} onBlur={handleBlur} className={inputClasses}>
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                            </select>
                        )}
                    </div>
                </div>
                <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-200 space-x-3">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="px-6 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Salvar Alterações</button>
                        </>
                    ) : (
                        <>
                            <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Fechar</button>
                            <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Editar</button>
                        </>
                    )}
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
                <p className="text-gray-600 my-4">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 w-full bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">Cancelar</button>
                    <button type="button" onClick={onConfirm} className={`px-6 py-2.5 w-full text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 ${confirmButtonClasses}`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.FC<any>, title: string, value: number, color: 'blue' | 'green' | 'gray' }> = ({ icon: Icon, title, value, color }) => {
    const colorClasses = {
        blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
        green: { bg: 'bg-green-100', text: 'text-green-800' },
        gray: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };
    const selectedColor = colorClasses[color];

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
            <div className={`p-3 rounded-full ${selectedColor.bg}`}>
                <Icon className={`w-6 h-6 ${selectedColor.text}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
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

const ClientsPage: React.FC = () => {
    const context = useContext(AppContext);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Client | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [clientToToggle, setClientToToggle] = useState<Client | null>(null);

    if (!context || !context.currentUser || context.currentUser.role === Role.CLIENT) {
        return <div className="text-center p-8">Acesso não autorizado.</div>;
    }
    const { currentUser } = context;
    const currentUserPermissions = currentUser.permissions;

    const fetchClients = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getClients();
            setClients(data);
        } catch (error) {
            console.error("Failed to fetch clients", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, itemsPerPage]);

    const requestSort = (key: keyof Client) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const processedClients = useMemo(() => {
        let sortableClients = clients
            .filter(client => {
                if (statusFilter === 'all') return true;
                return client.status === statusFilter;
            })
            .filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase())
            );

        if (sortConfig.key) {
            sortableClients.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
    
        return sortableClients;
    }, [clients, searchTerm, statusFilter, sortConfig]);

    const paginatedClients = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedClients.slice(startIndex, startIndex + itemsPerPage);
    }, [processedClients, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(processedClients.length / itemsPerPage);

    const handleAddNew = () => {
        setIsCreateModalOpen(true);
    };
    
    const handleViewDetails = (client: Client) => {
        setSelectedClient(client);
        setIsDetailsModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (clientToToggle) {
            try {
                await api.updateClient(clientToToggle.id!, clientToToggle);
                fetchClients();
            } catch (error) {
                console.error("Failed to update client status", error);
                alert('Falha ao atualizar o status do cliente.');
            } finally {
                setIsConfirmModalOpen(false);
                setClientToToggle(null);
                setIsDetailsModalOpen(false); // Close details modal after action
            }
        }
    };

    const handleSave = useCallback(async (clientToSave: Client) => {
        try {
            if (clientToSave.id) { // UPDATE
                const originalClient = clients.find(c => c.id === clientToSave.id);
                if (originalClient && originalClient.status !== clientToSave.status) {
                    setClientToToggle(clientToSave);
                    setIsConfirmModalOpen(true);
                } else {
                    await api.updateClient(clientToSave.id, clientToSave);
                    setIsDetailsModalOpen(false);
                    fetchClients();
                }
            } else { // CREATE
                await api.createClient(clientToSave);
                setIsCreateModalOpen(false);
                fetchClients();
            }
        } catch (error) {
            console.error("Failed to save client", error);
            alert('Falha ao salvar o cliente.');
        }
    }, [clients, fetchClients]);
    
    const activeClients = useMemo(() => clients.filter(c => c.status === 'active').length, [clients]);
    const inactiveClients = useMemo(() => clients.filter(c => c.status === 'inactive').length, [clients]);

    const SortableHeader: React.FC<{ columnKey: keyof Client; title: string; }> = ({ columnKey, title }) => {
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
        return <div className="text-center p-8">Carregando clientes...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h1>
                <p className="text-sm text-gray-500">Adicione, edite e gerencie as informações dos seus clientes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard icon={UsersIcon} title="Total de Clientes" value={clients.length} color="blue" />
                <StatCard icon={UserCheckIcon} title="Clientes Ativos" value={activeClients} color="green" />
                <StatCard icon={UserXIcon} title="Clientes Inativos" value={inactiveClients} color="gray" />
            </div>

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
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {currentUserPermissions?.canCreateClient && (
                        <button onClick={handleAddNew} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <PlusIcon className="w-5 h-5" />
                            <span>Novo Cliente</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <SortableHeader columnKey="name" title="Nome" />
                            <SortableHeader columnKey="phone" title="Contato" />
                            <SortableHeader columnKey="status" title="Status" />
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedClients.map(client => (
                            <tr key={client.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {client.phone}
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {client.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleViewDetails(client)} className="text-gray-500 hover:text-blue-600" title="Ver Detalhes">
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
                            Mostrando <span className="font-semibold">{Math.min(processedClients.length, (currentPage - 1) * itemsPerPage + 1)}</span> a <span className="font-semibold">{Math.min(currentPage * itemsPerPage, processedClients.length)}</span> de <span className="font-semibold">{processedClients.length}</span> resultados
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
            
            {currentUserPermissions?.canCreateClient && (
                <ClientModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={handleSave} client={{ name: '', email: '', phone: '', status: 'active' }} />
            )}
            
            <ClientDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                client={selectedClient}
                onSave={handleSave}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmToggleStatus}
                title={clientToToggle?.status === 'active' ? "Reativar Cliente" : "Inativar Cliente"}
                message={
                    clientToToggle?.status === 'active'
                        ? `Tem certeza que deseja reativar ${clientToToggle?.name}? O cliente voltará a ficar disponível para novos agendamentos.`
                        : `Tem certeza que deseja inativar ${clientToToggle?.name}? O cliente não aparecerá para novos agendamentos, mas seu histórico será mantido.`
                }
                confirmText={clientToToggle?.status === 'active' ? "Sim, Reativar" : "Sim, Inativar"}
                isDestructive={clientToToggle?.status === 'inactive'}
            />
        </div>
    );
};

export default ClientsPage;
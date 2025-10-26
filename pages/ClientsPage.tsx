
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { Client, Role, User } from '../types';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, XIcon, AlertTriangleIcon } from '../components/icons';

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
            case 'birthDate':
                if (value && value.length > 0 && value.length < 10) {
                    return 'Complete a data no formato DD/MM/AAAA.';
                }
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (field: keyof Client, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Re-validate the field as the user types, if it had an error
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
        (Object.keys(formData) as Array<keyof Client>).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                validationErrors[key] = error;
            }
        });
        
        // Also validate required fields that might be missing from formData initially
        if (!formData.name) validationErrors.name = validateField('name', formData.name);
        if (!formData.email) validationErrors.email = validateField('email', formData.email);
        if (!formData.phone) validationErrors.phone = validateField('phone', formData.phone);


        setErrors(validationErrors);
        if (Object.values(validationErrors).every(v => !v)) {
            onSave(formData as Client);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        
        let formattedValue = value;
        if (value.length > 0) formattedValue = `(${value.substring(0, 2)}`;
        if (value.length >= 3) formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}`;
        if (value.length >= 8) formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;

        handleInputChange('phone', formattedValue);
    };

    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.substring(0, 8);

        let formattedValue = value;
        if (value.length > 2) formattedValue = `${value.substring(0, 2)}/${value.substring(2)}`;
        if (value.length > 4) formattedValue = `${value.substring(0, 2)}/${value.substring(2, 4)}/${value.substring(4)}`;
        
        handleInputChange('birthDate', formattedValue);
    }

    if (!isOpen) return null;

    const inputClasses = "w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{client?.id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className={labelClasses}>Nome</label>
                        <input type="text" name="name" placeholder="Manuel Neuer" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} onBlur={handleBlur} className={inputClasses} />
                        <FormError message={errors.name} />
                    </div>
                     <div>
                        <label className={labelClasses}>Email</label>
                        <input type="email" name="email" placeholder="client@barberflow.com" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} onBlur={handleBlur} className={inputClasses} />
                        <FormError message={errors.email} />
                    </div>
                     <div>
                        <label className={labelClasses}>Telefone</label>
                        <input type="tel" name="phone" placeholder="(11) 9 1234-5678" value={formData.phone || ''} onChange={handlePhoneChange} onBlur={handleBlur} className={inputClasses} maxLength={16} />
                        <FormError message={errors.phone} />
                    </div>
                     <div>
                        <label className={labelClasses}>Data de Nascimento (Opcional)</label>
                        <input type="text" name="birthDate" placeholder="DD/MM/AAAA" value={formData.birthDate || ''} onChange={handleBirthDateChange} onBlur={handleBlur} className={inputClasses} maxLength={10} />
                        <FormError message={errors.birthDate} />
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

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mt-4">{title}</h2>
                <p className="text-gray-600 my-4">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-2.5 w-full bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        className="px-6 py-2.5 w-full bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                        Sim, Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};

const ClientsPage: React.FC = () => {
    const context = useContext(AppContext);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [clientToDeleteId, setClientToDeleteId] = useState<number | null>(null);

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

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddNew = () => {
        setEditingClient({
            name: '', email: '', phone: '', cpf: '', birthDate: '', role: Role.CLIENT
        });
        setIsModalOpen(true);
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };
    
    const handleDelete = (clientId: number) => {
        setClientToDeleteId(clientId);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (clientToDeleteId) {
            try {
                await api.deleteClient(clientToDeleteId);
                setClients(prevClients => prevClients.filter(c => c.id !== clientToDeleteId));
            } catch (error) {
                console.error("Failed to delete client", error);
                alert('Falha ao excluir o cliente.');
            } finally {
                setIsConfirmModalOpen(false);
                setClientToDeleteId(null);
            }
        }
    };

    const handleSave = useCallback(async (clientToSave: Client) => {
        try {
            if (clientToSave.id) {
                await api.updateClient(clientToSave.id, clientToSave);
            } else {
                await api.createClient(clientToSave);
            }
            setIsModalOpen(false);
            fetchClients(); // Refetch to get the latest data
        } catch (error) {
            console.error("Failed to save client", error);
            alert('Falha ao salvar o cliente.');
        }
    }, [fetchClients]);

    if (isLoading) {
        return <div className="text-center p-8">Carregando clientes...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Clientes</h2>
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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                            {(currentUserPermissions?.canEditClient || currentUserPermissions?.canDeleteClient) && (
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClients.map(client => (
                            <tr key={client.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                                {(currentUserPermissions?.canEditClient || currentUserPermissions?.canDeleteClient) && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {currentUserPermissions?.canEditClient && <button onClick={() => handleEdit(client)} className="text-blue-600 hover:text-blue-900"><EditIcon className="w-5 h-5"/></button>}
                                        {currentUserPermissions?.canDeleteClient && <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {(currentUserPermissions?.canCreateClient || currentUserPermissions?.canEditClient) && (
                <ClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} client={editingClient} />
            )}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
            />
        </div>
    );
};

export default ClientsPage;
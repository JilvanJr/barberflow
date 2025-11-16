import React, { useState, useCallback, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { User, Role } from '../types';
import { PlusIcon, XIcon, ShieldCheckIcon, SearchIcon, ClockIcon, ImageIcon, EditIcon, EyeIcon, ArrowUpIcon, ArrowDownIcon } from '../components/icons';

type StatusFilterType = 'all' | 'active' | 'inactive';

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

const FilterButton: React.FC<{
    filter: StatusFilterType;
    label: string;
    currentFilter: StatusFilterType;
    onClick: (filter: StatusFilterType) => void;
}> = ({ filter, label, currentFilter, onClick }) => (
    <button
        onClick={() => onClick(filter)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${currentFilter === filter ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}
    >
        {label}
    </button>
);

const TimeInput: React.FC<{label: string, value: string, onChange: (val: string) => void, disabled?: boolean}> = ({label, value, onChange, disabled}) => (
    <div className="relative">
         <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
                type="time"
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pl-9 disabled:bg-gray-100 disabled:text-gray-500"
            />
        </div>
    </div>
);

const NewTeamMemberModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>) => void;
    users: User[];
}> = ({ isOpen, onClose, onSave, users }) => {
    const [formData, setFormData] = useState<Partial<User>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if(isOpen) {
            setFormData({
                name: '',
                email: '',
                phone: '',
                jobTitle: 'Barbeiro',
                accessProfile: 'Barbeiro',
                avatarUrl: '',
                workStartTime: '09:00',
                workEndTime: '18:00',
                lunchStartTime: '12:00',
                lunchEndTime: '13:00',
            });
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors: Record<string, string> = {};
        const phoneDigits = formData.phone?.replace(/\D/g, '') || '';

        if (!formData.name?.trim()) {
            validationErrors.name = 'O nome é obrigatório.';
        }
        if (!formData.email?.trim()) {
            validationErrors.email = 'O e-mail é obrigatório.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            validationErrors.email = 'Formato de e-mail inválido.';
        } else if (users.some(u => u.email.toLowerCase() === formData.email?.toLowerCase())) {
            validationErrors.email = 'Este e-mail já está em uso.';
        }
        
        if (!phoneDigits) {
            validationErrors.phone = 'O telefone é obrigatório.';
        } else if (phoneDigits.length < 10) {
            validationErrors.phone = 'O telefone deve ter no mínimo 10 dígitos.';
        }


        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            onSave(formData);
        }
    };

    const handleInputChange = (field: keyof User, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
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

    const inputClasses = "w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 placeholder:italic placeholder:text-gray-400";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Novo Profissional</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden" noValidate>
                    <div className="p-6 space-y-5 overflow-y-auto">
                        <div>
                            <label className={labelClasses}>Nome</label>
                            <input type="text" placeholder="Nome completo do profissional" required value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} className={inputClasses} />
                            <FormError message={errors.name} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>E-mail</label>
                                <input type="email" placeholder="E-mail de acesso" required value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} className={inputClasses} />
                                <FormError message={errors.email} />
                            </div>
                            <div>
                                <label className={labelClasses}>Telefone</label>
                                <input type="tel" placeholder="(00) 00000-0000" required value={formData.phone || ''} onChange={handlePhoneChange} className={inputClasses} maxLength={16}/>
                                <FormError message={errors.phone} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Função</label>
                                <select value={formData.jobTitle || 'Barbeiro'} onChange={e => handleInputChange('jobTitle', e.target.value)} className={inputClasses}>
                                    <option>Barbeiro</option>
                                    <option>Recepcionista</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Perfil de acesso</label>
                                <select value={formData.accessProfile || 'Barbeiro'} onChange={e => handleInputChange('accessProfile', e.target.value as User['accessProfile'])} className={inputClasses}>
                                    <option>Admin</option>
                                    <option>Barbeiro</option>
                                    <option>Recepcionista</option>
                                </select>
                            </div>
                        </div>
                        
                        {formData.accessProfile !== 'Admin' && (
                            <>
                                <div className="border-t pt-5">
                                    <p className="text-base font-medium text-gray-800 mb-2">Jornada de Trabalho</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <TimeInput label="Início do expediente" value={formData.workStartTime || ''} onChange={val => handleInputChange('workStartTime', val)} />
                                        <TimeInput label="Fim do expediente" value={formData.workEndTime || ''} onChange={val => handleInputChange('workEndTime', val)} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-base font-medium text-gray-800 mb-2">Intervalo (Almoço)</p>
                                    <div className="grid grid-cols-2 gap-4">
                                    <TimeInput label="Início do intervalo" value={formData.lunchStartTime || ''} onChange={val => handleInputChange('lunchStartTime', val)} />
                                        <TimeInput label="Fim do intervalo" value={formData.lunchEndTime || ''} onChange={val => handleInputChange('lunchEndTime', val)} />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="border-t pt-5">
                           <button type="button" className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <ImageIcon className="w-5 h-5 text-gray-500"/>
                                Importar foto
                           </button>
                        </div>
                    </div>
                    <div className="p-6 flex justify-end items-center space-x-3 bg-gray-50 border-t">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100">
                            Cancelar
                        </button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TeamMemberDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: User | null;
    users: User[];
}> = ({ isOpen, onClose, onSave, user, users }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    useEffect(() => {
        if(user) {
            setFormData(user);
        }
        setErrors({});
        setIsEditing(false);
    }, [user, isOpen]);

    if (!isOpen || !user) return null;

    const handleSave = () => {
        const validationErrors: Record<string, string> = {};
        const phoneDigits = formData.phone?.replace(/\D/g, '') || '';

        if (!formData.name?.trim()) {
            validationErrors.name = 'O nome é obrigatório.';
        }
         if (!phoneDigits) {
            validationErrors.phone = 'O telefone é obrigatório.';
        } else if (phoneDigits.length < 10) {
            validationErrors.phone = 'O telefone deve ter no mínimo 10 dígitos.';
        }

        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            onSave(formData as User);
            setIsEditing(false);
        }
    };
    
    const handleInputChange = (field: keyof User, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if(errors[field]) {
            setErrors(prev => ({...prev, [field]: ''}));
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

    const handleCancel = () => {
        setIsEditing(false);
        if (user) setFormData(user);
        setErrors({});
    }

    const inputClasses = "w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 disabled:bg-gray-100 disabled:text-gray-500 placeholder:italic placeholder:text-gray-400";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";
    const toggleBgClass = formData.status === 'active' 
        ? (isEditing ? 'bg-blue-600' : 'bg-gray-300') 
        : 'bg-gray-200';

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                     <h2 className="text-2xl font-bold text-gray-800">Detalhes do Profissional</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                 <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label className={labelClasses}>Nome</label>
                            <input type="text" disabled={!isEditing} value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} className={inputClasses} />
                             <FormError message={errors.name} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className={labelClasses}>E-mail</label>
                                <input type="email" disabled value={formData.email || ''} className={`${inputClasses} cursor-not-allowed`} />
                            </div>
                            <div>
                                <label className={labelClasses}>Telefone</label>
                                <input type="tel" disabled={!isEditing} placeholder="(00) 00000-0000" value={formData.phone || ''} onChange={handlePhoneChange} className={inputClasses} maxLength={16}/>
                                <FormError message={errors.phone} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Função</label>
                                <select disabled={!isEditing} value={formData.jobTitle || ''} onChange={e => handleInputChange('jobTitle', e.target.value)} className={inputClasses}>
                                    <option>Barbeiro</option>
                                    <option>Recepcionista</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Perfil de acesso</label>
                                <select disabled={!isEditing} value={formData.accessProfile || ''} onChange={e => handleInputChange('accessProfile', e.target.value as User['accessProfile'])} className={inputClasses}>
                                    <option>Admin</option>
                                    <option>Barbeiro</option>
                                    <option>Recepcionista</option>
                                </select>
                            </div>
                        </div>

                        {formData.accessProfile !== 'Admin' && (
                            <>
                                <div className="border-t pt-4">
                                    <p className="text-base font-medium text-gray-800 mb-2">Jornada de Trabalho</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <TimeInput label="Início do expediente" value={formData.workStartTime || ''} onChange={val => handleInputChange('workStartTime', val)} disabled={!isEditing} />
                                        <TimeInput label="Fim do expediente" value={formData.workEndTime || ''} onChange={val => handleInputChange('workEndTime', val)} disabled={!isEditing} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-base font-medium text-gray-800 mb-2">Intervalo (Almoço)</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <TimeInput label="Início do intervalo" value={formData.lunchStartTime || ''} onChange={val => handleInputChange('lunchStartTime', val)} disabled={!isEditing} />
                                        <TimeInput label="Fim do intervalo" value={formData.lunchEndTime || ''} onChange={val => handleInputChange('lunchEndTime', val)} disabled={!isEditing} />
                                    </div>
                                </div>
                            </>
                        )}
                        
                         <div className="border-t pt-4">
                             <label htmlFor="status" className={`flex items-center justify-between ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                <span className="text-sm font-medium text-gray-700">Status</span>
                                 <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${toggleBgClass}`}>
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${formData.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                            </label>
                             <input id="status" type="checkbox" className="sr-only" checked={formData.status === 'active'} disabled={!isEditing} onChange={e => handleInputChange('status', e.target.checked ? 'active' : 'inactive')} />
                         </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                         {isEditing ? (
                            <>
                                <button type="button" onClick={handleCancel} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100">Cancelar</button>
                                <button type="button" onClick={handleSave} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Salvar Alterações</button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100">Fechar</button>
                                <button type="button" onClick={() => setIsEditing(true)} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Editar</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const TeamPage: React.FC = () => {
    const context = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    if (!context || !context.currentUser || context.currentUser.role === Role.CLIENT) {
        return <div className="text-center p-8">Acesso não autorizado.</div>;
    }
    const { currentUser, users, setUsers, setActivePage, setSelectedUserIdForPermissions, showToast } = context;
    const currentUserPermissions = currentUser.permissions;

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    }, [setUsers]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const teamMembers = useMemo(() => {
        return users
            .filter(user => {
                if (statusFilter === 'all') return true;
                return user.status === statusFilter;
            })
            .filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [users, statusFilter, searchTerm]);

    const handlePermissionsClick = (user: User) => {
        setSelectedUserIdForPermissions(user.id);
        setActivePage('Configurações');
    };
    
    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setIsDetailsModalOpen(true);
    }
    
    const handleSave = useCallback(async (userToSave: User) => {
        try {
            if (userToSave.id) { // UPDATE
                const updatedUser = await api.updateUser(userToSave.id, userToSave);
                setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                setIsDetailsModalOpen(false);
                showToast('Profissional atualizado com sucesso!', 'success');
            } else { // CREATE
                 const newUser = await api.createUser(userToSave);
                 setUsers(prev => [...prev, newUser]);
                 setIsCreateModalOpen(false);
                 showToast('Novo profissional salvo com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Failed to save user', error);
            showToast('Falha ao salvar profissional.', 'error');
        }
    }, [setUsers, showToast]);

    if (isLoading && users.length === 0) {
        return <div className="text-center p-8">Carregando equipe...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <FilterButton filter="all" label="Todos" currentFilter={statusFilter} onClick={setStatusFilter} />
                    <FilterButton filter="active" label="Ativos" currentFilter={statusFilter} onClick={setStatusFilter} />
                    <FilterButton filter="inactive" label="Inativos" currentFilter={statusFilter} onClick={setStatusFilter} />
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar profissional..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                        />
                        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {currentUserPermissions?.canCreateTeamMember && (
                        <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <PlusIcon className="w-5 h-5" />
                            <span>Novo Profissional</span>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {teamMembers.map(user => (
                        <div key={user.id} onClick={() => handleViewDetails(user)} className="bg-white rounded-lg shadow-sm border p-6 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:border-blue-400 transition-shadow">
                            <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{user.jobTitle}</p>
                            
                            <div className="mt-auto flex space-x-2">
                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {user.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                                {currentUser.role === Role.ADMIN && (
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handlePermissionsClick(user); }}
                                        title="Gerenciar Permissões"
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <ShieldCheckIcon className="w-5 h-5"/>
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
            
            <NewTeamMemberModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleSave}
                users={users}
            />
            
            <TeamMemberDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                onSave={handleSave}
                user={selectedUser}
                users={users}
            />
        </div>
    );
};

export default TeamPage;
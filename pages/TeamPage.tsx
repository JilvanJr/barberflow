

import React, { useState, useCallback, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
// FIX: Removed unused UserSchedule import.
import { User, Role } from '../types';
import { PlusIcon, XIcon, ShieldCheckIcon, SearchIcon, ClockIcon, ImageIcon, EditIcon, EyeIcon, ArrowUpIcon, ArrowDownIcon } from '../components/icons';

type StatusFilterType = 'all' | 'active' | 'inactive';

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

// FIX: Moved TimeInput component to module scope to avoid re-definition on render.
const TimeInput: React.FC<{label: string, value: string, onChange: (val: string) => void, disabled?: boolean}> = ({label, value, onChange, disabled}) => (
    <div className="relative">
         <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative mt-1">
            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
                type="time"
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-9 pr-3 py-2 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 text-gray-900"
            />
        </div>
    </div>
);

const NewTeamMemberModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Partial<User>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if(isOpen) {
            // Reset form
            setFormData({
                name: '',
                email: '',
                jobTitle: 'Barbeiro',
                accessProfile: 'Barbeiro',
                avatarUrl: '',
                workStartTime: '09:00',
                workEndTime: '18:00',
                lunchStartTime: '12:00',
                lunchEndTime: '13:00',
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleInputChange = (field: keyof User, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-start pt-16 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
                <div className="px-6 py-4 border-b">
                     <h2 className="text-xl font-bold text-gray-800">Novo Profissional</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome</label>
                            <input type="text" placeholder="Nome do profissional" required value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder:italic placeholder:text-gray-400" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">E-mail</label>
                            <input type="email" placeholder="E-mail do profissional (será utilizado para acesso)" required value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder:italic placeholder:text-gray-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Função</label>
                                <select value={formData.jobTitle || 'Barbeiro'} onChange={e => handleInputChange('jobTitle', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option>Barbeiro</option>
                                    <option>Recepcionista</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Perfil de acesso</label>
                                <select value={formData.accessProfile || 'Barbeiro'} onChange={e => handleInputChange('accessProfile', e.target.value as User['accessProfile'])} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option>Admin</option>
                                    <option>Barbeiro</option>
                                    <option>Recepcionista</option>
                                </select>
                            </div>
                        </div>
                        
                        {formData.accessProfile !== 'Admin' && (
                            <>
                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Jornada</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <TimeInput label="Início" value={formData.workStartTime || ''} onChange={val => handleInputChange('workStartTime', val)} />
                                        <TimeInput label="Fim" value={formData.workEndTime || ''} onChange={val => handleInputChange('workEndTime', val)} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Almoço</p>
                                    <div className="grid grid-cols-2 gap-4">
                                    <TimeInput label="Início" value={formData.lunchStartTime || ''} onChange={val => handleInputChange('lunchStartTime', val)} />
                                        <TimeInput label="Fim" value={formData.lunchEndTime || ''} onChange={val => handleInputChange('lunchEndTime', val)} />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="border-t pt-4">
                           <button type="button" className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <ImageIcon className="w-5 h-5 text-gray-500"/>
                                Importar foto
                           </button>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-sm">Cancelar</button>
                        <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-sm">Salvar</button>
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
}> = ({ isOpen, onClose, onSave, user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});
    
    useEffect(() => {
        if(user) {
            setFormData(user);
        }
        setIsEditing(false);
    }, [user, isOpen]);

    if (!isOpen || !user) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as User);
        setIsEditing(false);
    };
    
    const handleInputChange = (field: keyof User, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) setFormData(user);
    }

    const toggleBgClass = formData.status === 'active' 
        ? (isEditing ? 'bg-blue-600' : 'bg-gray-300') 
        : 'bg-gray-200';

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-start pt-16 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                     <h2 className="text-xl font-bold text-gray-800">Detalhes do Profissional</h2>
                    {!isEditing && <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"><EditIcon className="w-4 h-4" /> Editar</button>}
                    {isEditing && <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md">Editando...</span>}
                </div>
                 <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome</label>
                            <input type="text" disabled={!isEditing} value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">E-mail</label>
                            <input type="email" disabled value={formData.email || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-500 sm:text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Função</label>
                                <select disabled={!isEditing} value={formData.jobTitle || ''} onChange={e => handleInputChange('jobTitle', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500">
                                    <option>Barbeiro</option>
                                    <option>Recepcionista</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Perfil de acesso</label>
                                <select disabled={!isEditing} value={formData.accessProfile || ''} onChange={e => handleInputChange('accessProfile', e.target.value as User['accessProfile'])} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500">
                                    <option>Admin</option>
                                    <option>Barbeiro</option>
                                    <option>Recepcionista</option>
                                </select>
                            </div>
                        </div>

                        {formData.accessProfile !== 'Admin' && (
                            <>
                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Jornada</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <TimeInput label="Início" value={formData.workStartTime || ''} onChange={val => handleInputChange('workStartTime', val)} disabled={!isEditing} />
                                        <TimeInput label="Fim" value={formData.workEndTime || ''} onChange={val => handleInputChange('workEndTime', val)} disabled={!isEditing} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Almoço</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <TimeInput label="Início" value={formData.lunchStartTime || ''} onChange={val => handleInputChange('lunchStartTime', val)} disabled={!isEditing} />
                                        <TimeInput label="Fim" value={formData.lunchEndTime || ''} onChange={val => handleInputChange('lunchEndTime', val)} disabled={!isEditing} />
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
                    <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                         {isEditing ? (
                            <div className="flex w-full space-x-3">
                                <button type="button" onClick={handleCancel} className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-sm">Cancelar</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-sm">Salvar</button>
                            </div>
                        ) : (
                             <button type="button" onClick={onClose} className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-sm">Fechar</button>
                        )}
                    </div>
                </form>
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
            // In a real app, this would be api.getUsers(), but we get it from context
            // For now, just end loading
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

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
            />
            
            <TeamMemberDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                onSave={handleSave}
                user={selectedUser}
            />
        </div>
    );
};

export default TeamPage;
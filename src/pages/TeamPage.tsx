

import React, { useState, useCallback, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { Barber, User, Role } from '../types';
import { PlusIcon, TrashIcon, XIcon, ShieldCheckIcon, AlertTriangleIcon, EyeIcon } from '../components/icons';

const BarberModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (barber: Barber) => void;
    onDelete: (barberId: number) => void;
    barber: Partial<Barber> | null;
}> = ({ isOpen, onClose, onSave, onDelete, barber }) => {
    const [formData, setFormData] = useState<Partial<Barber>>({});

    useEffect(() => {
        setFormData(barber || {});
    }, [barber, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Barber);
    };

    const handleDeleteClick = () => {
        if (formData.id) {
            onDelete(formData.id);
        }
    }

    const inputClasses = "w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
    
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{barber?.id ? 'Editar Profissional' : 'Novo Profissional'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClasses}>Nome</label>
                        <input type="text" placeholder="Nome completo" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={`${inputClasses} placeholder:italic placeholder:text-gray-400`} />
                    </div>
                     <div>
                        <label className={labelClasses}>Email</label>
                        <input type="email" placeholder="exemplo@email.com" required value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className={`${inputClasses} placeholder:italic placeholder:text-gray-400`} />
                    </div>
                     <div>
                        <label className={labelClasses}>URL do Avatar</label>
                        <input type="text" placeholder="https://exemplo.com/avatar.png" required value={formData.avatarUrl || ''} onChange={e => setFormData({...formData, avatarUrl: e.target.value})} className={`${inputClasses} placeholder:italic placeholder:text-gray-400`} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Início da Jornada</label>
                            <input type="time" required value={formData.workStartTime || ''} onChange={e => setFormData({...formData, workStartTime: e.target.value})} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Fim da Jornada</label>
                            <input type="time" required value={formData.workEndTime || ''} onChange={e => setFormData({...formData, workEndTime: e.target.value})} className={inputClasses} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Início do Almoço</label>
                            <input type="time" required value={formData.lunchStartTime || ''} onChange={e => setFormData({...formData, lunchStartTime: e.target.value})} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Fim do Almoço</label>
                            <input type="time" required value={formData.lunchEndTime || ''} onChange={e => setFormData({...formData, lunchEndTime: e.target.value})} className={inputClasses} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t mt-6">
                        <div>
                             {barber?.id && (
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    className="text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 px-4 py-2"
                                >
                                    <TrashIcon className="w-5 h-5"/>
                                    <span>Excluir</span>
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-4">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">Cancelar</button>
                            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">Salvar</button>
                        </div>
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


const TeamPage: React.FC = () => {
    const context = useContext(AppContext);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBarber, setEditingBarber] = useState<Partial<Barber> | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [barberToDeleteId, setBarberToDeleteId] = useState<number | null>(null);

    if (!context || !context.currentUser || context.currentUser.role === Role.CLIENT) {
        return <div className="text-center p-8">Acesso não autorizado.</div>;
    }
    const { currentUser, users, setActivePage, setSelectedUserIdForPermissions } = context;
    const currentUserPermissions = currentUser.permissions;

    const fetchBarbers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getBarbers();
            setBarbers(data);
        } catch (error) {
            console.error("Failed to fetch barbers", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBarbers();
    }, [fetchBarbers]);

    const handlePermissionsClick = (barber: Barber) => {
        if (!barber.email) {
            alert("Este barbeiro não tem um e-mail associado e não pode ter permissões gerenciadas.");
            return;
        }
        const user = users.find(u => u.email === barber.email);
        if (user) {
            setSelectedUserIdForPermissions(user.id);
            setActivePage('Configurações');
        } else {
            alert("Não foi possível encontrar um usuário correspondente para este barbeiro.");
        }
    };

    const handleAddNew = () => {
        setEditingBarber({name: '', email: '', avatarUrl: '', workStartTime: '09:00', workEndTime: '19:00', lunchStartTime: '12:00', lunchEndTime: '13:00'});
        setIsModalOpen(true);
    };

    const handleEdit = (barber: Barber) => {
        setEditingBarber(barber);
        setIsModalOpen(true);
    };
    
    const handleDelete = (barberId: number) => {
        setIsModalOpen(false); // Close edit modal first
        setBarberToDeleteId(barberId);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (barberToDeleteId) {
            try {
                await api.deleteBarber(barberToDeleteId);
                fetchBarbers();
            } catch (error) {
                console.error("Failed to delete barber", error);
                alert("Falha ao excluir o membro da equipe.");
            } finally {
                setIsConfirmModalOpen(false);
                setBarberToDeleteId(null);
            }
        }
    };

    const handleSave = useCallback(async (barberToSave: Barber) => {
        if (barberToSave.id) {
            await api.updateBarber(barberToSave.id, barberToSave);
        } else {
            await api.createBarber(barberToSave);
        }
        setIsModalOpen(false);
        fetchBarbers();
    }, [fetchBarbers]);

    const getRoleName = (user: User | undefined) => {
        if (!user) return 'Membro';
        if (user.name.toLowerCase().includes('recepcionista')) return 'Recepcionista';
        switch (user.role) {
            case Role.ADMIN: return 'Admin';
            case Role.BARBER: return 'Barbeiro';
            default: return 'Membro';
        }
    }

    if (isLoading) {
        return <div className="text-center p-8">Carregando equipe...</div>;
    }

    return (
        <div>
            <div className="flex justify-end items-center mb-6">
                {currentUserPermissions?.canCreateTeamMember && (
                    <button onClick={handleAddNew} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                        <PlusIcon className="w-5 h-5" />
                        <span>Novo Profissional</span>
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {barbers.map(barber => {
                    const user = users.find(u => u.email === barber.email);
                    return (
                        <div key={barber.id} className="bg-white rounded-lg shadow-sm border p-6 flex flex-col items-center text-center">
                            <img src={barber.avatarUrl} alt={barber.name} className="w-24 h-24 rounded-full mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">{barber.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{getRoleName(user)}</p>
                            
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => handleEdit(barber)} 
                                    title="Ver Detalhes"
                                    className="text-gray-500 hover:text-blue-600 p-2 bg-gray-100 rounded-full transition-colors"
                                >
                                    <EyeIcon className="w-5 h-5"/>
                                </button>
                                {currentUserPermissions.canEditTeamMember && (
                                    <button 
                                        onClick={() => handlePermissionsClick(barber)} 
                                        title="Permissões"
                                        className="text-gray-500 hover:text-blue-600 p-2 bg-gray-100 rounded-full transition-colors"
                                    >
                                        <ShieldCheckIcon className="w-5 h-5"/>
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <BarberModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                onDelete={handleDelete}
                barber={editingBarber} 
            />
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir este membro da equipe? Esta ação não pode ser desfeita."
            />
        </div>
    );
};

export default TeamPage;
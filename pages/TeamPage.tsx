
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { Barber, User } from '../types';
import { PlusIcon, EditIcon, TrashIcon, XIcon } from '../components/icons';

const BarberModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (barber: Barber) => void;
    barber: Partial<Barber> | null;
}> = ({ isOpen, onClose, onSave, barber }) => {
    const [formData, setFormData] = useState<Partial<Barber> | null>(null);

    useEffect(() => {
        setFormData(barber);
    }, [barber]);

    if (!isOpen || !formData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Barber);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">{barber?.id ? 'Editar Membro' : 'Novo Membro'}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" required value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">URL do Avatar</label>
                        <input type="text" placeholder="https://..." required value={formData.avatarUrl || ''} onChange={e => setFormData({...formData, avatarUrl: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
                    </div>
                </form>
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

    // FIX: Cast currentUser to User to safely access permissions.
    const currentUserPermissions = (context?.currentUser as User)?.permissions;

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


    const handleAddNew = () => {
        setEditingBarber({name: '', email: '', avatarUrl: ''});
        setIsModalOpen(true);
    };

    const handleEdit = (barber: Barber) => {
        setEditingBarber(barber);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (barberId: number) => {
        if(window.confirm('Tem certeza que deseja excluir este membro da equipe?')) {
            await api.deleteBarber(barberId);
            fetchBarbers();
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

    if (isLoading) {
        return <div className="text-center p-8">Carregando equipe...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Equipe</h2>
                {currentUserPermissions?.canCreateTeamMember && (
                    <button onClick={handleAddNew} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                        <PlusIcon className="w-5 h-5" />
                        <span>Novo Membro</span>
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {barbers.map(barber => (
                    <div key={barber.id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center">
                        <img src={barber.avatarUrl} alt={barber.name} className="w-24 h-24 rounded-full mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800">{barber.name}</h3>
                        <p className="text-sm text-gray-500">{barber.email}</p>
                        {(currentUserPermissions?.canEditTeamMember || currentUserPermissions?.canDeleteTeamMember) && (
                            <div className="mt-4 flex space-x-2">
                                {currentUserPermissions.canEditTeamMember && <button onClick={() => handleEdit(barber)} className="text-blue-600 hover:text-blue-900 p-2 bg-gray-100 rounded-full"><EditIcon className="w-5 h-5"/></button>}
                                {currentUserPermissions.canDeleteTeamMember && <button onClick={() => handleDelete(barber.id)} className="text-red-600 hover:text-red-900 p-2 bg-gray-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {(currentUserPermissions?.canCreateTeamMember || currentUserPermissions?.canEditTeamMember) && (
             <BarberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} barber={editingBarber} />
            )}
        </div>
    );
};

export default TeamPage;

import React, { useState, useCallback, useEffect } from 'react';
import { BARBERS } from '../constants';
import { Barber } from '../types';
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
    const [barbers, setBarbers] = useState<Barber[]>(BARBERS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBarber, setEditingBarber] = useState<Partial<Barber> | null>(null);

    const handleAddNew = () => {
        setEditingBarber({name: '', email: '', avatarUrl: ''});
        setIsModalOpen(true);
    };

    const handleEdit = (barber: Barber) => {
        setEditingBarber(barber);
        setIsModalOpen(true);
    };
    
    const handleDelete = (barberId: number) => {
        if(window.confirm('Tem certeza que deseja excluir este membro da equipe?')) {
            setBarbers(barbers.filter(b => b.id !== barberId));
        }
    };

    const handleSave = useCallback((barberToSave: Barber) => {
        if (barberToSave.id) {
            setBarbers(barbers.map(b => b.id === barberToSave.id ? barberToSave : b));
        } else {
            setBarbers([...barbers, { ...barberToSave, id: Date.now() }]);
        }
        setIsModalOpen(false);
    }, [barbers]);


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Equipe</h2>
                <button onClick={handleAddNew} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>Novo Membro</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {barbers.map(barber => (
                    <div key={barber.id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center">
                        <img src={barber.avatarUrl} alt={barber.name} className="w-24 h-24 rounded-full mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800">{barber.name}</h3>
                        <p className="text-sm text-gray-500">{barber.email}</p>
                        <div className="mt-4 flex space-x-2">
                            <button onClick={() => handleEdit(barber)} className="text-blue-600 hover:text-blue-900 p-2 bg-gray-100 rounded-full"><EditIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleDelete(barber.id)} className="text-red-600 hover:text-red-900 p-2 bg-gray-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
             <BarberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} barber={editingBarber} />
        </div>
    );
};

export default TeamPage;
import React, { useState, useCallback, useEffect } from 'react';
import { SERVICES } from '../constants';
import { Service } from '../types';
import { PlusIcon, EditIcon, TrashIcon, XIcon } from '../components/icons';

const ServiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Service) => void;
    service: Partial<Service> | null;
}> = ({ isOpen, onClose, onSave, service }) => {
    const [formData, setFormData] = useState<Partial<Service> | null>(null);

    useEffect(() => {
        setFormData(service);
    }, [service]);

    if (!isOpen || !formData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Service);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">{service?.id ? 'Editar Serviço' : 'Novo Serviço'}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome do Serviço</label>
                        <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                        <input type="number" step="0.01" required value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Duração (minutos)</label>
                        <input type="number" required value={formData.duration || ''} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
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


const ServicesPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>(SERVICES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
    
    const handleAddNew = () => {
        setEditingService({ name: '', price: 0, duration: 0 });
        setIsModalOpen(true);
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleDelete = (serviceId: number) => {
        if(window.confirm('Tem certeza que deseja excluir este serviço?')) {
            setServices(services.filter(s => s.id !== serviceId));
        }
    };

    const handleSave = useCallback((serviceToSave: Service) => {
        if (serviceToSave.id) {
            setServices(services.map(s => s.id === serviceToSave.id ? serviceToSave : s));
        } else {
            setServices([...services, { ...serviceToSave, id: Date.now() }]);
        }
        setIsModalOpen(false);
    }, [services]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Serviços</h2>
                <button onClick={handleAddNew} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>Novo Serviço</span>
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Serviço</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duração</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {services.map(service => (
                           <tr key={service.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {service.price.toFixed(2).replace('.', ',')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.duration} min</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => handleEdit(service)} className="text-blue-600 hover:text-blue-900"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} service={editingService} />
        </div>
    );
};

export default ServicesPage;
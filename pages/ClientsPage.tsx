import React, { useState, useCallback, useEffect } from 'react';
import { CLIENTS } from '../constants';
import { Client, Role } from '../types';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, XIcon } from '../components/icons';

const ClientModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client) => void;
    client: Partial<Client> | null;
}> = ({ isOpen, onClose, onSave, client }) => {
    const [formData, setFormData] = useState<Partial<Client> | null>(null);

    useEffect(() => {
        setFormData(client);
    }, [client]);

    if (!isOpen || !formData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Client);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">{client?.id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" placeholder="Nome completo" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" placeholder="exemplo@email.com" required value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input type="tel" placeholder="(11) 99999-9999" required value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">CPF</label>
                        <input type="text" placeholder="000.000.000-00" required value={formData.cpf || ''} onChange={e => setFormData({...formData, cpf: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
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

const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>(CLIENTS);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddNew = () => {
        setEditingClient({
            name: '',
            email: '',
            phone: '',
            cpf: '',
            birthDate: '',
            role: Role.CLIENT
        });
        setIsModalOpen(true);
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };
    
    const handleDelete = (clientId: number) => {
        if(window.confirm('Tem certeza que deseja excluir este cliente?')) {
            setClients(clients.filter(c => c.id !== clientId));
        }
    };

    const handleSave = useCallback((clientToSave: Client) => {
        if (clientToSave.id) {
            setClients(clients.map(c => c.id === clientToSave.id ? clientToSave : c));
        } else {
            setClients([...clients, { ...clientToSave, id: Date.now() }]);
        }
        setIsModalOpen(false);
    }, [clients]);

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
                    <button onClick={handleAddNew} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                        <PlusIcon className="w-5 h-5" />
                        <span>Novo Cliente</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClients.map(client => (
                            <tr key={client.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => handleEdit(client)} className="text-blue-600 hover:text-blue-900"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <ClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} client={editingClient} />
        </div>
    );
};

export default ClientsPage;
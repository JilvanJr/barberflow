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

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        
        let formattedValue = '';
        if (value.length > 0) {
            formattedValue = `(${value.substring(0, 2)}`;
        }
        if (value.length >= 3) {
            formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}`;
        }
        if (value.length >= 8) {
            formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
        }
        setFormData({ ...formData, phone: formattedValue });
    };

    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.substring(0, 8);

        let formattedValue = value;
        if (value.length > 2) {
            formattedValue = `${value.substring(0, 2)}/${value.substring(2)}`;
        }
        if (value.length > 4) {
             formattedValue = `${value.substring(0, 2)}/${value.substring(2, 4)}/${value.substring(4)}`;
        }
        setFormData({ ...formData, birthDate: formattedValue });
    }

    const inputClasses = "w-full bg-gray-800 text-white rounded-lg p-3 border-2 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
    const labelClasses = "block text-sm font-medium text-gray-600 mb-1";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{client?.id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelClasses}>Nome</label>
                        <input type="text" placeholder="Manuel Neuer" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClasses} />
                    </div>
                     <div>
                        <label className={labelClasses}>Email</label>
                        <input type="email" placeholder="client@barberflow.com" required value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClasses} />
                    </div>
                     <div>
                        <label className={labelClasses}>Telefone</label>
                        <input type="tel" placeholder="(11) 9 1234-5678" required value={formData.phone || ''} onChange={handlePhoneChange} className={inputClasses} maxLength={16} />
                    </div>
                     <div>
                        <label className={labelClasses}>Data de Nascimento</label>
                        <input type="text" placeholder="DD/MM/AAAA" value={formData.birthDate || ''} onChange={handleBirthDateChange} className={inputClasses} maxLength={10} />
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

import React, { useState, useCallback, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { Service, User, Role } from '../types';
import { PlusIcon, EditIcon, TrashIcon, XIcon } from '../components/icons';

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

const ServiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Service) => void;
    service: Partial<Service> | null;
}> = ({ isOpen, onClose, onSave, service }) => {
    const [formData, setFormData] = useState<Partial<Service>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(service || {});
            setErrors({});
        }
    }, [service, isOpen]);

    const validateField = (name: keyof Service, value: any): string => {
        switch (name) {
            case 'name':
                return !value?.trim() ? 'O nome do serviço é obrigatório.' : '';
            case 'price':
                if (value === undefined || value === null || value <= 0) {
                    return 'O preço deve ser um número positivo.';
                }
                return '';
            case 'duration':
                 if (value === undefined || value === null || value <= 0) {
                    return 'A duração deve ser um número positivo.';
                }
                if (!Number.isInteger(Number(value))) {
                    return 'A duração deve ser em minutos (número inteiro).';
                }
                return '';
            default:
                return '';
        }
    };
    
    const handleInputChange = (field: keyof Service, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
        }
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof Service;
        setErrors(prev => ({...prev, [fieldName]: validateField(fieldName, value)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors: Record<string, string> = {};
        const fieldsToValidate: (keyof Service)[] = ['name', 'price', 'duration'];
        
        fieldsToValidate.forEach(key => {
            const error = validateField(key, formData[key]);
            if(error) validationErrors[key] = error;
        });

        setErrors(validationErrors);
        if (Object.values(validationErrors).every(v => !v)) {
            const processedData: Partial<Service> = {
                ...formData,
                price: Number(formData.price),
                duration: Number(formData.duration)
            }
            onSave(processedData as Service);
        }
    };
    
    if (!isOpen) return null;

    const inputClasses = "w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{service?.id ? 'Editar Serviço' : 'Novo Serviço'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className={labelClasses}>Nome do Serviço</label>
                        <input type="text" name="name" placeholder="Corte Masculino" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} onBlur={handleBlur} className={inputClasses} />
                        <FormError message={errors.name} />
                    </div>
                    <div>
                        <label className={labelClasses}>Preço (R$)</label>
                        <input type="number" name="price" step="0.01" placeholder="25.00" value={formData.price || ''} onChange={e => handleInputChange('price', e.target.value)} onBlur={handleBlur} className={inputClasses} />
                        <FormError message={errors.price} />
                    </div>
                    <div>
                        <label className={labelClasses}>Duração (minutos)</label>
                        <input type="number" name="duration" placeholder="30" value={formData.duration || ''} onChange={e => handleInputChange('duration', e.target.value)} onBlur={handleBlur} className={inputClasses} />
                        <FormError message={errors.duration} />
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


const ServicesPage: React.FC = () => {
    const context = useContext(AppContext);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
    
    if (!context || !context.currentUser || context.currentUser.role === Role.CLIENT) {
        return <div className="text-center p-8">Acesso não autorizado.</div>;
    }
    const { currentUser } = context;
    const currentUserPermissions = currentUser.permissions;

    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getServices();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleAddNew = () => {
        setEditingService({ name: '', price: undefined, duration: undefined });
        setIsModalOpen(true);
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleDelete = async (serviceId: number) => {
        if(window.confirm('Tem certeza que deseja excluir este serviço?')) {
            try {
                await api.deleteService(serviceId);
                setServices(prevServices => prevServices.filter(s => s.id !== serviceId));
            } catch (error) {
                console.error("Failed to delete service", error);
                alert("Falha ao excluir o serviço.");
            }
        }
    };

    const handleSave = useCallback(async (serviceToSave: Service) => {
        try {
            if (serviceToSave.id) {
                await api.updateService(serviceToSave.id, serviceToSave);
            } else {
                await api.createService(serviceToSave);
            }
            setIsModalOpen(false);
            fetchServices();
        } catch(error) {
             console.error("Failed to save service", error);
            alert("Falha ao salvar o serviço.");
        }
    }, [fetchServices]);
    
    if (isLoading) {
        return <div className="text-center p-8">Carregando serviços...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Serviços</h2>
                {currentUserPermissions?.canCreateService && (
                    <button onClick={handleAddNew} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                        <PlusIcon className="w-5 h-5" />
                        <span>Novo Serviço</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Serviço</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duração</th>
                            {(currentUserPermissions?.canEditService || currentUserPermissions?.canDeleteService) && (
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {services.map(service => (
                           <tr key={service.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {Number(service.price).toFixed(2).replace('.', ',')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.duration} min</td>
                                {(currentUserPermissions?.canEditService || currentUserPermissions?.canDeleteService) && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {currentUserPermissions?.canEditService && <button onClick={() => handleEdit(service)} className="text-blue-600 hover:text-blue-900"><EditIcon className="w-5 h-5"/></button>}
                                        {currentUserPermissions?.canDeleteService && <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {(currentUserPermissions?.canCreateService || currentUserPermissions?.canEditService) && (
                <ServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} service={editingService} />
             )}
        </div>
    );
};

export default ServicesPage;

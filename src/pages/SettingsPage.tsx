import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { User, Permissions, OperatingHours, DayHours } from '../types';

const PermissionCheckbox: React.FC<{
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ id, label, description, checked, onChange }) => {
    return (
        <div className="relative flex items-start">
            <div className="flex h-6 items-center">
                <input
                    id={id}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
            </div>
            <div className="ml-3 text-sm leading-6">
                <label htmlFor={id} className="font-medium text-gray-900">
                    {label}
                </label>
                <p className="text-gray-500">{description}</p>
            </div>
        </div>
    );
};

const PermissionsContent: React.FC = () => {
    const context = useContext(AppContext);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [userPermissions, setUserPermissions] = useState<Permissions | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    if (!context) return null;
    const { users, currentUser, setUsers, selectedUserIdForPermissions, setSelectedUserIdForPermissions } = context;
    const otherUsers = users.filter(u => u.id !== currentUser?.id) || [];

    const handleUserSelect = (userId: number) => {
        const selectedUser = users.find(u => u.id === userId);
        if (selectedUser) {
            setSelectedUserId(userId);
            setUserPermissions(JSON.parse(JSON.stringify(selectedUser.permissions)));
        }
    };
    
    useEffect(() => {
        if (selectedUserIdForPermissions) {
            const userExists = otherUsers.some(u => u.id === selectedUserIdForPermissions);
            if (userExists) {
                handleUserSelect(selectedUserIdForPermissions);
            }
            setSelectedUserIdForPermissions(null);
        } else if (otherUsers.length > 0 && !selectedUserId) {
            const firstUser = otherUsers[0];
            handleUserSelect(firstUser.id);
        }
    }, [users, selectedUserId, selectedUserIdForPermissions]);

    const handlePermissionChange = (key: keyof Permissions, value: boolean) => {
        if (userPermissions) {
            setUserPermissions({ ...userPermissions, [key]: value });
        }
    };

    const handleSaveChanges = async () => {
        if (selectedUserId && userPermissions) {
            setIsSaving(true);
            try {
                const updatedUser = await api.updateUserPermissions(selectedUserId, userPermissions);
                setUsers(prevUsers => prevUsers.map(user => user.id === selectedUserId ? updatedUser : user));
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } catch (error) {
                console.error("Failed to save permissions", error);
                alert("Erro ao salvar permissões.");
            } finally {
                setIsSaving(false);
            }
        }
    };
    
    const selectedUser = users.find(u => u.id === selectedUserId);

    if (otherUsers.length === 0) {
        return <div className="text-center p-8 bg-white rounded-lg shadow-sm">Não há outros usuários para gerenciar permissões.</div>
    }

    const permissionGroups = [
        {
            title: 'Agenda',
            permissions: [
                { key: 'canViewAgenda', label: 'Ver Agenda', description: 'Permite visualizar todos os agendamentos.' },
                { key: 'canCreateAppointment', label: 'Criar Agendamento', description: 'Permite adicionar novos agendamentos na agenda.' },
                { key: 'canCancelAppointment', label: 'Cancelar Agendamento', description: 'Permite remover agendamentos existentes.' },
            ]
        },
        {
            title: 'Clientes',
            permissions: [
                { key: 'canViewClients', label: 'Ver Clientes', description: 'Permite acessar a lista de clientes cadastrados.' },
                { key: 'canCreateClient', label: 'Adicionar Cliente', description: 'Permite cadastrar novos clientes no sistema.' },
                { key: 'canEditClient', label: 'Editar Cliente', description: 'Permite alterar as informações de clientes existentes.' },
                { key: 'canDeleteClient', label: 'Excluir Cliente', description: 'Permite remover permanentemente um cliente.' },
            ]
        },
        {
            title: 'Caixa',
            permissions: [
                 { key: 'canViewCashFlow', label: 'Ver Caixa', description: 'Dá acesso à tela de Caixa e à tabela de transações.' },
                 { key: 'canViewCashFlowDashboard', label: 'Ver Resumo Financeiro', description: 'Permite ver os cards de Receita, Despesa e Saldo.' },
                 { key: 'canConfirmPayment', label: 'Confirmar Pagamentos', description: 'Permite finalizar transações pendentes de agendamentos.' },
                 { key: 'canAddTransaction', label: 'Adicionar Transação Manual', description: 'Permite registrar novas entradas ou saídas manualmente.' },
                 { key: 'canDeleteTransaction', label: 'Excluir Transações', description: 'Permite remover transações (somente de agendamentos pendentes).' },
            ]
        },
        {
            title: 'Gestão da Barbearia',
            permissions: [
                 { key: 'canViewServices', label: 'Ver Serviços', description: 'Permite visualizar a lista de serviços oferecidos.' },
                 { key: 'canCreateService', label: 'Adicionar Serviço', description: 'Permite adicionar novos serviços ao catálogo.' },
                 { key: 'canEditService', label: 'Editar Serviço', description: 'Permite alterar o nome, preço e duração dos serviços.' },
                 { key: 'canDeleteService', label: 'Excluir Serviço', description: 'Permite remover um serviço do catálogo.' },
                 { key: 'canViewTeam', label: 'Ver Equipe', description: 'Permite visualizar os membros da equipe.' },
                 { key: 'canCreateTeamMember', label: 'Adicionar Membro', description: 'Permite adicionar novos barbeiros ou usuários.' },
                 { key: 'canEditTeamMember', label: 'Editar Membro', description: 'Permite alterar informações dos membros da equipe.' },
                 { key: 'canDeleteTeamMember', label: 'Excluir Membro', description: 'Permite remover um membro da equipe.' },
            ]
        }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 px-2">Equipe</h2>
                <div className="space-y-2">
                    {otherUsers.map(user => (
                        <div
                            key={user.id}
                            onClick={() => handleUserSelect(user.id)}
                            className={`p-3 rounded-lg cursor-pointer flex items-center space-x-4 transition-all duration-200 border-2 ${
                                selectedUserId === user.id
                                    ? 'bg-blue-50 border-blue-500 shadow-sm'
                                    : 'bg-white hover:bg-gray-50 border-transparent'
                            }`}
                        >
                            <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                            <div>
                                <p className="font-semibold text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-2">
                {userPermissions && selectedUser ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                         <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-800">
                                Editando permissões para <span className="text-blue-600">{selectedUser.name}</span>
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Selecione as ações que este usuário poderá realizar no sistema.</p>
                        </div>
                        <div className="space-y-8">
                            {permissionGroups.map(group => (
                                 <fieldset key={group.title}>
                                    <legend className="text-base font-semibold leading-6 text-gray-900">{group.title}</legend>
                                    <div className="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200">
                                        {group.permissions.map(perm => (
                                            <div key={perm.key} className="py-4">
                                                <PermissionCheckbox
                                                    id={perm.key}
                                                    label={perm.label}
                                                    description={perm.description}
                                                    checked={userPermissions[perm.key as keyof Permissions]}
                                                    onChange={(value) => handlePermissionChange(perm.key as keyof Permissions, value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </fieldset>
                            ))}
                        </div>
                         <div className="flex justify-end items-center space-x-4 pt-6 mt-6 border-t border-gray-200">
                             {showSuccess && <p className="text-sm font-medium text-green-600 animate-pulse">Permissões salvas com sucesso!</p>}
                            <button
                                onClick={handleSaveChanges}
                                disabled={isSaving}
                                className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            >
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center h-full flex items-center justify-center">
                        <p className="text-gray-600">Selecione um usuário da lista para editar suas permissões.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const OperatingHoursContent: React.FC = () => {
    const [operatingHours, setOperatingHours] = useState<OperatingHours | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        api.getOperatingHours().then(setOperatingHours);
    }, []);

    const handleHoursChange = (day: keyof OperatingHours, field: keyof DayHours, value: any) => {
        setOperatingHours(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [day]: {
                    ...prev[day],
                    [field]: value
                }
            };
        });
    };

    const handleSaveChanges = async () => {
        if (operatingHours) {
            setIsSaving(true);
            try {
                await api.updateOperatingHours(operatingHours);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } catch (error) {
                console.error("Failed to save operating hours", error);
                alert("Erro ao salvar o horário de funcionamento.");
            } finally {
                setIsSaving(false);
            }
        }
    };
    
    if (!operatingHours) {
        return <div className="text-center p-8">Carregando horário de funcionamento...</div>;
    }

    const dayNames: { [key in keyof OperatingHours]: string } = {
        monday: 'Segunda-feira', tuesday: 'Terça-feira', wednesday: 'Quarta-feira',
        thursday: 'Quinta-feira', friday: 'Sexta-feira', saturday: 'Sábado', sunday: 'Domingo'
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800">Horário de Funcionamento</h2>
                <p className="text-sm text-gray-500 mt-1">Defina os horários de funcionamento da barbearia que serão refletidos na agenda.</p>
            </div>
            <div className="space-y-4">
                {Object.keys(dayNames).map(day => (
                    <div key={day} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-4 border-b last:border-b-0">
                        <div className="md:col-span-1">
                             <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                    checked={operatingHours[day as keyof OperatingHours].isOpen}
                                    onChange={e => handleHoursChange(day as keyof OperatingHours, 'isOpen', e.target.checked)}
                                />
                                <span className="font-semibold text-gray-700">{dayNames[day as keyof OperatingHours]}</span>
                            </label>
                        </div>
                        <div className="md:col-span-3 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-500 block mb-1">Abre às</label>
                                <input
                                    type="time"
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                                    value={operatingHours[day as keyof OperatingHours].openTime}
                                    onChange={e => handleHoursChange(day as keyof OperatingHours, 'openTime', e.target.value)}
                                    disabled={!operatingHours[day as keyof OperatingHours].isOpen}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block mb-1">Fecha às</label>
                                <input
                                    type="time"
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                                    value={operatingHours[day as keyof OperatingHours].closeTime}
                                    onChange={e => handleHoursChange(day as keyof OperatingHours, 'closeTime', e.target.value)}
                                    disabled={!operatingHours[day as keyof OperatingHours].isOpen}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end items-center space-x-4 pt-6 mt-6 border-t border-gray-200">
                 {showSuccess && <p className="text-sm font-medium text-green-600 animate-pulse">Horários salvos com sucesso!</p>}
                <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Horários'}
                </button>
            </div>
        </div>
    );
};

// FIX: Change to a named export to avoid issues with circular dependencies.
export const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'permissions' | 'operatingHours'>('permissions');
    
    const TabButton: React.FC<{ tabName: typeof activeTab, label: string }> = ({ tabName, label }) => {
        const isActive = activeTab === tabName;
        return (
             <button
                onClick={() => setActiveTab(tabName)}
                className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div>
            <div className="mb-6 flex items-center space-x-2 border-b border-gray-200 pb-4">
                <TabButton tabName="permissions" label="Permissões" />
                <TabButton tabName="operatingHours" label="Horário de Funcionamento" />
            </div>
            
            {activeTab === 'permissions' ? <PermissionsContent /> : <OperatingHoursContent />}
        </div>
    );
};

export default SettingsPage;
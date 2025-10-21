import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { User, Permissions } from '../types';

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
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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

const PermissionsPage: React.FC = () => {
    const context = useContext(AppContext);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [userPermissions, setUserPermissions] = useState<Permissions | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { users, currentUser, setUsers } = context!;

    const otherUsers = users.filter(u => u.id !== currentUser?.id) || [];

    useEffect(() => {
        // Select the first user in the list by default
        if (otherUsers.length > 0 && !selectedUserId) {
            const firstUser = otherUsers[0];
            setSelectedUserId(firstUser.id);
            setUserPermissions(JSON.parse(JSON.stringify(firstUser.permissions))); // Deep copy
        }
    }, [users, selectedUserId]); // Depends on users now

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = parseInt(e.target.value, 10);
        const selectedUser = users.find(u => u.id === userId);
        if (selectedUser) {
            setSelectedUserId(userId);
            setUserPermissions(JSON.parse(JSON.stringify(selectedUser.permissions))); // Deep copy
        }
    };
    
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
                // Update global context state
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === selectedUserId ? updatedUser : user
                    )
                );
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

    if (!context) {
        return <div className="text-center p-8">Carregando contexto...</div>;
    }
    
    if (otherUsers.length === 0) {
        return <div className="text-center p-8 bg-white rounded-lg shadow-sm">Não há outros usuários para gerenciar permissões.</div>
    }

    if (!selectedUser) {
         return <div className="text-center p-8">Carregando usuário...</div>;
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
            title: 'Fluxo de Caixa',
            permissions: [
                 { key: 'canViewCashFlow', label: 'Ver Fluxo de Caixa', description: 'Dá acesso à tela de fluxo de caixa e à tabela de transações.' },
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
        <div>
             <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Editando permissões para o usuário:
                </label>
                <select
                    id="user-select"
                    className="w-full max-w-sm p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={selectedUserId || ''}
                    onChange={handleUserChange}
                >
                    {otherUsers.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.name} ({user.role})
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                {userPermissions ? (
                    <div className="space-y-8">
                        {permissionGroups.map(group => (
                             <fieldset key={group.title}>
                                <legend className="text-base font-semibold leading-6 text-gray-900">{group.title}</legend>
                                <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
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
                         <div className="flex justify-end items-center space-x-4 pt-4">
                             {showSuccess && <p className="text-sm font-medium text-green-600">Permissões salvas com sucesso!</p>}
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
                    <p>Selecione um usuário para editar suas permissões.</p>
                )}
            </div>
        </div>
    );
};

export default PermissionsPage;
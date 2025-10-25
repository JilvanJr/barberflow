

import React, { useContext } from 'react';
import { AppContext } from '../App';
import type { Page } from '../App';
import { Role, Permissions } from '../types';
import { HomeIcon, CalendarIcon, UsersIcon, ScissorsIcon, DollarSignIcon, SettingsIcon, ChevronsLeftIcon, LogoutIcon } from './icons';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { activePage, setActivePage, currentUser, logout } = context;

    if (!currentUser || currentUser.role === Role.CLIENT) {
        return null;
    }

    const navItems: { name: Page; icon: React.FC<{ className?: string }>; permissionKey: keyof Permissions | null }[] = [
        { name: 'Home', icon: HomeIcon, permissionKey: 'canViewAgenda' }, // Assuming home is visible if agenda is
        { name: 'Agenda', icon: CalendarIcon, permissionKey: 'canViewAgenda' },
        { name: 'Clientes', icon: UsersIcon, permissionKey: 'canViewClients' },
        { name: 'Serviços', icon: ScissorsIcon, permissionKey: 'canViewServices' },
        { name: 'Equipe', icon: UsersIcon, permissionKey: 'canViewTeam' },
        { name: 'Caixa', icon: DollarSignIcon, permissionKey: 'canViewCashFlow' },
        { name: 'Configurações', icon: SettingsIcon, permissionKey: null }, // Admin only
    ];

    const isVisible = (item: typeof navItems[0]) => {
        if (item.name === 'Configurações') {
            return currentUser.role === Role.ADMIN;
        }
        if (item.permissionKey) {
            return currentUser.permissions[item.permissionKey];
        }
        return false;
    };

    const NavLink: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
        const isActive = activePage === item.name;
        return (
            <button
                onClick={() => setActivePage(item.name)}
                title={isCollapsed ? item.name : ''}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </button>
        );
    };

    return (
        <aside className={`bg-white border-r border-gray-200 flex flex-col p-4 transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-64'}`}>
            <div className={`flex items-center space-x-3 mb-6 ${isCollapsed ? 'justify-center' : 'px-2 py-1'}`}>
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                {!isCollapsed && (
                    <div>
                        <p className="font-semibold text-sm text-gray-900">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                    </div>
                )}
            </div>
            
            <nav className="flex flex-col space-y-2 flex-grow">
                {navItems.filter(isVisible).map(item => (
                    <NavLink key={item.name} item={item} />
                ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
                 <button
                    onClick={logout}
                    title={isCollapsed ? 'Sair' : ''}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogoutIcon className={`w-5 h-5`} />
                    {!isCollapsed && <span className="font-medium text-sm">Sair</span>}
                </button>
                <button
                    onClick={onToggle}
                    title={isCollapsed ? 'Expandir' : 'Minimizar'}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-200 ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <ChevronsLeftIcon className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                    {!isCollapsed && <span className="font-medium text-sm">Minimizar</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
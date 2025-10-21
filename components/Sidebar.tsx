import React, { useContext } from 'react';
import { AppContext } from '../App';
import type { Page } from '../App';
import { Role } from '../types';
import { MustacheIcon, BuildingIcon, HomeIcon, CalendarIcon, UsersIcon, ScissorsIcon, DollarSignIcon } from './icons';

const Sidebar: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { activePage, setActivePage, currentUser } = context;

    // FIX: Type error on 'Home' is resolved by updating Page type in App.tsx
    const navItems: { name: Page; icon: React.FC<{ className?: string }>; roles: Role[] }[] = [
        { name: 'Home', icon: HomeIcon, roles: [Role.ADMIN, Role.BARBER] },
        { name: 'Agenda', icon: CalendarIcon, roles: [Role.ADMIN, Role.BARBER] },
        { name: 'Clientes', icon: UsersIcon, roles: [Role.ADMIN, Role.BARBER] },
        { name: 'Serviços', icon: ScissorsIcon, roles: [Role.ADMIN, Role.BARBER] },
        { name: 'Equipe', icon: UsersIcon, roles: [Role.ADMIN] },
        { name: 'Fluxo de Caixa', icon: DollarSignIcon, roles: [Role.ADMIN] },
    ];

    const NavLink: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
        const isActive = activePage === item.name;
        return (
            <button
                onClick={() => setActivePage(item.name)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                }`}
            >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
            </button>
        );
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-4">
            <div className="flex items-center space-x-2 p-2 mb-6">
                <MustacheIcon className="w-10 h-10 text-gray-800" />
                 <h1 className="font-bold text-xl text-gray-800">BarberFlow</h1>
            </div>

            <div className="bg-gray-100 rounded-lg p-3 mb-6 flex items-start space-x-3">
                <div className="bg-gray-200 p-2 rounded">
                    <BuildingIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                    <p className="font-semibold text-sm text-gray-800">Natan Borges Ltda.</p>
                    <p className="text-xs text-gray-500">00.000.000/0000-00</p>
                </div>
            </div>

            <nav className="flex flex-col space-y-4">
                {/* FIX: Render 'Home' link, which was previously defined but not rendered. */}
                {navItems.filter(item => item.name === 'Home' && item.roles.includes(currentUser.role)).map(item => (
                    <NavLink key={item.name} item={item} />
                ))}
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2">Gestão</h3>
                    <div className="space-y-1">
                        {/* FIX: Comparison error is resolved by updating Page type in App.tsx. Filter is updated to exclude 'Home' from this section. */}
                        {navItems.filter(item => item.name !== 'Home' && item.roles.includes(currentUser.role)).map(item => (
                            <NavLink key={item.name} item={item} />
                        ))}
                    </div>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;

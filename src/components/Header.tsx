

import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { SettingsIcon, ChevronDownIcon, LogoutIcon } from './icons';
import { Role } from '../types';

const Header: React.FC = () => {
    const context = useContext(AppContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    if (!context) return null;

    const { activePage, currentUser, logout } = context;

    // FIX: Add a type guard to ensure currentUser is a User, not a Client, before accessing properties like `avatarUrl`.
    if (!currentUser || currentUser.role === Role.CLIENT) {
        return null;
    }

    return (
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{activePage}</h1>
            <div className="flex items-center space-x-6">
                <button className="text-gray-500 hover:text-gray-800">
                    <SettingsIcon className="w-6 h-6" />
                </button>

                <div className="relative">
                    <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-3"
                    >
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="font-semibold text-sm text-gray-900 text-left">{currentUser.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                        </div>
                        <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); logout(); }}
                                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                                <LogoutIcon className="w-4 h-4" />
                                <span>Sair</span>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
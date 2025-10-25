

import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Role } from '../types';

const Header: React.FC = () => {
    const context = useContext(AppContext);
    
    if (!context) return null;

    const { activePage, currentUser } = context;

    if (!currentUser || currentUser.role === Role.CLIENT) {
        return null;
    }

    return (
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{activePage}</h1>
        </header>
    );
};

export default Header;
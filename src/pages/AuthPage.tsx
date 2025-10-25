import React, { useState } from 'react';
import type { User, Client } from '../types';
import { api } from '../api';
import { Role } from '../types';
import { UserIcon, LockIcon, SparkleIcon } from '../components/icons';

interface AuthPageProps {
  onLogin: (user: User | Client, token: string) => void;
}

// --- LOGIN FORM COMPONENT ---
const LoginForm: React.FC<{ onLogin: AuthPageProps['onLogin']; onSwitchToRegister: () => void; }> = ({ onLogin, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { user, token } = await api.login(email, password);
            onLogin(user, token);
        } catch (err: any) {
            setError(err.message || 'E-mail ou senha inválidos.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClasses = "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
    const buttonClasses = "w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400";

    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Acesse sua conta</h2>
            
            <form onSubmit={handleLogin} className="space-y-5">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
                
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} placeholder="Entre com seu usuário ou e-mail"/>
                </div>
                
                <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} placeholder="Entre com sua senha"/>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                    <label className="flex items-center space-x-2 text-gray-600">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span>Me manter conectado(a)</span>
                    </label>
                    <a href="#" className="font-medium text-blue-600 hover:underline">Esqueci minha senha</a>
                </div>
                
                <div className="pt-2">
                    <button type="submit" disabled={isLoading} className={buttonClasses}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </div>
                
                <p className="text-sm text-center text-gray-600 pt-4">
                    É seu primeiro acesso?{' '}
                    <button type="button" onClick={onSwitchToRegister} className="font-semibold text-blue-600 hover:underline">
                        Clique aqui
                    </button>
                </p>
            </form>
        </div>
    );
};

// --- REGISTRATION FORM COMPONENT ---
const RegistrationForm: React.FC<{ onLogin: AuthPageProps['onLogin']; onSwitchToLogin: () => void; }> = ({ onLogin, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const newClient: Omit<Client, 'id'> = {
            name, email, password,
            role: Role.CLIENT,
            phone: '',
            birthDate: '',
            cpf: '',
        };
        
        try {
            const { user, token } = await api.registerClient(newClient);
            onLogin(user, token);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro no cadastro.');
        } finally {
            setIsLoading(false);
        }
    }
    
    const inputClasses = "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
    const buttonClasses = "w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400";


    return (
         <div className="w-full">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Crie sua Conta</h2>
            <p className="text-gray-600 mb-6 text-center">Rápido e fácil, comece a agendar agora mesmo.</p>
            <form onSubmit={handleRegister} className="space-y-5">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
                
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required className={inputClasses}/>
                </div>
                <div className="relative">
                    <SparkleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" placeholder="Seu melhor e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses}/>
                </div>
                 <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" placeholder="Crie uma senha" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses}/>
                </div>
                <div className="pt-2">
                    <button type="submit" disabled={isLoading} className={buttonClasses}>
                        {isLoading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </button>
                </div>
                <p className="text-sm text-center text-gray-600 pt-2">
                    Já tem uma conta?{' '}
                    <button type="button" onClick={onSwitchToLogin} className="font-semibold text-blue-600 hover:underline">
                        Faça login
                    </button>
                </p>
            </form>
        </div>
    );
};

// --- MAIN AUTH PAGE COMPONENT ---
const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen flex">
            {/* Left Side (Image) */}
            <div
                className="hidden lg:block relative w-1/2 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599334533039-41a384ace31d?q=80&w=2940&auto=format&fit=crop')" }}
            >
                <div className="absolute inset-0 bg-blue-600 opacity-85"></div>
            </div>

            {/* Right Side (Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="max-w-md w-full">
                    {isLogin ? (
                        <LoginForm onLogin={onLogin} onSwitchToRegister={() => setIsLogin(false)} />
                    ) : (
                        <RegistrationForm onLogin={onLogin} onSwitchToLogin={() => setIsLogin(true)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
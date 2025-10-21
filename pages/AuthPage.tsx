import React, { useState } from 'react';
import type { User, Client } from '../types';
import { USERS, CLIENTS } from '../constants';
import { Role } from '../types';
import { CalendarIcon, SparkleIcon } from '../components/icons';

interface AuthPageProps {
  onLogin: (user: User | Client) => void;
}

const BarberFlowLogoIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} viewBox="0 0 24 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L0 9H6L12 3L18 9H24L12 0Z" />
    </svg>
);

const FormWrapper: React.FC<{ children: React.ReactNode; }> = ({ children }) => (
     <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg">
            {children}
        </div>
    </div>
);

// --- LOGIN FORM COMPONENT ---
const LoginForm: React.FC<{ onLogin: (user: User | Client) => void; onSwitchToRegister: () => void; }> = ({ onLogin, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const allUsers = [...USERS, ...CLIENTS];
        const foundUser = allUsers.find(
            (user) => user.email === email && user.password === password
        );

        if (foundUser) {
            onLogin(foundUser);
        } else {
            setError('E-mail ou senha inválidos.');
        }
    };

    const inputClasses = "mt-1 block w-full bg-gray-800 text-white border-transparent rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
    const buttonClasses = "w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">{error}</p>}
            <div>
                <label className={labelClasses}>E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} placeholder="a"/>
            </div>
            <div>
                <label className={labelClasses}>Senha</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses}/>
            </div>
            <button type="submit" className={buttonClasses}>Entrar</button>
            <p className="text-sm text-center text-gray-600 pt-4">
                Não tem uma conta?{' '}
                <button type="button" onClick={onSwitchToRegister} className="font-semibold text-blue-600 hover:underline">
                    Cadastre-se aqui
                </button>
            </p>
        </form>
    );
};

// --- REGISTRATION FORM COMPONENT ---
const RegistrationForm: React.FC<{ onLogin: (user: User | Client) => void; onSwitchToLogin: () => void; }> = ({ onLogin, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [error, setError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const newClient: Client = {
            id: Date.now(),
            name,
            email,
            password,
            phone,
            role: Role.CLIENT,
            birthDate,
            cpf: '',
        };
        onLogin(newClient);
    }
    
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
        let formattedValue = value.replace(/(\d{2})(\d{1,5})?(\d{1,4})?/, (match, p1, p2, p3) => {
            if (p3) return `(${p1}) ${p2}-${p3}`;
            if (p2) return `(${p1}) ${p2}`;
            return p1.length === 2 ? `(${p1}` : p1;
        });
        setPhone(formattedValue);
    };

    const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.substring(0, 8);
        let formattedValue = value.replace(/(\d{2})(\d{2})?(\d{4})?/, (match, p1, p2, p3) => {
             if (p3) return `${p1}/${p2}/${p3}`;
             if (p2) return `${p1}/${p2}`;
             return p1;
        });
        setBirthDate(formattedValue);
    }
    
    const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
    const buttonClasses = "w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";

    return (
        <form onSubmit={handleRegister} className="space-y-4">
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">{error}</p>}
            <div>
                <label className={labelClasses}>Nome</label>
                <input type="text" placeholder="J" value={name} onChange={(e) => setName(e.target.value)} required className={inputClasses}/>
            </div>
             <div className="relative">
                <label className={labelClasses}>Data de Nascimento</label>
                <input type="text" placeholder="06/09/0001" value={birthDate} onChange={handleBirthDateChange} required className={`${inputClasses} pr-10`} maxLength={10}/>
                <CalendarIcon className="absolute right-3 top-9 h-5 w-5 text-gray-400" />
            </div>
            <div>
                <label className={labelClasses}>Telefone</label>
                <input type="tel" placeholder="(00) 00000-0000" value={phone} onChange={handlePhoneChange} required className={inputClasses} maxLength={15}/>
            </div>
            <div className="relative">
                <label className={labelClasses}>E-mail</label>
                <input type="email" placeholder="seuemail@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputClasses} pr-10`}/>
                <SparkleIcon className="absolute right-3 top-9 h-5 w-5 text-gray-400" />
            </div>
            <div className="relative">
                <label className={labelClasses}>Senha</label>
                <input type={isPasswordVisible ? 'text' : 'password'} placeholder="Crie uma senha forte" value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputClasses} pr-10`}/>
                <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute right-3 top-9">
                    <SparkleIcon className="h-5 w-5 text-gray-400 hover:text-blue-500" />
                </button>
            </div>
            <div className="pt-2">
                <button type="submit" className={buttonClasses}>Cadastrar</button>
            </div>
            <p className="text-sm text-center text-gray-600 pt-2">
                Já tem uma conta?{' '}
                <button type="button" onClick={onSwitchToLogin} className="font-semibold text-blue-600 hover:underline">
                    Faça login
                </button>
            </p>
        </form>
    );
};

// --- MAIN AUTH PAGE COMPONENT ---
const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);

    const commonHeader = (
      <>
        <div className="flex justify-center items-center space-x-3 mb-4">
            <BarberFlowLogoIcon className="h-5 w-7 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">BarberFlow</h1>
        </div>
        <h2 className="text-lg font-medium text-center text-gray-600 mb-8">
          {isLogin ? 'Acesse sua conta' : 'Crie sua conta de cliente'}
        </h2>
      </>
    );

    return (
        <FormWrapper>
            {commonHeader}
            {isLogin ? (
                <LoginForm onLogin={onLogin} onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
                <RegistrationForm onLogin={onLogin} onSwitchToLogin={() => setIsLogin(true)} />
            )}
        </FormWrapper>
    );
};

export default AuthPage;
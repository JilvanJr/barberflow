import React, { useState } from 'react';
import type { User, Client } from '../types';
import { api } from '../api';
import { UserIcon, LockIcon, SparkleIcon, CheckCircleIcon, AlertTriangleIcon } from '../components/icons';

interface AuthPageProps {
  onLogin: (user: User | Client, token: string) => void;
}

const Alert: React.FC<{ message: string }> = ({ message }) => {
    if (!message) return null;
    return (
        <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg relative flex items-center" role="alert">
            <AlertTriangleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="block sm:inline text-sm font-medium">{message}</span>
        </div>
    );
};

// --- LOGIN FORM COMPONENT ---
const LoginForm: React.FC<{ onLogin: AuthPageProps['onLogin']; onSwitchToFirstAccess: () => void; }> = ({ onLogin, onSwitchToFirstAccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email || !password) {
            setError('Por favor, preencha o e-mail e a senha.');
            setIsLoading(false);
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Por favor, insira um formato de e-mail válido.');
            setIsLoading(false);
            return;
        }

        try {
            const { user, token } = await api.login(email, password);
            onLogin(user, token);
        } catch (err: any) {
            if (err.message === 'Invalid credentials') {
                setError('E-mail ou senha inválidos. Por favor, tente novamente.');
            } else {
                setError('Ocorreu um erro inesperado. Tente mais tarde.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClasses = "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
    const buttonClasses = "w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400";

    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Acesse sua conta</h2>
            
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
                <Alert message={error} />
                
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
                    É o seu primeiro acesso?{' '}
                    <button type="button" onClick={onSwitchToFirstAccess} className="font-semibold text-blue-600 hover:underline">
                        Clique aqui
                    </button>
                </p>
            </form>
        </div>
    );
};

// --- FIRST ACCESS FLOW COMPONENT ---
const FirstAccessFlow: React.FC<{ onSwitchToLogin: () => void; }> = ({ onSwitchToLogin }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const inputClasses = "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
    const buttonClasses = "w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400";

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Por favor, insira um formato de e-mail válido.');
            setIsLoading(false);
            return;
        }

        try {
            const exists = await api.checkUserExists(email);
            if (exists) {
                setStep(2);
            } else {
                setError("E-mail não encontrado. Verifique se foi digitado corretamente ou fale com o administrador.");
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao verificar o e-mail.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length === 6 && /^\d+$/.test(code)) {
            setError('');
            setStep(3);
        } else {
            setError('O código de verificação deve conter 6 números.');
        }
    };
    
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem. Tente novamente.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await api.setUserPassword(email, password);
            setStep(4);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao definir a senha.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleEmailSubmit} className="space-y-5" noValidate>
                        <p className="text-gray-600 text-center">Para começar, precisamos confirmar seu e-mail. Digite o e-mail que foi cadastrado pela sua barbearia.</p>
                        <Alert message={error} />
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} placeholder="Digite seu e-mail"/>
                        </div>
                        <div className="pt-2">
                             <button type="submit" disabled={isLoading} className={buttonClasses}>
                                {isLoading ? 'Verificando...' : 'Continuar'}
                            </button>
                        </div>
                    </form>
                );
            case 2:
                return (
                     <form onSubmit={handleCodeSubmit} className="space-y-5" noValidate>
                        <p className="text-gray-600 text-center">Enviamos um código de verificação para <strong>{email}</strong>. Digite o código abaixo para confirmar seu acesso.</p>
                        <Alert message={error} />
                        <div className="relative">
                             <SparkleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required className={inputClasses} placeholder="Código de 6 dígitos" maxLength={6}/>
                        </div>
                        <div className="text-center text-sm text-gray-500">
                            <p>O código é válido por 10 minutos.</p>
                            <p>Não recebeu o código? <button type="button" className="font-semibold text-blue-600 hover:underline">Reenviar</button></p>
                        </div>
                        <div className="pt-2">
                             <button type="submit" className={buttonClasses}>Verificar Código</button>
                        </div>
                    </form>
                );
            case 3:
                return (
                     <form onSubmit={handlePasswordSubmit} className="space-y-5" noValidate>
                        <p className="text-gray-600 text-center">Agora, crie sua senha de acesso. Use uma senha segura — ela será usada sempre que você entrar no sistema.</p>
                        <Alert message={error} />
                        <div className="relative">
                             <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} placeholder="Crie uma senha"/>
                        </div>
                        <div className="relative">
                             <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClasses} placeholder="Confirme a senha"/>
                        </div>
                        <p className="text-xs text-gray-500 text-center">A senha deve ter pelo menos 8 caracteres.</p>
                         <div className="pt-2">
                             <button type="submit" disabled={isLoading} className={buttonClasses}>
                                {isLoading ? 'Salvando...' : 'Definir Senha'}
                            </button>
                        </div>
                    </form>
                );
            case 4:
                return (
                    <div className="text-center space-y-5">
                         <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="text-2xl font-bold text-gray-900">Tudo certo!</h3>
                        <p className="text-gray-600">Sua senha foi criada com sucesso. Agora você já pode entrar na plataforma e começar a usar o sistema.</p>
                        <div className="pt-2">
                            <button onClick={onSwitchToLogin} className={buttonClasses}>Acessar minha conta</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const titles: { [key: number]: string } = {
        1: "Primeiro Acesso",
        2: "Código de Verificação",
        3: "Crie sua Senha",
        4: ""
    };

    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">{titles[step]}</h2>
            {renderStep()}
             {step < 4 && (
                <p className="text-sm text-center text-gray-600 pt-6">
                    Lembrou sua senha?{' '}
                    <button type="button" onClick={onSwitchToLogin} className="font-semibold text-blue-600 hover:underline">
                        Voltar para o login
                    </button>
                </p>
            )}
        </div>
    );
};

// --- MAIN AUTH PAGE COMPONENT ---
const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const [isLoginView, setIsLoginView] = useState(true);

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
                    {isLoginView ? (
                        <LoginForm onLogin={onLogin} onSwitchToFirstAccess={() => setIsLoginView(false)} />
                    ) : (
                        <FirstAccessFlow onSwitchToLogin={() => setIsLoginView(true)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
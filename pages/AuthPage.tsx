import React, { useState } from 'react';
import type { User, Client } from '../types';
import { USERS, CLIENTS } from '../constants';
import { MustacheIcon } from '../components/icons';
import { Role } from '../types';

interface AuthPageProps {
  onLogin: (user: User | Client) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
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
  
  const handleRegister = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      // In a real app, you'd save this to a database
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
      onLogin(newClient); // Automatically log in after registration
  }

  const FormWrapper: React.FC<{ title: string; children: React.ReactNode; onSubmit: (e: React.FormEvent) => void; }> = ({ title, children, onSubmit }) => (
     <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <div className="flex justify-center items-center mb-6">
                <MustacheIcon className="w-12 h-12 text-gray-800" />
                <h1 className="ml-2 text-2xl font-bold text-gray-800">BarberFlow</h1>
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">{title}</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
            <form onSubmit={onSubmit} className="space-y-4">
                {children}
            </form>
        </div>
    </div>
  );

  if (isLogin) {
    return (
      <FormWrapper title="Acesse sua conta" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Entrar</button>
        <p className="text-sm text-center text-gray-600">
          Não tem uma conta?{' '}
          <button type="button" onClick={() => setIsLogin(false)} className="font-medium text-blue-600 hover:underline">
            Cadastre-se aqui
          </button>
        </p>
      </FormWrapper>
    );
  }

  return (
      <FormWrapper title="Crie sua conta de cliente" onSubmit={handleRegister}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Telefone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Cadastrar</button>
        <p className="text-sm text-center text-gray-600">
          Já tem uma conta?{' '}
          <button type="button" onClick={() => setIsLogin(true)} className="font-medium text-blue-600 hover:underline">
            Faça login
          </button>
        </p>
      </FormWrapper>
  );
};

export default AuthPage;
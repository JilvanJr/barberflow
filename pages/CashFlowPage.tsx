import React, { useState, useCallback, useEffect } from 'react';
import { TRANSACTIONS } from '../constants';
import { Transaction, TransactionType } from '../types';
import { PlusIcon, XIcon } from '../components/icons';

const TransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const initialFormState = {
        name: '',
        method: 'Pix',
        type: TransactionType.INCOME,
        value: 0
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Nova Transação</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input type="text" placeholder="Ex: Corte Cliente X" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                        <input type="number" placeholder="0,00" step="0.01" required value={formData.value || ''} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TransactionType})} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                            <option value={TransactionType.INCOME}>Entrada</option>
                            <option value={TransactionType.EXPENSE}>Saída</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Método de Pagamento</label>
                        <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                            <option>Pix</option>
                            <option>Cartão de Crédito</option>
                            <option>Cartão de Débito</option>
                            <option>Dinheiro</option>
                            <option>Retirada</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CashFlowPage: React.FC = () => {
    const [transactions, setTransactions] = useState(TRANSACTIONS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.value, 0);
    const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.value, 0);
    const balance = totalIncome - totalExpense;

    const handleSave = useCallback((newTransaction: Omit<Transaction, 'id' | 'date'>) => {
        const transactionToAdd: Transaction = {
            ...newTransaction,
            id: `#ORD${String(transactions.length + 1).padStart(3, '0')}`,
            date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ de/g, ''),
        };
        setTransactions(prev => [transactionToAdd, ...prev]);
        setIsModalOpen(false);
    }, [transactions]);
    
    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Fluxo de Caixa</h2>
                 <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>Nova Transação</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Receita Total</h3>
                    <p className="mt-1 text-3xl font-semibold text-green-600">R$ {totalIncome.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Despesa Total</h3>
                    <p className="mt-1 text-3xl font-semibold text-red-600">R$ {totalExpense.toFixed(2).replace('.', ',')}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Saldo</h3>
                    <p className={`mt-1 text-3xl font-semibold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        R$ {balance.toFixed(2).replace('.', ',')}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map(transaction => (
                           <tr key={transaction.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.method}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        transaction.type === TransactionType.INCOME ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {transaction.type}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                                    {transaction.type === TransactionType.INCOME ? '+' : '-'} R$ {transaction.value.toFixed(2).replace('.', ',')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
        </div>
    );
};

export default CashFlowPage;
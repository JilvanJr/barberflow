import React, { useState, useCallback, useEffect, useMemo, useContext } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { Transaction, TransactionType, User, Role } from '../types';
import { PlusIcon, XIcon, CheckCircleIcon, TrashIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon } from '../components/icons';

const TransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id' | 'date' | 'paymentStatus' | 'completedBy'>) => void;
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

    const inputClasses = "w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 placeholder:italic placeholder:text-gray-400";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-md transform transition-all">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Nova Transação</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        <div>
                            <label className={labelClasses}>Descrição</label>
                            <input type="text" placeholder="Ex: Venda de produto" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClasses} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Valor (R$)</label>
                                <input type="number" placeholder="0,00" step="0.01" required value={formData.value || ''} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} className={inputClasses} />
                            </div>
                             <div>
                                <label className={labelClasses}>Tipo</label>
                                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TransactionType})} className={inputClasses}>
                                    <option value={TransactionType.INCOME}>Entrada</option>
                                    <option value={TransactionType.EXPENSE}>Saída</option>
                                </select>
                            </div>
                        </div>
                         <div>
                            <label className={labelClasses}>Método de Pagamento</label>
                            <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className={inputClasses}>
                                <option>Pix</option>
                                <option>Cartão de Crédito</option>
                                <option>Cartão de Débito</option>
                                <option>Dinheiro</option>
                                <option>Retirada</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end items-center space-x-3 p-6 bg-gray-50 border-t">
                         <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100">
                            Cancelar
                        </button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PaymentConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (transactionId: string, newMethod: string) => void;
    onDelete: (transactionId: string) => void;
    transaction: Transaction | null;
    canDelete: boolean;
}> = ({ isOpen, onClose, onSave, onDelete, transaction, canDelete }) => {
    const [method, setMethod] = useState('Pix');

    useEffect(() => {
        if (transaction) {
            setMethod('Pix'); // Reset to default when modal opens
        }
    }, [transaction]);
    
    if (!isOpen || !transaction) return null;

    const handleSave = () => {
        onSave(transaction.id, method);
    }

    const handleDelete = () => {
        onDelete(transaction.id);
    }

    const inputClasses = "w-full bg-gray-100 text-gray-500 rounded-lg p-3 border-2 border-gray-200 cursor-not-allowed";
    const labelClasses = "block text-sm font-medium text-gray-600 mb-1";
    
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Confirmar Pagamento</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={labelClasses}>ID da Ordem</label>
                            <input type="text" disabled value={transaction.id} className={inputClasses} />
                        </div>
                        <div className="col-span-2">
                             <label className={labelClasses}>Descrição</label>
                            <input type="text" disabled value={transaction.name} className={inputClasses} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Valor</label>
                        <input type="text" disabled value={`R$ ${transaction.value.toFixed(2).replace('.', ',')}`} className={inputClasses} />
                    </div>
                    <div>
                        <label className={`${labelClasses} text-gray-700`}>Método de Pagamento</label>
                        <select value={method} onChange={e => setMethod(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                            <option>Pix</option>
                            <option>Cartão de Crédito</option>
                            <option>Cartão de Débito</option>
                            <option>Dinheiro</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-8 mt-6 border-t border-gray-200">
                     {canDelete ? (
                        <button onClick={handleDelete} type="button" className="text-sm font-semibold text-red-600 hover:text-red-800 flex items-center space-x-1">
                            <TrashIcon className="w-4 h-4" />
                            <span>Excluir Ordem</span>
                        </button>
                    ) : <div />}
                    <button onClick={handleSave} type="submit" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Salvar e Finalizar
                    </button>
                </div>
            </div>
        </div>
    )
}

const CashFlowPage: React.FC = () => {
    const context = useContext(AppContext);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | null; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });

    if (!context || !context.currentUser || context.currentUser.role === Role.CLIENT) {
        return <div className="text-center p-8">Acesso não autorizado.</div>;
    }
    const { currentUser, showToast } = context;
    const currentUserPermissions = currentUser.permissions;

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const processedTransactions = useMemo(() => {
        let filtered = [...transactions].filter(transaction => {
            const searchLower = searchTerm.toLowerCase();
            const formattedDate = new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
            
            return (
                transaction.id.toLowerCase().includes(searchLower) ||
                formattedDate.toLowerCase().includes(searchLower) ||
                transaction.name.toLowerCase().includes(searchLower) ||
                transaction.method.toLowerCase().includes(searchLower) ||
                transaction.type.toLowerCase().includes(searchLower) ||
                transaction.paymentStatus.toLowerCase().includes(searchLower)
            );
        });

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [transactions, searchTerm, sortConfig]);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedTransactions.slice(startIndex, startIndex + itemsPerPage);
    }, [processedTransactions, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(processedTransactions.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    const requestSort = (key: keyof Transaction) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ de/g, '').replace('.', '');
    }

    const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME && t.paymentStatus === 'completed').reduce((acc, t) => acc + t.value, 0);
    const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.value, 0);
    const balance = totalIncome - totalExpense;

    const handleSave = useCallback(async (newTransaction: Omit<Transaction, 'id' | 'date' | 'paymentStatus' | 'completedBy'>) => {
        if (!currentUser) return;
        try {
            await api.createTransaction(newTransaction, currentUser.name);
            showToast('Transação adicionada com sucesso!', 'success');
            setIsModalOpen(false);
            fetchTransactions();
        } catch (error) {
            showToast('Falha ao adicionar transação.', 'error');
        }
    }, [fetchTransactions, currentUser, showToast]);
    
    const handleOpenPaymentModal = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsPaymentModalOpen(true);
    };

    const handleSavePayment = async (transactionId: string, newMethod: string) => {
        if (!currentUser) return;
        try {
            await api.confirmPayment(transactionId, newMethod, currentUser.name);
            showToast('Pagamento confirmado com sucesso!', 'success');
            setIsPaymentModalOpen(false);
            setSelectedTransaction(null);
            fetchTransactions();
        } catch (error) {
            showToast('Falha ao confirmar pagamento.', 'error');
        }
    };

    const handleDeleteTransaction = async (transactionId: string) => {
        try {
            await api.deleteTransaction(transactionId);
            showToast('Ordem excluída com sucesso!', 'success');
            setIsPaymentModalOpen(false);
            setSelectedTransaction(null);
            fetchTransactions();
        } catch (error) {
            showToast('Falha ao excluir ordem.', 'error');
        }
    };

    const SortableHeader: React.FC<{ columnKey: keyof Transaction; title: string; }> = ({ columnKey, title }) => {
        const isSorted = sortConfig.key === columnKey;
        const icon = isSorted 
            ? (sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-4 h-4 ml-1 text-gray-800" /> : <ArrowDownIcon className="w-4 h-4 ml-1 text-gray-800" />) 
            : <div className="w-4 h-4 ml-1" />;
        
        return (
             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button onClick={() => requestSort(columnKey)} className="flex items-center group">
                    <span className="group-hover:text-gray-900">{title}</span>
                    {icon}
                </button>
            </th>
        );
    };
    
    if (isLoading) {
        return <div className="text-center p-8">Carregando fluxo de caixa...</div>;
    }

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filtrar transações..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-72 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                </div>
                 {currentUserPermissions?.canAddTransaction && (
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                        <PlusIcon className="w-5 h-5" />
                        <span>Nova Transação</span>
                    </button>
                 )}
            </div>
            
            {currentUserPermissions?.canViewCashFlowDashboard && (
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
            )}


            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <SortableHeader columnKey="id" title="ID" />
                            <SortableHeader columnKey="date" title="Data" />
                            <SortableHeader columnKey="name" title="Descrição" />
                            <SortableHeader columnKey="method" title="Método" />
                            <SortableHeader columnKey="type" title="Tipo" />
                            <SortableHeader columnKey="value" title="Valor" />
                            <SortableHeader columnKey="paymentStatus" title="Status" />
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedTransactions.map(transaction => (
                           <tr key={transaction.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(transaction.date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{transaction.name}</td>
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
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {transaction.paymentStatus === 'pending' && currentUserPermissions?.canConfirmPayment ? (
                                        <button onClick={() => handleOpenPaymentModal(transaction)} className="text-gray-800 bg-yellow-300 hover:bg-yellow-400 font-medium rounded-lg text-xs px-3 py-1.5 text-center">
                                            Confirmar
                                        </button>
                                    ) : transaction.paymentStatus === 'pending' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Pendente
                                        </span>
                                    ) : (
                                        transaction.paymentStatus === 'completed' && (
                                            <div className="relative group flex items-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                                    Finalizado
                                                </span>
                                                {transaction.completedBy && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 scale-95 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
                                                        Finalizado por: {transaction.completedBy}
                                                        <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {totalPages > 0 && (
                    <div className="py-4 px-6 flex items-center justify-between border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                            Mostrando <span className="font-semibold">{Math.min(processedTransactions.length, (currentPage - 1) * itemsPerPage + 1)}</span> a <span className="font-semibold">{Math.min(currentPage * itemsPerPage, processedTransactions.length)}</span> de <span className="font-semibold">{processedTransactions.length}</span> resultados
                        </span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <span className="text-sm text-gray-700">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {currentUserPermissions?.canAddTransaction && (
                <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
            )}
            {currentUserPermissions?.canConfirmPayment && (
                <PaymentConfirmationModal 
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSave={handleSavePayment}
                    onDelete={handleDeleteTransaction}
                    transaction={selectedTransaction}
                    canDelete={!!currentUserPermissions?.canDeleteTransaction}
                />
            )}
        </div>
    );
};

export default CashFlowPage;
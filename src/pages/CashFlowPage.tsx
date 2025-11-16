

import React, { useState, useCallback, useEffect, useMemo, useContext, useRef } from 'react';
import { AppContext } from '../App';
import { api } from '../api';
import { Transaction, TransactionType, Role, TransactionStatus } from '../types';
import { PlusIcon, XIcon, SearchIcon, EyeIcon, BanIcon, CheckIcon, TrendingUpIcon, TrendingDownIcon, WalletIcon, AlertTriangleIcon, ClockIcon, CheckCircleIcon, CalendarIcon, FilterIcon } from '../components/icons';

type Period = 'hoje' | 'ontem' | 'semana' | 'mes' | 'custom';
type ModalType = 'new' | 'details' | 'confirm' | 'cancel' | 'dateRange' | null;

// Date Helpers
const getTodayLocalISOString = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
};

// Modal Components
const NewTransactionModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: any) => void; }> = ({ isOpen, onClose, onSave }) => {
    const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [method, setMethod] = useState('Pix');
    const [date, setDate] = useState(getTodayLocalISOString());


    const handleSave = () => {
        if (description && value && parseFloat(value) > 0 && date) {
            onSave({
                name: type === TransactionType.INCOME ? 'Entrada Manual' : 'Saída Manual',
                description,
                value: parseFloat(value),
                type,
                method,
                date,
            });
            onClose();
        } else {
            alert('Por favor, preencha todos os campos corretamente.');
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setDescription('');
            setValue('');
            setType(TransactionType.INCOME);
            setMethod('Pix');
            setDate(getTodayLocalISOString());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Nova Transação</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Venda de produto" className="w-full bg-white border border-gray-300 rounded-lg p-2.5 placeholder:italic placeholder:text-gray-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Valor (R$)</label>
                            <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" className="w-full bg-white border border-gray-300 rounded-lg p-2.5 placeholder:italic placeholder:text-gray-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
                            <select value={type} onChange={e => setType(e.target.value as TransactionType)} className="w-full bg-white border border-gray-300 rounded-lg p-2.5">
                                <option value={TransactionType.INCOME}>Entrada</option>
                                <option value={TransactionType.EXPENSE}>Saída</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Data</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Método de Pagamento</label>
                            <select value={method} onChange={e => setMethod(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2.5">
                                <option>Pix</option>
                                <option>Dinheiro</option>
                                <option>Cartão de Crédito</option>
                                <option>Cartão de Débito</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end items-center space-x-3 p-6 bg-gray-50 border-t">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100">Cancelar</button>
                    <button onClick={handleSave} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Salvar</button>
                </div>
            </div>
        </div>
    );
};

const TransactionDetailsModal: React.FC<{ isOpen: boolean; onClose: () => void; transaction: Transaction | null; }> = ({ isOpen, onClose, transaction }) => {
    if (!isOpen || !transaction) return null;
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Detalhes da Transação</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200 text-sm">
                    <p><strong>ID:</strong> {transaction.id}</p>
                    <p><strong>Nome:</strong> {transaction.name}</p>
                    <p><strong>Descrição:</strong> {transaction.description}</p>
                    <p><strong>Data:</strong> {new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    <p><strong>Valor:</strong> <span className={transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}>R$ {transaction.value.toFixed(2).replace('.', ',')}</span></p>
                    <p><strong>Tipo:</strong> {transaction.type}</p>
                    <p><strong>Status:</strong> {transaction.status}</p>
                    <p><strong>Método:</strong> {transaction.method}</p>
                    {transaction.completedBy && <p><strong>Finalizado por:</strong> {transaction.completedBy}</p>}
                </div>
                 <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100">Fechar</button>
                </div>
            </div>
        </div>
    );
};

const ConfirmPaymentModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: (method: string) => void; transaction: Transaction | null; }> = ({ isOpen, onClose, onConfirm, transaction }) => {
    const [method, setMethod] = useState('Pix');
    if (!isOpen || !transaction) return null;
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800">Finalizar Pagamento</h2>
                <p className="text-gray-600 my-4">Selecione o método de pagamento para a transação de <span className="font-bold">{transaction.name}</span> no valor de R$ {transaction.value.toFixed(2)}.</p>
                <select value={method} onChange={e => setMethod(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2.5 mb-6">
                    <option>Pix</option>
                    <option>Dinheiro</option>
                    <option>Cartão de Crédito</option>
                    <option>Cartão de Débito</option>
                </select>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100">Cancelar</button>
                    <button onClick={() => onConfirm(method)} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; }> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md text-center">
                <AlertTriangleIcon className="mx-auto w-12 h-12 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-800 mt-4">{title}</h2>
                <p className="text-gray-600 my-4">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={onClose} className="px-6 py-2.5 w-full bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Não</button>
                    <button onClick={onConfirm} className="px-6 py-2.5 w-full text-white font-semibold rounded-lg bg-red-600 hover:bg-red-700">Sim, Cancelar</button>
                </div>
            </div>
        </div>
    );
};

const DateRangeModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onApply: (range: {start: string, end: string}) => void;
    currentRange: {start: string | null, end: string | null};
}> = ({ isOpen, onClose, onApply, currentRange }) => {
    const [startDate, setStartDate] = useState(currentRange.start || getTodayLocalISOString());
    const [endDate, setEndDate] = useState(currentRange.end || getTodayLocalISOString());

    if (!isOpen) return null;

    const handleApply = () => {
        onApply({ start: startDate, end: endDate });
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Selecionar Período</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de Início</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg p-2.5" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Data Final</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} className="w-full bg-white border border-gray-300 rounded-lg p-2.5" />
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100">Cancelar</button>
                    <button onClick={handleApply} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Aplicar</button>
                </div>
            </div>
        </div>
    )
}

const CashFlowPage: React.FC = () => {
    const context = useContext(AppContext);
    
    // Page state
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [activePeriod, setActivePeriod] = useState<Period>('hoje');
    const [customDateRange, setCustomDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    
    // Modal states
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    if (!context || !context.currentUser || context.currentUser.role === Role.CLIENT) {
        return <div className="text-center p-8">Acesso não autorizado.</div>;
    }
    const { currentUser, showToast } = context;
    const { canAddTransaction, canConfirmPayment, canDeleteTransaction } = currentUser.permissions;

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getTransactions();
            setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = useMemo(() => {
        let items = [...transactions];

        const today = new Date();
        today.setHours(0,0,0,0);

        if (activePeriod === 'custom' && customDateRange.start && customDateRange.end) {
             const start = new Date(customDateRange.start + 'T00:00:00').getTime();
             const end = new Date(customDateRange.end + 'T00:00:00').getTime();
             items = items.filter(t => {
                 const transactionDate = new Date(t.date + 'T00:00:00').getTime();
                 return transactionDate >= start && transactionDate <= end;
             });
        } else {
            switch (activePeriod) {
                case 'hoje':
                    items = items.filter(t => t.date === getTodayLocalISOString());
                    break;
                case 'ontem':
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    items = items.filter(t => t.date === yesterday.toISOString().split('T')[0]);
                    break;
                case 'semana':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    items = items.filter(t => new Date(t.date + 'T00:00:00') >= weekStart);
                    break;
                case 'mes':
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    items = items.filter(t => new Date(t.date + 'T00:00:00') >= monthStart);
                    break;
            }
        }
       
        if (typeFilter !== 'all') items = items.filter(t => t.type === typeFilter);
        if (statusFilter !== 'all') items = items.filter(t => t.status === statusFilter);
        if (methodFilter !== 'all') items = items.filter(t => t.method === methodFilter);
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            items = items.filter(t => t.name.toLowerCase().includes(lower) || t.id.toLowerCase().includes(lower));
        }

        return items;
    }, [transactions, activePeriod, customDateRange, searchTerm, typeFilter, statusFilter, methodFilter]);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTransactions, currentPage]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    useEffect(() => { setCurrentPage(1) }, [activePeriod, customDateRange, searchTerm, typeFilter, statusFilter, methodFilter]);
    
    const { faturamento, despesas, resultado } = useMemo(() => {
        const faturamento = filteredTransactions.filter(t => t.type === TransactionType.INCOME && t.status === 'Finalizado').reduce((s, t) => s + t.value, 0);
        const despesas = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE && t.status !== 'Cancelado').reduce((s, t) => s + t.value, 0);
        return { faturamento, despesas, resultado: faturamento - despesas };
    }, [filteredTransactions]);

    const handleOpenModal = (type: ModalType, transaction: Transaction | null = null) => {
        setSelectedTransaction(transaction);
        setActiveModal(type);
    };

    const handleCloseModal = () => setActiveModal(null);

    const handleSaveTransaction = async (data: any) => {
        await api.createTransaction(data, currentUser.name);
        fetchTransactions();
        showToast('Lançamento salvo com sucesso!', 'success');
    };

    const handleConfirmPayment = async (method: string) => {
        if (selectedTransaction) {
            await api.confirmPayment(selectedTransaction.id, method, currentUser.name);
            fetchTransactions();
            showToast('Pagamento finalizado com sucesso!', 'success');
            handleCloseModal();
        }
    };

    const handleCancelTransaction = async () => {
        if (selectedTransaction) {
            await api.cancelTransaction(selectedTransaction.id, currentUser.name);
            fetchTransactions();
            showToast('Lançamento cancelado!', 'success');
            handleCloseModal();
        }
    };
    
    const handleClearFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setStatusFilter('all');
        setMethodFilter('all');
        setActivePeriod('hoje');
        setCustomDateRange({ start: null, end: null });
    }

    const StatusBadge: React.FC<{ status: TransactionStatus }> = ({ status }) => {
        const colors = {
            Finalizado: 'bg-green-100 text-green-800',
            Pendente: 'bg-yellow-100 text-yellow-800',
            Cancelado: 'bg-red-100 text-red-800',
        };
        const icon = {
            Finalizado: <CheckCircleIcon className="w-4 h-4 mr-1.5"/>,
            Pendente: <ClockIcon className="w-4 h-4 mr-1.5"/>,
            Cancelado: <BanIcon className="w-4 h-4 mr-1.5"/>
        }
        return <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{icon[status]}{status}</span>;
    };

    const PeriodButton: React.FC<{ period: Period, label: string }> = ({ period, label }) => (
        <button 
            onClick={() => { setActivePeriod(period); setCustomDateRange({start: null, end: null}); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activePeriod === period ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
            {label}
        </button>
    );

    if (isLoading) return <div className="text-center p-8">Carregando fluxo de caixa...</div>;
    
    const customDateDisplay = customDateRange.start && customDateRange.end
    ? `${new Date(customDateRange.start + 'T00:00:00').toLocaleDateString('pt-BR')} - ${new Date(customDateRange.end + 'T00:00:00').toLocaleDateString('pt-BR')}`
    : 'Escolher Data';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center flex-wrap gap-2 bg-white p-1 rounded-lg border">
                    <PeriodButton period="hoje" label="Hoje"/>
                    <PeriodButton period="ontem" label="Ontem"/>
                    <PeriodButton period="semana" label="Essa Semana"/>
                    <PeriodButton period="mes" label="Esse Mês"/>
                    <div className="relative">
                        <button 
                            onClick={() => handleOpenModal('dateRange')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activePeriod === 'custom' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        >
                            <CalendarIcon className="w-4 h-4" />
                            <span>{customDateDisplay}</span>
                        </button>
                    </div>
                </div>
                {canAddTransaction && (
                     <button onClick={() => handleOpenModal('new')} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                        <PlusIcon className="w-5 h-5" />
                        <span>Novo Lançamento</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full"><TrendingUpIcon className="w-6 h-6 text-green-600"/></div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Faturamento</h3>
                        <p className="text-2xl font-bold text-gray-800">R$ {faturamento.toFixed(2).replace('.', ',')}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-full"><TrendingDownIcon className="w-6 h-6 text-red-600"/></div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Despesas</h3>
                        <p className="text-2xl font-bold text-gray-800">R$ {despesas.toFixed(2).replace('.', ',')}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full"><WalletIcon className="w-6 h-6 text-blue-600"/></div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Resultado</h3>
                        <p className="text-2xl font-bold text-gray-800">R$ {resultado.toFixed(2).replace('.', ',')}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                 <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                    <div className="relative md:col-span-3">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" placeholder="Buscar por ID ou nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pl-10" />
                    </div>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                        <option value="all">Tipo</option>
                        <option value={TransactionType.INCOME}>Entrada</option>
                        <option value={TransactionType.EXPENSE}>Saída</option>
                    </select>
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                        <option value="all">Status</option>
                        <option value="Finalizado">Finalizado</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>
                     <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                        <option value="all">Método</option>
                        <option>Pix</option>
                        <option>Dinheiro</option>
                        <option>Cartão de Crédito</option>
                        <option>Cartão de Débito</option>
                        <option>Aguardando</option>
                        <option>N/A</option>
                    </select>
                    <button onClick={handleClearFilters} title="Limpar Filtros" className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 text-gray-600">
                        <FilterIcon className="w-5 h-5 mx-auto"/>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                         {paginatedTransactions.map(t => (
                            <tr key={t.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{t.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">{t.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.value.toFixed(2).replace('.', ',')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={t.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-1">
                                        <button onClick={() => handleOpenModal('details', t)} title="Visualizar" className="text-gray-400 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100"><EyeIcon className="w-5 h-5"/></button>
                                        {t.status === 'Pendente' && canConfirmPayment && <button onClick={() => handleOpenModal('confirm', t)} title="Finalizar Pagamento" className="text-gray-400 hover:text-green-600 p-1 rounded-md hover:bg-gray-100"><CheckIcon className="w-5 h-5"/></button>}
                                        {t.status === 'Pendente' && canDeleteTransaction && <button onClick={() => handleOpenModal('cancel', t)} title="Cancelar Lançamento" className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-gray-100"><BanIcon className="w-5 h-5"/></button>}
                                    </div>
                                </td>
                            </tr>
                         ))}
                    </tbody>
                </table>
                 {totalPages > 1 && (
                    <div className="py-4 px-6 flex items-center justify-between border-t">
                        <span className="text-sm text-gray-600">Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length}</span>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm rounded-md border disabled:opacity-50">Anterior</button>
                            <span className="text-sm text-gray-700">Página {currentPage} de {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm rounded-md border disabled:opacity-50">Próximo</button>
                        </div>
                    </div>
                )}
            </div>
            
            <NewTransactionModal isOpen={activeModal === 'new'} onClose={handleCloseModal} onSave={handleSaveTransaction} />
            <TransactionDetailsModal isOpen={activeModal === 'details'} onClose={handleCloseModal} transaction={selectedTransaction} />
            <ConfirmPaymentModal isOpen={activeModal === 'confirm'} onClose={handleCloseModal} onConfirm={handleConfirmPayment} transaction={selectedTransaction} />
            <ConfirmationModal 
                isOpen={activeModal === 'cancel'}
                onClose={handleCloseModal}
                onConfirm={handleCancelTransaction}
                title="Cancelar Lançamento"
                message={`Tem certeza que deseja cancelar o lançamento "${selectedTransaction?.description}"? Esta ação não pode ser desfeita.`}
            />
            <DateRangeModal
                isOpen={activeModal === 'dateRange'}
                onClose={handleCloseModal}
                currentRange={customDateRange}
                onApply={(range) => {
                    setCustomDateRange(range);
                    setActivePeriod('custom');
                }}
            />
        </div>
    );
};

export default CashFlowPage;
import { Role, User, Client, Service, Appointment, Transaction, TransactionType, Permissions, OperatingHours } from './types';

const getTodayLocalISOString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const today = getTodayLocalISOString();

export const fullAdminPermissions: Permissions = {
  canViewAgenda: true,
  canCreateAppointment: true,
  canCancelAppointment: true,
  canViewClients: true,
  canCreateClient: true,
  canEditClient: true,
  canDeleteClient: true,
  canViewServices: true,
  canCreateService: true,
  canEditService: true,
  canDeleteService: true,
  canViewTeam: true,
  canCreateTeamMember: true,
  canEditTeamMember: true,
  canDeleteTeamMember: true,
  canViewCashFlow: true,
  canViewCashFlowDashboard: true,
  canConfirmPayment: true,
  canAddTransaction: true,
  canDeleteTransaction: true,
};

export const defaultBarberPermissions: Permissions = {
  canViewAgenda: true,
  canCreateAppointment: true,
  canCancelAppointment: true,
  canViewClients: true,
  canCreateClient: true,
  canEditClient: false,
  canDeleteClient: false,
  canViewServices: true,
  canCreateService: false,
  canEditService: false,
  canDeleteService: false,
  canViewTeam: false,
  canCreateTeamMember: false,
  canEditTeamMember: false,
  canDeleteTeamMember: false,
  canViewCashFlow: false,
  canViewCashFlowDashboard: false,
  canConfirmPayment: false,
  canAddTransaction: false,
  canDeleteTransaction: false,
};

export const receptionistPermissions: Permissions = {
  canViewAgenda: true,
  canCreateAppointment: true,
  canCancelAppointment: true,
  canViewClients: true,
  canCreateClient: true,
  canEditClient: true,
  canDeleteClient: false,
  canViewServices: true,
  canCreateService: false,
  canEditService: false,
  canDeleteService: false,
  canViewTeam: false,
  canCreateTeamMember: false,
  canEditTeamMember: false,
  canDeleteTeamMember: false,
  canViewCashFlow: false,
  canViewCashFlowDashboard: false,
  canConfirmPayment: false,
  canAddTransaction: false,
  canDeleteTransaction: false,
};

export const DEFAULT_OPERATING_HOURS: OperatingHours = {
  sunday: { isOpen: false, openTime: '09:00', closeTime: '18:00' },
  monday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
  saturday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
};


export const USERS: User[] = [
  { id: 1, name: 'Natan Borges', email: 'admin@barberflow.com', avatarUrl: 'https://i.pravatar.cc/150?u=natan', phone: '(11) 98765-4321', role: Role.ADMIN, password: 'admin', permissions: fullAdminPermissions, status: 'active', jobTitle: 'Admin', accessProfile: 'Admin', workStartTime: '09:00', workEndTime: '19:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { id: 2, name: 'Barbeiro Dois', email: 'barber@barberflow.com', avatarUrl: 'https://i.pravatar.cc/150?u=barber2', phone: '(11) 98765-4322', role: Role.BARBER, password: 'barber', permissions: defaultBarberPermissions, status: 'active', jobTitle: 'Barbeiro', accessProfile: 'Barbeiro', workStartTime: '09:00', workEndTime: '19:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { id: 3, name: 'Recepcionista Ana', email: 'recepcao@barberflow.com', avatarUrl: 'https://i.pravatar.cc/150?u=ana', phone: '(11) 98765-4323', role: Role.BARBER, password: 'recepcao', permissions: receptionistPermissions, status: 'active', jobTitle: 'Recepcionista', accessProfile: 'Recepcionista', workStartTime: '09:00', workEndTime: '19:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { id: 4, name: 'Barbeiro 1', email: 'b1@email.com', avatarUrl: 'https://i.pravatar.cc/150?u=barber1', phone: '(11) 98765-4324', role: Role.BARBER, password: 'password', permissions: defaultBarberPermissions, status: 'active', jobTitle: 'Barbeiro', accessProfile: 'Barbeiro', workStartTime: '09:00', workEndTime: '19:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { id: 5, name: 'Barbeiro 3', email: 'b3@email.com', avatarUrl: 'https://i.pravatar.cc/150?u=barber3', phone: '(11) 98765-4325', role: Role.BARBER, password: 'password', permissions: defaultBarberPermissions, status: 'active', jobTitle: 'Barbeiro', accessProfile: 'Barbeiro', workStartTime: '09:00', workEndTime: '15:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { id: 6, name: 'Barbeiro 4', email: 'b4@email.com', avatarUrl: 'https://i.pravatar.cc/150?u=barber4', phone: '(11) 98765-4326', role: Role.BARBER, password: 'password', permissions: defaultBarberPermissions, status: 'inactive', jobTitle: 'Barbeiro', accessProfile: 'Barbeiro', workStartTime: '09:00', workEndTime: '19:00', lunchStartTime: '13:00', lunchEndTime: '14:00' },
];

export const CLIENTS: Client[] = [
  { id: 1, name: 'Manuel Neuer', birthDate: '01/01/2000', phone: '(11) 91234-5678', email: 'client@barberflow.com', cpf: '111.111.111-11', password: 'client', role: Role.CLIENT, status: 'active' },
  { id: 2, name: 'Lionel Messi', birthDate: '01/01/2000', phone: '(11) 91234-5679', email: 'messi@email.com', cpf: '222.222.222-22', role: Role.CLIENT, status: 'active' },
  { id: 3, name: 'Harry Kane', birthDate: '01/01/2000', phone: '(11) 91234-5610', email: 'kane@email.com', cpf: '333.333.333-33', role: Role.CLIENT, status: 'active' },
  { id: 4, name: 'Roberto Carlos', birthDate: '01/01/2000', phone: '(11) 91234-5611', email: 'roberto@email.com', cpf: '444.444.444-44', role: Role.CLIENT, status: 'inactive' },
  { id: 5, name: 'Renato Torres', birthDate: '01/01/2000', phone: '(11) 91234-5612', email: 'renato@email.com', cpf: '555.555.555-55', role: Role.CLIENT, status: 'active' },
  { id: 6, name: 'Yago Oproprio', birthDate: '01/01/2000', phone: '(11) 91234-5613', email: 'yago@email.com', cpf: '666.666.666-66', role: Role.CLIENT, status: 'active' },
  { id: 7, name: 'Luccas Carlos', birthDate: '01/01/2000', phone: '(11) 91234-5614', email: 'luccas@email.com', cpf: '777.777.777-77', role: Role.CLIENT, status: 'active' },
  { id: 8, name: 'Filipe Ret', birthDate: '01/01/2000', phone: '(11) 91234-5615', email: 'filipe@email.com', cpf: '888.888.888-88', role: Role.CLIENT, status: 'inactive' },
  { id: 9, name: 'Teto', birthDate: '01/01/2000', phone: '(11) 91234-5616', email: 'teto@email.com', cpf: '999.999.999-99', role: Role.CLIENT, status: 'active' },
];

export const SERVICES: Service[] = [
  { id: 1, name: 'Barba', price: 70, duration: 40, status: 'active' },
  { id: 2, name: 'Corte', price: 70, duration: 40, status: 'active' },
  { id: 3, name: 'Corte e Barba', price: 125, duration: 60, status: 'active' },
  { id: 4, name: 'Corte (tamanho único-careca)', price: 50, duration: 30, status: 'active' },
  { id: 5, name: 'Corte Infantil', price: 70, duration: 40, status: 'active' },
  { id: 6, name: 'Corte (tamanho único-careca)/Barba', price: 95, duration: 60, status: 'active' },
  { id: 7, name: 'Corte/Sobrancelha', price: 90, duration: 40, status: 'active' },
  { id: 8, name: 'Corte/barba/sobrancelha', price: 145, duration: 60, status: 'active' },
  { id: 9, name: 'Corte e barba c/ barboterapia', price: 155, duration: 60, status: 'active' },
  { id: 10, name: 'Acabamento (contorno)', price: 30, duration: 10, status: 'active' },
  { id: 11, name: 'Acabamento (contorno) c/ barba', price: 90, duration: 40, status: 'active' },
  { id: 12, name: 'Acabamento (contorno) c/ corte', price: 90, duration: 40, status: 'active' },
  { id: 13, name: 'Barba c/ espuma quente', price: 90, duration: 40, status: 'active' },
  { id: 14, name: 'Barba c/barboterapia', price: 100, duration: 60, status: 'active' },
  { id: 15, name: 'Combo Elemento', price: 270, duration: 90, status: 'active' },
  { id: 16, name: 'Combo Origem', price: 180, duration: 60, status: 'active' },
  { id: 17, name: 'Combo Soberano', price: 300, duration: 100, status: 'active' },
  { id: 18, name: 'Corte (Cabelo Afro)', price: 80, duration: 60, status: 'active' },
  { id: 19, name: 'Corte (cabelo longo)', price: 90, duration: 80, status: 'active' },
  { id: 20, name: 'Corte (tamanho único-careca) + barba c/ barboterapia', price: 125, duration: 60, status: 'active' },
  { id: 21, name: 'Corte (tamanho único-careca) + barba c/ barboterapia e hidratação', price: 155, duration: 60, status: 'active' },
  { id: 22, name: 'Corte (tamanho único-careca) c/ espuma quente', price: 70, duration: 40, status: 'active' },
  { id: 23, name: 'Corte (tamanho ùnico-careca) e barba c/ espuma quente', price: 125, duration: 60, status: 'active' },
  { id: 24, name: 'Corte (tamanho único-careca)/Barba + sobrancelha', price: 115, duration: 60, status: 'active' },
  { id: 25, name: 'Corte c/ hidratação', price: 100, duration: 60, status: 'active' },
  { id: 26, name: 'Corte c/ Progressiva', price: 220, duration: 80, status: 'active' },
  { id: 27, name: 'Corte e Barba c/ espuma quente', price: 150, duration: 110, status: 'active' },
  { id: 28, name: 'Depilação Auricular (cera)', price: 30, duration: 10, status: 'active' },
  { id: 29, name: 'Depilação Nasal (cera)', price: 30, duration: 10, status: 'active' },
  { id: 30, name: 'Depilação nasal e auricular (cera)', price: 50, duration: 30, status: 'active' },
  { id: 31, name: 'Freestyle', price: 20, duration: 10, status: 'active' },
  { id: 32, name: 'Freestyle (feminino)', price: 50, duration: 30, status: 'active' },
  { id: 33, name: 'Hidratação', price: 40, duration: 10, status: 'active' },
  { id: 34, name: 'Limpeza Facial', price: 40, duration: 10, status: 'active' },
  { id: 35, name: 'Penteado', price: 50, duration: 20, status: 'active' },
  { id: 36, name: 'Progressiva', price: 150, duration: 40, status: 'active' },
  { id: 37, name: 'Selagem', price: 130, duration: 40, status: 'active' },
  { id: 38, name: 'Sobrancelha', price: 30, duration: 10, status: 'active' },
];

export const APPOINTMENTS: Appointment[] = [];

export const TRANSACTIONS: Transaction[] = [
    { id: '#ORD001', date: today, name: 'Cliente 1', method: 'Cartão de Crédito', type: TransactionType.INCOME, value: 49.90, paymentStatus: 'completed', completedBy: 'Natan Borges' },
    { id: '#ORD002', date: today, name: 'Cliente 2', method: 'Dinheiro', type: TransactionType.INCOME, value: 49.90, paymentStatus: 'completed', completedBy: 'Natan Borges' },
    { id: '#ORD003', date: today, name: 'Natan Borges Ltda.', method: 'Retirada', type: TransactionType.EXPENSE, value: 250.00, paymentStatus: 'completed', completedBy: 'Natan Borges' },
    { id: '#ORD004', date: '2025-10-07', name: 'Cliente 4', method: 'Cartão de Crédito', type: TransactionType.INCOME, value: 49.90, paymentStatus: 'completed', completedBy: 'Natan Borges' },
    { id: '#ORD005', date: '2025-10-07', name: 'Cliente 5', method: 'Cartão de Débito', type: TransactionType.INCOME, value: 49.90, paymentStatus: 'completed', completedBy: 'Natan Borges' },
    { id: '#ORD006', date: '2025-10-07', name: 'Cliente 6', method: 'Pix', type: TransactionType.INCOME, value: 49.90, paymentStatus: 'completed', completedBy: 'Natan Borges' },
    { id: '#ORD007', date: '2025-10-07', name: 'Cliente 7', method: 'Dinheiro', type: TransactionType.INCOME, value: 49.90, paymentStatus: 'completed', completedBy: 'Natan Borges' },
    { id: '#ORD008', date: '2025-10-08', name: 'Cliente 8', method: 'Pix', type: TransactionType.INCOME, value: 35.90, paymentStatus: 'completed', completedBy: 'Natan Borges' },
    { id: '#ORD009', date: '2025-10-08', name: 'Cliente 9', method: 'Cartão de Crédito', type: TransactionType.INCOME, value: 99.80, paymentStatus: 'completed', completedBy: 'Natan Borges' },
];
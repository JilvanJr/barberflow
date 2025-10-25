import { Role, User, Client, Service, Barber, Appointment, Transaction, TransactionType, Permissions, OperatingHours } from './types';

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
  { id: 1, name: 'Natan Borges', email: 'admin@barberflow.com', avatarUrl: 'https://i.pravatar.cc/150?u=natan', role: Role.ADMIN, password: 'admin', permissions: fullAdminPermissions },
  { id: 2, name: 'Barbeiro Dois', email: 'barber@barberflow.com', avatarUrl: 'https://i.pravatar.cc/150?u=barber2', role: Role.BARBER, password: 'barber', permissions: defaultBarberPermissions },
  { id: 3, name: 'Recepcionista Ana', email: 'recepcao@barberflow.com', avatarUrl: 'https://i.pravatar.cc/150?u=ana', role: Role.BARBER, password: 'recepcao', permissions: receptionistPermissions },
  { id: 4, name: 'Barbeiro 1', email: 'b1@email.com', avatarUrl: 'https://i.pravatar.cc/150?u=barber1', role: Role.BARBER, password: 'password', permissions: defaultBarberPermissions },
  { id: 5, name: 'Barbeiro 3', email: 'b3@email.com', avatarUrl: 'https://i.pravatar.cc/150?u=barber3', role: Role.BARBER, password: 'password', permissions: defaultBarberPermissions },
  { id: 6, name: 'Barbeiro 4', email: 'b4@email.com', avatarUrl: 'https://i.pravatar.cc/150?u=barber4', role: Role.BARBER, password: 'password', permissions: defaultBarberPermissions },
];

export const BARBERS: Barber[] = [
  { id: 1, name: 'Barbeiro 1', avatarUrl: 'https://i.pravatar.cc/150?u=barber1', email: 'b1@email.com', workStartTime: '09:00', workEndTime: '19:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { id: 2, name: 'Barbeiro 2', avatarUrl: 'https://i.pravatar.cc/150?u=barber2', email: 'barber@barberflow.com', workStartTime: '09:00', workEndTime: '19:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { id: 3, name: 'Barbeiro 3', avatarUrl: 'https://i.pravatar.cc/150?u=barber3', email: 'b3@email.com', workStartTime: '09:00', workEndTime: '15:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { id: 4, name: 'Barbeiro 4', avatarUrl: 'https://i.pravatar.cc/150?u=barber4', email: 'b4@email.com', workStartTime: '09:00', workEndTime: '19:00', lunchStartTime: '13:00', lunchEndTime: '14:00' },
];

export const CLIENTS: Client[] = [
  { id: 1, name: 'Manuel Neuer', birthDate: '01/01/2000', phone: '(11) 9 1234-5678', email: 'client@barberflow.com', cpf: '111.111.111-11', password: 'client', role: Role.CLIENT },
  { id: 2, name: 'Lionel Messi', birthDate: '01/01/2000', phone: '(11) 9 1234-5678', email: 'messi@email.com', cpf: '222.222.222-22', role: Role.CLIENT },
  { id: 3, name: 'Harry Kane', birthDate: '01/01/2000', phone: '(11) 9 1234-5678', email: 'kane@email.com', cpf: '333.333.333-33', role: Role.CLIENT },
  { id: 4, name: 'Roberto Carlos', birthDate: '01/01/2000', phone: '(11) 9 1234-5678', email: 'roberto@email.com', cpf: '444.444.444-44', role: Role.CLIENT },
  { id: 5, name: 'Renato Torres', birthDate: '01/01/2000', phone: '(11) 9 1234-5678', email: 'renato@email.com', cpf: '555.555.555-55', role: Role.CLIENT },
  { id: 6, name: 'Yago Oproprio', birthDate: '01/01/2000', phone: '(11) 9 1234-5678', email: 'yago@email.com', cpf: '666.666.666-66', role: Role.CLIENT },
  { id: 7, name: 'Luccas Carlos', birthDate: '01/01/2000', phone: '(11) 9 1234-5678', email: 'luccas@email.com', cpf: '777.777.777-77', role: Role.CLIENT },
  { id: 8, name: 'Filipe Ret', birthDate: '01/01/2000', phone: '(11) 9 1234-5678', email: 'filipe@email.com', cpf: '888.888.888-88', role: Role.CLIENT },
  { id: 9, name: 'Teto', birthDate: '01/01/2000', phone: '(11) 9 1234-5678', email: 'teto@email.com', cpf: '999.999.999-99', role: Role.CLIENT },
];

export const SERVICES: Service[] = [
  { id: 1, name: 'Barba', price: 15.90, duration: 20 },
  { id: 2, name: 'Corte', price: 25.00, duration: 30 },
  { id: 3, name: 'Corte + Barba', price: 35.90, duration: 50 },
  { id: 4, name: 'Pezinho', price: 10.00, duration: 15 },
  { id: 5, name: 'Relaxamento', price: 50.00, duration: 60 },
  { id: 6, name: 'Sobrancelha', price: 15.00, duration: 15 },
];

export const APPOINTMENTS: Appointment[] = [
    { id: 1, barberId: 1, clientId: 1, serviceId: 2, startTime: '09:30', endTime: '10:00', date: today },
    { id: 2, barberId: 2, clientId: 2, serviceId: 3, startTime: '10:00', endTime: '10:50', date: today },
    { id: 3, barberId: 3, clientId: 3, serviceId: 1, startTime: '11:30', endTime: '11:50', date: today },
    { id: 4, barberId: 1, clientId: 4, serviceId: 5, startTime: '14:00', endTime: '15:00', date: today },
    { id: 5, barberId: 4, clientId: 5, serviceId: 6, startTime: '16:00', endTime: '16:15', date: today },
    { id: 6, barberId: 1, clientId: 2, serviceId: 2, startTime: '15:30', endTime: '16:00', date: today },
];

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
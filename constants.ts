import { Role, User, Client, Service, Barber, Appointment, Transaction, TransactionType } from './types';

export const USERS: User[] = [
  { id: 1, name: 'Natan Borges', email: 'admin@barberflow.com', avatarUrl: 'https://i.pravatar.cc/150?u=natan', role: Role.ADMIN, password: 'admin' },
  { id: 2, name: 'Barbeiro Dois', email: 'barber@barberflow.com', avatarUrl: 'https://i.pravatar.cc/150?u=barber2', role: Role.BARBER, password: 'barber' },
];

export const BARBERS: Barber[] = [
  { id: 1, name: 'Barbeiro 1', avatarUrl: 'https://i.pravatar.cc/150?u=barber1', email: 'b1@email.com' },
  { id: 2, name: 'Barbeiro 2', avatarUrl: 'https://i.pravatar.cc/150?u=barber2', email: 'b2@email.com' },
  { id: 3, name: 'Barbeiro 3', avatarUrl: 'https://i.pravatar.cc/150?u=barber3', email: 'b3@email.com' },
  { id: 4, name: 'Barbeiro 4', avatarUrl: 'https://i.pravatar.cc/150?u=barber4', email: 'b4@email.com' },
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
    { id: 1, barberId: 1, clientId: 1, serviceId: 2, startTime: '09:30', endTime: '10:00', date: '2025-10-01' },
    { id: 2, barberId: 2, clientId: 2, serviceId: 3, startTime: '10:00', endTime: '10:50', date: '2025-10-01' },
    { id: 3, barberId: 3, clientId: 3, serviceId: 1, startTime: '11:30', endTime: '11:50', date: '2025-10-01' },
    { id: 4, barberId: 1, clientId: 4, serviceId: 5, startTime: '14:00', endTime: '15:00', date: '2025-10-01' },
    { id: 5, barberId: 4, clientId: 5, serviceId: 6, startTime: '16:00', endTime: '16:15', date: '2025-10-01' },
    { id: 6, barberId: 1, clientId: 2, serviceId: 2, startTime: '15:30', endTime: '16:00', date: '2025-10-01' },
];

export const TRANSACTIONS: Transaction[] = [
    { id: '#ORD001', date: '07 Out 2025', name: 'Cliente 1', method: 'Cartão de Crédito', type: TransactionType.INCOME, value: 49.90 },
    { id: '#ORD002', date: '07 Out 2025', name: 'Cliente 2', method: 'Dinheiro', type: TransactionType.INCOME, value: 49.90 },
    { id: '#ORD003', date: '07 Out 2025', name: 'Natan Borges Ltda.', method: 'Retirada', type: TransactionType.EXPENSE, value: 250.00 },
    { id: '#ORD004', date: '07 Out 2025', name: 'Cliente 4', method: 'Cartão de Crédito', type: TransactionType.INCOME, value: 49.90 },
    { id: '#ORD005', date: '07 Out 2025', name: 'Cliente 5', method: 'Cartão de Débito', type: TransactionType.INCOME, value: 49.90 },
    { id: '#ORD006', date: '07 Out 2025', name: 'Cliente 6', method: 'Pix', type: TransactionType.INCOME, value: 49.90 },
    { id: '#ORD007', date: '07 Out 2025', name: 'Cliente 7', method: 'Dinheiro', type: TransactionType.INCOME, value: 49.90 },
    { id: '#ORD008', date: '08 Out 2025', name: 'Cliente 8', method: 'Pix', type: TransactionType.INCOME, value: 35.90 },
    { id: '#ORD009', date: '08 Out 2025', name: 'Cliente 9', method: 'Cartão de Crédito', type: TransactionType.INCOME, value: 99.80 },
];

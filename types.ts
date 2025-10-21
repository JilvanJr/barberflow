export enum Role {
  ADMIN = 'admin',
  BARBER = 'barber',
  CLIENT = 'client',
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role.ADMIN | Role.BARBER;
  password?: string;
}

export interface Client {
  id: number;
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  cpf: string;
  password?: string;
  role: Role.CLIENT;
}

export interface Service {
  id: number;
  name: string;
  price: number;
  duration: number; // in minutes
}

export interface Barber {
  id: number;
  name: string;
  avatarUrl: string;
  email?: string;
}

export interface Appointment {
  id: number;
  barberId: number;
  clientId: number;
  serviceId: number;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  date: string; // YYYY-MM-DD
}

export enum TransactionType {
    INCOME = 'Entrada',
    EXPENSE = 'Saída',
}

export interface Transaction {
    id: string;
    date: string;
    name: string;
    method: string;
    type: TransactionType;
    value: number;
}

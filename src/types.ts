export enum Role {
  ADMIN = 'admin',
  BARBER = 'barber',
  CLIENT = 'client',
}

export interface Permissions {
  // Agenda
  canViewAgenda: boolean;
  canCreateAppointment: boolean;
  canCancelAppointment: boolean;
  // Clientes
  canViewClients: boolean;
  canCreateClient: boolean;
  canEditClient: boolean;
  canDeleteClient: boolean;
  // Serviços
  canViewServices: boolean;
  canCreateService: boolean;
  canEditService: boolean;
  canDeleteService: boolean;
  // Equipe
  canViewTeam: boolean;
  canCreateTeamMember: boolean;
  canEditTeamMember: boolean;
  canDeleteTeamMember: boolean;
  // Fluxo de Caixa
  canViewCashFlow: boolean;
  canViewCashFlowDashboard: boolean;
  canConfirmPayment: boolean;
  canAddTransaction: boolean;
  canDeleteTransaction: boolean;
}


export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role.ADMIN | Role.BARBER;
  password?: string;
  permissions: Permissions;
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
  workStartTime?: string; // "HH:MM"
  workEndTime?: string; // "HH:MM"
  lunchStartTime?: string; // "HH:MM"
  lunchEndTime?: string; // "HH:MM"
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
    appointmentId?: number;
    paymentStatus: 'pending' | 'completed';
    completedBy?: string;
}

export interface DayHours {
  isOpen: boolean;
  openTime: string; // "HH:MM"
  closeTime: string; // "HH:MM"
}

export type OperatingHours = {
  [day in 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday']: DayHours;
};

export interface BarberLeave {
  barberId: number;
  date: string; // "YYYY-MM-DD"
}
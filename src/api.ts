/**
 * Mock API Layer
 * 
 * This file simulates a real backend API. It uses setTimeout to mimic network latency
 * and manipulates data in sessionStorage to simulate a persistent database.
 * This approach makes the mock API stateful across page reloads.
 */
import { USERS, CLIENTS, SERVICES, BARBERS, APPOINTMENTS, TRANSACTIONS, fullAdminPermissions, defaultBarberPermissions } from './constants';
import { User, Client, Service, Barber, Appointment, Transaction, TransactionType, Role, Permissions } from './types';

const NETWORK_DELAY = 300; // ms

// --- sessionStorage Abstraction ---
const storage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.error(`Error reading from sessionStorage key "${key}":`, error);
      return fallback;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error)      {
      console.error(`Error writing to sessionStorage key "${key}":`, error);
    }
  },
};

// --- Data Initialization ---
const initializeData = () => {
  // Use a flag to initialize only once per session
  if (!sessionStorage.getItem('api_initialized')) {
    storage.set('api_users', USERS);
    storage.set('api_clients', CLIENTS);
    storage.set('api_services', SERVICES);
    storage.set('api_barbers', BARBERS);
    storage.set('api_appointments', APPOINTMENTS);
    storage.set('api_transactions', TRANSACTIONS);
    sessionStorage.setItem('api_initialized', 'true');
  }
};
initializeData();

// Helper to simulate async operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to create a fake JWT-like token
const createFakeToken = (user: User | Client) => {
    const payload = { id: user.id, role: user.role, name: user.name };
    return `fake-token-for-${btoa(JSON.stringify(payload))}`;
};

// --- API Object ---
export const api = {
    // --- AUTH API ---
    async login(email: string, password?: string): Promise<{ user: User | Client; token: string }> {
        await delay(NETWORK_DELAY);
        const allUsers = [...storage.get<User[]>('api_users', []), ...storage.get<Client[]>('api_clients', [])];
        const foundUser = allUsers.find(u => u.email === email && u.password === password);

        if (foundUser) {
            const token = createFakeToken(foundUser);
            return { user: { ...foundUser }, token };
        }
        throw new Error("Invalid credentials");
    },
    
    async registerClient(clientData: Omit<Client, 'id'>): Promise<{ user: Client, token: string }> {
        await delay(NETWORK_DELAY);
        const clients = storage.get<Client[]>('api_clients', []);
        if (clients.some(c => c.email === clientData.email)) {
            throw new Error("Email already registered");
        }
        const newClient: Client = { ...clientData, id: Date.now() };
        storage.set('api_clients', [...clients, newClient]);
        const token = createFakeToken(newClient);
        return { user: newClient, token };
    },
    
    async validateToken(token: string): Promise<{ user: User | Client, users: User[] }> {
        await delay(NETWORK_DELAY / 2);
        if (!token.startsWith('fake-token-for-')) throw new Error("Invalid token");
        
        const payload = JSON.parse(atob(token.replace('fake-token-for-', '')));
        const allUsers = [...storage.get<User[]>('api_users', []), ...storage.get<Client[]>('api_clients', [])];
        const user = allUsers.find(u => u.id === payload.id);
        
        if (user) {
            return { user: { ...user }, users: storage.get<User[]>('api_users', []) };
        }
        throw new Error("User not found for token");
    },

    // --- CLIENTS API ---
    async getClients(): Promise<Client[]> {
        await delay(NETWORK_DELAY);
        return storage.get('api_clients', []);
    },
    async createClient(clientData: Partial<Client>): Promise<Client> {
        await delay(NETWORK_DELAY);
        const clients = storage.get<Client[]>('api_clients', []);
        const newClient: Client = {
            id: Date.now(),
            name: clientData.name || '', email: clientData.email || '', phone: clientData.phone || '',
            cpf: clientData.cpf || '', birthDate: clientData.birthDate || '', role: Role.CLIENT,
        };
        storage.set('api_clients', [...clients, newClient]);
        return newClient;
    },
    async updateClient(id: number, updatedData: Client): Promise<Client> {
        await delay(NETWORK_DELAY);
        const clients = storage.get<Client[]>('api_clients', []).map(c => (c.id === id ? updatedData : c));
        storage.set('api_clients', clients);
        return updatedData;
    },
    async deleteClient(id: number): Promise<void> {
        await delay(NETWORK_DELAY);
        const clients = storage.get<Client[]>('api_clients', []).filter(c => c.id !== id);
        storage.set('api_clients', clients);
    },

    // --- SERVICES API ---
    async getServices(): Promise<Service[]> {
        await delay(NETWORK_DELAY);
        return storage.get('api_services', []);
    },
    async createService(serviceData: Partial<Service>): Promise<Service> {
        await delay(NETWORK_DELAY);
        const services = storage.get<Service[]>('api_services', []);
        const newService: Service = {
            id: Date.now(), name: serviceData.name || '', price: serviceData.price || 0, duration: serviceData.duration || 0,
        };
        storage.set('api_services', [...services, newService]);
        return newService;
    },
    async updateService(id: number, updatedData: Service): Promise<Service> {
        await delay(NETWORK_DELAY);
        const services = storage.get<Service[]>('api_services', []).map(s => (s.id === id ? updatedData : s));
        storage.set('api_services', services);
        return updatedData;
    },
    async deleteService(id: number): Promise<void> {
        await delay(NETWORK_DELAY);
        const services = storage.get<Service[]>('api_services', []).filter(s => s.id !== id);
        storage.set('api_services', services);
    },
    
    // --- BARBERS / TEAM API ---
    async getBarbers(): Promise<Barber[]> {
        await delay(NETWORK_DELAY);
        return storage.get('api_barbers', []);
    },
    async createBarber(barberData: Partial<Barber>): Promise<Barber> {
        await delay(NETWORK_DELAY);
        const barbers = storage.get<Barber[]>('api_barbers', []);
        const newBarber: Barber = {
            id: Date.now(), name: barberData.name || '', email: barberData.email || '',
            avatarUrl: barberData.avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}`,
        };
        storage.set('api_barbers', [...barbers, newBarber]);
        return newBarber;
    },
    async updateBarber(id: number, updatedData: Barber): Promise<Barber> {
        await delay(NETWORK_DELAY);
        const barbers = storage.get<Barber[]>('api_barbers', []).map(b => (b.id === id ? updatedData : b));
        storage.set('api_barbers', barbers);
        return updatedData;
    },
    async deleteBarber(id: number): Promise<void> {
        await delay(NETWORK_DELAY);
        const barbers = storage.get<Barber[]>('api_barbers', []).filter(b => b.id !== id);
        storage.set('api_barbers', barbers);
    },

    // --- APPOINTMENTS API ---
    async getAppointments(): Promise<Appointment[]> {
        await delay(NETWORK_DELAY);
        return storage.get('api_appointments', []);
    },
    async getMyAppointments(clientId: number): Promise<Appointment[]> {
        await delay(NETWORK_DELAY);
        return storage.get<Appointment[]>('api_appointments', []).filter(a => a.clientId === clientId);
    },
    async createAppointment(appData: Omit<Appointment, 'id' | 'endTime'>): Promise<Appointment> {
        await delay(NETWORK_DELAY);
        const services = storage.get<Service[]>('api_services', []);
        const service = services.find(s => s.id === appData.serviceId);
        if (!service) throw new Error("Service not found");
        
        const startTime = new Date(`${appData.date}T${appData.startTime}`);
        const endTime = new Date(startTime.getTime() + service.duration * 60000);
        const endTimeString = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
        
        const newAppointment: Appointment = { ...appData, id: Date.now(), endTime: endTimeString };
        const appointments = storage.get<Appointment[]>('api_appointments', []);
        storage.set('api_appointments', [...appointments, newAppointment]);
        return newAppointment;
    },
    async deleteAppointment(id: number): Promise<void> {
        await delay(NETWORK_DELAY);
        const appointments = storage.get<Appointment[]>('api_appointments', []).filter(a => a.id !== id);
        storage.set('api_appointments', appointments);
    },

    // --- TRANSACTIONS / CASHFLOW API ---
    async getTransactions(): Promise<Transaction[]> {
        await delay(NETWORK_DELAY);
        let transactions = storage.get<Transaction[]>('api_transactions', []);
        const appointments = storage.get<Appointment[]>('api_appointments', []);
        const clients = storage.get<Client[]>('api_clients', []);
        const services = storage.get<Service[]>('api_services', []);
        
        const now = new Date('2025-10-02T00:00:00'); // Simulate current time
        const newTransactions: Transaction[] = [];

        appointments.forEach(app => {
            const appointmentDateTime = new Date(`${app.date}T${app.endTime}`);
            const alreadyExists = transactions.some(t => t.appointmentId === app.id);

            if (appointmentDateTime < now && !alreadyExists) {
                const client = clients.find(c => c.id === app.clientId);
                const service = services.find(s => s.id === app.serviceId);

                if (client && service) {
                    newTransactions.push({
                        id: `#APP${String(app.id).padStart(3, '0')}`, date: app.date, name: `${service.name} - ${client.name}`,
                        method: 'Aguardando', type: TransactionType.INCOME, value: service.price,
                        appointmentId: app.id, paymentStatus: 'pending',
                    });
                }
            }
        });
        
        if (newTransactions.length > 0) {
            const combined = [...newTransactions, ...transactions];
            transactions = Array.from(new Map(combined.map(item => [item.id, item])).values());
            storage.set('api_transactions', transactions);
        }
        return transactions;
    },
    async createTransaction(transData: Omit<Transaction, 'id'|'date'|'paymentStatus'>): Promise<Transaction> {
        await delay(NETWORK_DELAY);
        const transactions = storage.get<Transaction[]>('api_transactions', []);
         const newTransaction: Transaction = {
            ...transData,
            id: `#ORD${String(transactions.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            paymentStatus: 'completed'
        };
        storage.set('api_transactions', [newTransaction, ...transactions]);
        return newTransaction;
    },
    async confirmPayment(id: string, method: string): Promise<Transaction> {
        await delay(NETWORK_DELAY);
        let updatedTx: Transaction | undefined;
        const transactions = storage.get<Transaction[]>('api_transactions', []).map(t => {
            if (t.id === id) {
                updatedTx = { ...t, method: method, paymentStatus: 'completed' };
                return updatedTx;
            }
            return t;
        });
        if (!updatedTx) throw new Error("Transaction not found");
        storage.set('api_transactions', transactions);
        return updatedTx;
    },
    async deleteTransaction(id: string): Promise<void> {
        await delay(NETWORK_DELAY);
        const transactions = storage.get<Transaction[]>('api_transactions', []).filter(t => t.id !== id);
        storage.set('api_transactions', transactions);
    },
    
    // --- PERMISSIONS API ---
    async updateUserPermissions(userId: number, permissions: Permissions): Promise<User> {
        await delay(NETWORK_DELAY);
        let updatedUser: User | undefined;
        const users = storage.get<User[]>('api_users', []).map(u => {
            if (u.id === userId) {
                updatedUser = { ...u, permissions };
                return updatedUser;
            }
            return u;
        });
        if (!updatedUser) throw new Error("User not found");
        storage.set('api_users', users);
        return updatedUser;
    }
};
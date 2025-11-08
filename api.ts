/**
 * Mock API Layer
 * 
 * This file simulates a real backend API. It uses setTimeout to mimic network latency
 * and manipulates data in sessionStorage to simulate a persistent database.
 * This approach makes the mock API stateful across page reloads.
 */
import { USERS, CLIENTS, SERVICES, APPOINTMENTS, TRANSACTIONS, DEFAULT_OPERATING_HOURS, fullAdminPermissions, defaultBarberPermissions, receptionistPermissions } from './constants';
import { User, Client, Service, Appointment, Transaction, TransactionType, Role, Permissions, OperatingHours, BarberLeave } from './types';

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
    storage.set('api_appointments', APPOINTMENTS);
    storage.set('api_transactions', TRANSACTIONS);
    storage.set('api_operating_hours', DEFAULT_OPERATING_HOURS);
    storage.set('api_barber_leaves', []);
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

// Helper to convert "HH:MM" to minutes from midnight
const timeToMinutes = (time: string): number => {
    if (!time || typeof time !== 'string' || !time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return isNaN(hours) || isNaN(minutes) ? 0 : hours * 60 + minutes;
};

// Helper to convert minutes from midnight to "HH:MM"
const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// --- API Object ---
export const api = {
    // --- AUTH API ---
    async login(email: string, password?: string): Promise<{ user: User | Client; token: string }> {
        await delay(NETWORK_DELAY);
        const allUsers = [...storage.get<User[]>('api_users', []), ...storage.get<Client[]>('api_clients', [])];
        const foundUser = allUsers.find(u => u.email === email && u.password === password);

        if (foundUser) {
            if (foundUser.role === Role.CLIENT && (foundUser as Client).status === 'inactive') {
                throw new Error("Your account is inactive. Please contact the barbershop.");
            }
            if ((foundUser.role === Role.BARBER || foundUser.role === Role.ADMIN) && (foundUser as User).status === 'inactive') {
                 throw new Error("Your account is inactive. Please contact the barbershop.");
            }
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

    async checkUserExists(email: string): Promise<boolean> {
        await delay(NETWORK_DELAY);
        const users = storage.get<User[]>('api_users', []);
        return users.some(u => u.email === email);
    },
    
    async setUserPassword(email: string, password: string): Promise<User> {
        await delay(NETWORK_DELAY);
        let updatedUser: User | undefined;
        const users = storage.get<User[]>('api_users', []).map(u => {
            if (u.email === email) {
                updatedUser = { ...u, password };
                return updatedUser;
            }
            return u;
        });

        if (!updatedUser) {
            throw new Error("User not found during password update");
        }
        
        storage.set('api_users', users);
        return updatedUser;
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
            cpf: clientData.cpf || '', birthDate: clientData.birthDate || '', role: Role.CLIENT, status: 'active',
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
    async toggleClientStatus(id: number, status: 'active' | 'inactive'): Promise<Client> {
        await delay(NETWORK_DELAY);
        let updatedClient: Client | undefined;
        const clients = storage.get<Client[]>('api_clients', []).map(c => {
            if (c.id === id) {
                updatedClient = { ...c, status };
                return updatedClient;
            }
            return c;
        });
        if (!updatedClient) {
            throw new Error("Client not found to toggle status");
        }
        storage.set('api_clients', clients);
        return updatedClient;
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
            id: Date.now(), name: serviceData.name || '', price: serviceData.price || 0, duration: serviceData.duration || 0, status: 'active',
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
    async toggleServiceStatus(id: number, status: 'active' | 'inactive'): Promise<Service> {
        await delay(NETWORK_DELAY);
        let updatedService: Service | undefined;
        const services = storage.get<Service[]>('api_services', []).map(s => {
            if (s.id === id) {
                updatedService = { ...s, status };
                return updatedService;
            }
            return s;
        });
        if (!updatedService) {
            throw new Error("Service not found to toggle status");
        }
        storage.set('api_services', services);
        return updatedService;
    },
    
    // --- USERS / TEAM API ---
    async getBarbers(): Promise<User[]> {
        await delay(NETWORK_DELAY);
        const users = storage.get<User[]>('api_users', []);
        return users.filter(u => u.jobTitle === 'Barbeiro');
    },
    async getUsers(): Promise<User[]> {
        await delay(NETWORK_DELAY);
        return storage.get('api_users', []);
    },
    async createUser(userData: Partial<User>): Promise<User> {
        await delay(NETWORK_DELAY);
        const users = storage.get<User[]>('api_users', []);

        let permissions: Permissions;
        switch (userData.accessProfile) {
            case 'Admin': permissions = fullAdminPermissions; break;
            case 'Barbeiro': permissions = defaultBarberPermissions; break;
            case 'Recepcionista': permissions = receptionistPermissions; break;
            default: permissions = defaultBarberPermissions;
        }

        const newUser: User = {
            id: Date.now(),
            name: userData.name || '',
            email: userData.email || '',
            avatarUrl: userData.avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}`,
            role: userData.accessProfile === 'Admin' ? Role.ADMIN : Role.BARBER,
            password: 'password', // Default password for first access flow
            status: 'active',
            jobTitle: userData.jobTitle || 'Barbeiro',
            accessProfile: userData.accessProfile || 'Barbeiro',
            permissions: permissions,
            workStartTime: userData.workStartTime || '09:00',
            workEndTime: userData.workEndTime || '18:00',
            lunchStartTime: userData.lunchStartTime || '12:00',
            lunchEndTime: userData.lunchEndTime || '13:00',
        };

        storage.set('api_users', [...users, newUser]);
        return newUser;
    },
    async updateUser(id: number, updatedData: Partial<User>): Promise<User> {
        await delay(NETWORK_DELAY);
        let finalUpdatedUser: User | undefined;
        const users = storage.get<User[]>('api_users', []).map(u => {
            if (u.id === id) {
                finalUpdatedUser = { ...u, ...updatedData } as User;
                return finalUpdatedUser;
            }
            return u;
        });
        
        if (!finalUpdatedUser) throw new Error("User not found");

        storage.set('api_users', users);
        return finalUpdatedUser;
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
    async updateAppointment(id: number, updatedData: Partial<Appointment>): Promise<Appointment> {
        await delay(NETWORK_DELAY);
        const appointments = storage.get<Appointment[]>('api_appointments', []);
        const services = storage.get<Service[]>('api_services', []);
        let finalUpdatedAppointment: Appointment | undefined;

        const newAppointments = appointments.map(app => {
            if (app.id === id) {
                const mergedData = { ...app, ...updatedData };

                const service = services.find(s => s.id === mergedData.serviceId);
                if (!service) throw new Error("Service not found for update");
                
                const startTime = new Date(`${mergedData.date}T${mergedData.startTime}`);
                const endTime = new Date(startTime.getTime() + service.duration * 60000);
                const endTimeString = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;

                finalUpdatedAppointment = {
                    ...mergedData,
                    endTime: endTimeString,
                    clientId: Number(mergedData.clientId),
                    serviceId: Number(mergedData.serviceId),
                    barberId: Number(mergedData.barberId),
                } as Appointment;
                return finalUpdatedAppointment;
            }
            return app;
        });

        if (!finalUpdatedAppointment) {
            throw new Error("Appointment to update not found");
        }

        storage.set('api_appointments', newAppointments);
        return finalUpdatedAppointment;
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
    async createTransaction(transData: Omit<Transaction, 'id'|'date'|'paymentStatus'|'completedBy'>, createdBy: string): Promise<Transaction> {
        await delay(NETWORK_DELAY);
        const transactions = storage.get<Transaction[]>('api_transactions', []);
         const newTransaction: Transaction = {
            ...transData,
            id: `#ORD${String(transactions.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            paymentStatus: 'completed',
            completedBy: createdBy
        };
        storage.set('api_transactions', [newTransaction, ...transactions]);
        return newTransaction;
    },
    async confirmPayment(id: string, method: string, completedBy: string): Promise<Transaction> {
        await delay(NETWORK_DELAY);
        let updatedTx: Transaction | undefined;
        const transactions = storage.get<Transaction[]>('api_transactions', []).map(t => {
            if (t.id === id) {
                updatedTx = { ...t, method: method, paymentStatus: 'completed', completedBy: completedBy };
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
    
    // --- SETTINGS & PERMISSIONS API ---
    async getOperatingHours(): Promise<OperatingHours> {
        await delay(NETWORK_DELAY);
        return storage.get('api_operating_hours', DEFAULT_OPERATING_HOURS);
    },
    async updateOperatingHours(hours: OperatingHours): Promise<OperatingHours> {
        await delay(NETWORK_DELAY);
        storage.set('api_operating_hours', hours);
        return hours;
    },

    async getBarberLeaves(): Promise<BarberLeave[]> {
        await delay(NETWORK_DELAY);
        return storage.get('api_barber_leaves', []);
    },
    async addBarberLeave(leave: BarberLeave): Promise<BarberLeave> {
        await delay(NETWORK_DELAY);
        const leaves = storage.get<BarberLeave[]>('api_barber_leaves', []);
        storage.set('api_barber_leaves', [...leaves, leave]);
        return leave;
    },
    async removeBarberLeave(barberId: number, date: string): Promise<void> {
        await delay(NETWORK_DELAY);
        const leaves = storage.get<BarberLeave[]>('api_barber_leaves', [])
            .filter(l => !(l.barberId === barberId && l.date === date));
        storage.set('api_barber_leaves', leaves);
    },

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
    },
    
    // --- DEV/TESTING API ---
    async generateInitialMockData(): Promise<{ targetDate: string, appointments: Appointment[] }> {
        await delay(NETWORK_DELAY);
        
        const operatingHours = storage.get('api_operating_hours', DEFAULT_OPERATING_HOURS);
        const allUsers = storage.get<User[]>('api_users', []);
        const allServices = storage.get<Service[]>('api_services', []);
        const allClients = storage.get<Client[]>('api_clients', []);
        
        const activeBarbers = allUsers.filter(u => u.status === 'active' && u.jobTitle === 'Barbeiro');
        const activeServices = allServices.filter(s => s.status === 'active');
        const activeClients = allClients.filter(c => c.status === 'active');

        if (activeBarbers.length === 0 || activeServices.length === 0 || activeClients.length === 0) {
            return { targetDate: new Date().toISOString().split('T')[0], appointments: [] };
        }
        
        const _generateAppointmentsForDate = (dateToGenerate: string, isBusyDay: boolean): Appointment[] => {
            const generatedAppointments: Appointment[] = [];
            const dayOfWeek = new Date(dateToGenerate + 'T00:00:00').toLocaleString('en-US', { weekday: 'long' }).toLowerCase() as keyof OperatingHours;
            const shopDayConfig = operatingHours[dayOfWeek];

            if (!shopDayConfig.isOpen) return [];

            for (const barber of activeBarbers) {
                const dayStart = Math.max(timeToMinutes(shopDayConfig.openTime), timeToMinutes(barber.workStartTime));
                const dayEnd = Math.min(timeToMinutes(shopDayConfig.closeTime), timeToMinutes(barber.workEndTime));
                const lunchStart = timeToMinutes(barber.lunchStartTime);
                const lunchEnd = timeToMinutes(barber.lunchEndTime);

                let currentTime = dayStart;

                while (currentTime < dayEnd) {
                    const gapChance = isBusyDay ? 0.1 : 0.4;
                    if (Math.random() < gapChance) {
                        currentTime += 30;
                        continue;
                    }
                    
                    const service = activeServices[Math.floor(Math.random() * activeServices.length)];
                    const client = activeClients[Math.floor(Math.random() * activeClients.length)];
                    const slotStart = currentTime;
                    const slotEnd = currentTime + service.duration;

                    if (slotEnd > dayEnd || (slotStart < lunchEnd && slotEnd > lunchStart)) {
                        currentTime += 15;
                        continue;
                    }
                    
                    generatedAppointments.push({
                        id: Date.now() + generatedAppointments.length + Math.random(),
                        barberId: barber.id,
                        clientId: client.id,
                        serviceId: service.id,
                        date: dateToGenerate,
                        startTime: minutesToTime(slotStart),
                        endTime: minutesToTime(slotEnd)
                    });
                    currentTime = slotEnd;
                }
            }
            return generatedAppointments;
        };

        // --- Date Calculation ---
        let d0TargetDate = new Date();
        let d0TargetDateStr = '';
        for (let i = 0; i < 7; i++) {
            const dayOfWeek = d0TargetDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase() as keyof OperatingHours;
            if (operatingHours[dayOfWeek].isOpen) {
                d0TargetDateStr = d0TargetDate.toISOString().split('T')[0];
                break;
            }
            d0TargetDate.setDate(d0TargetDate.getDate() + 1);
        }
        if (!d0TargetDateStr) { d0TargetDateStr = new Date().toISOString().split('T')[0]; }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dMinus1DateStr = yesterday.toISOString().split('T')[0];

        const dPlus1TargetDate = new Date(d0TargetDate);
        dPlus1TargetDate.setDate(dPlus1TargetDate.getDate() + 1);
        const dPlus1TargetDateStr = dPlus1TargetDate.toISOString().split('T')[0];
        
        // --- Generate and Store ---
        const dMinus1Appointments = _generateAppointmentsForDate(dMinus1DateStr, true);
        const d0Appointments = _generateAppointmentsForDate(d0TargetDateStr, false);
        const dPlus1Appointments = _generateAppointmentsForDate(dPlus1TargetDateStr, false);
        
        const allAppointments = storage.get<Appointment[]>('api_appointments', []);
        const datesToClear = [dMinus1DateStr, d0TargetDateStr, dPlus1TargetDateStr];
        const otherDayAppointments = allAppointments.filter(app => !datesToClear.includes(app.date));
        
        storage.set('api_appointments', [
            ...otherDayAppointments, 
            ...dMinus1Appointments,
            ...d0Appointments,
            ...dPlus1Appointments
        ]);

        return { targetDate: d0TargetDateStr, appointments: d0Appointments };
    }
};
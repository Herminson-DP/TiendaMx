// data/users.js - Initial Seed Users & Accounts Database for AutoHub Colombia
export const INITIAL_USERS = [
  {
    id: 'usr_carlos_01',
    name: 'Carlos Gómez',
    email: 'carlos@autohub.co',
    password: 'password123',
    phone: '+57 310 987 6543',
    city: 'Bogotá D.C.',
    department: 'Cundinamarca',
    address: 'Calle 93B # 13-45 Apto 402',
    role: 'Cliente Verificado',
    avatar: '👨‍💼',
    createdAt: '2025-11-10',
    garageVehicle: {
      make: 'Toyota',
      model: 'RAV4',
      year: 2021,
      engine: '2.5L Híbrido',
      plate: 'KLU-842'
    }
  },
  {
    id: 'usr_herminson_02',
    name: 'Herminson Delgado',
    email: 'herminson@autohub.co',
    password: 'password123',
    phone: '+57 315 889 0123',
    city: 'Medellín',
    department: 'Antioquia',
    address: 'Carrera 43A # 1-50 El Poblado',
    role: 'Cliente VIP Pro',
    avatar: '🏎️',
    createdAt: '2026-01-15',
    garageVehicle: {
      make: 'Mazda',
      model: 'CX-30',
      year: 2023,
      engine: '2.0L SkyActiv-G',
      plate: 'JNY-912'
    }
  },
  {
    id: 'usr_herminson_gmail',
    name: 'Herminson Delgado',
    email: 'herminsondelgado6@gmail.com',
    password: 'password123',
    phone: '+57 315 889 0123',
    city: 'Medellín',
    department: 'Antioquia',
    address: 'Carrera 43A # 1-50 El Poblado',
    role: 'Cliente VIP Pro',
    avatar: '🏎️',
    createdAt: '2026-01-15',
    garageVehicle: {
      make: 'Mazda',
      model: 'CX-30',
      year: 2023,
      engine: '2.0L SkyActiv-G',
      plate: 'JNY-912'
    }
  },
  {
    id: 'usr_demo_03',
    name: 'Carolina Restrepo',
    email: 'demo@autohub.co',
    password: 'password123',
    phone: '+57 300 123 4567',
    city: 'Cali',
    department: 'Valle del Cauca',
    address: 'Avenida 6N # 28N-34',
    role: 'Comprador Activo',
    avatar: '👩‍💻',
    createdAt: '2026-02-01',
    garageVehicle: {
      make: 'BMW',
      model: 'Serie 3 330i',
      year: 2022,
      engine: '2.0L TwinPower Turbo',
      plate: 'LMN-456'
    }
  },
  {
    id: 'usr_admin_04',
    name: 'Administrador AutoHub',
    email: 'admin@autohub.co',
    password: 'password123',
    phone: '+57 301 555 9999',
    city: 'Bogotá D.C.',
    department: 'Cundinamarca',
    address: 'Sede Principal Calle 127 # 19-30',
    role: 'Super Administrador',
    avatar: '🛡️',
    createdAt: '2025-01-01',
    garageVehicle: {
      make: 'Porsche',
      model: 'Macan GTS',
      year: 2023,
      engine: '2.9L V6 Biturbo',
      plate: 'PRX-911'
    }
  }
];

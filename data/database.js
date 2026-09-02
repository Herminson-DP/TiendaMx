// data/database.js - Persistent Multi-Collection Database Engine for AutoHub
import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { INITIAL_VEHICLES } from './vehicles.js';
import { INITIAL_PARTS } from './parts.js';
import { INITIAL_USERS } from './users.js';

export { INITIAL_VEHICLES, INITIAL_PARTS, INITIAL_USERS };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, 'autohub_db.json');

// Default initial database schema
const defaultData = {
  users: INITIAL_USERS,
  vehicles: INITIAL_VEHICLES,
  parts: INITIAL_PARTS,
  orders: [
    {
      id: 'ORD-DEMO-901',
      userId: 'usr_carlos_01',
      trackingNumber: 'AUTOHUB-COL-88291029',
      items: [
        {
          part: INITIAL_PARTS[0],
          quantity: 2,
          totalCOP: INITIAL_PARTS[0].price_cop * 2,
          totalUSD: INITIAL_PARTS[0].price_usd * 2
        }
      ],
      subtotal: INITIAL_PARTS[0].price_cop * 2,
      shipping: 0,
      total: INITIAL_PARTS[0].price_cop * 2,
      customer: {
        name: 'Carlos Gómez',
        email: 'carlos@autohub.co',
        phone: '+57 310 987 6543',
        address: 'Calle 93B # 13-45 Apto 402, Bogotá D.C. - Cundinamarca',
        partnerShopInstall: true
      },
      paymentMethod: 'PSE - Pagos Seguros en Línea',
      payment_details: {
        type: 'PSE - Pagos Seguros en Línea',
        bankName: 'Bancolombia',
        transactionRef: 'ACH-782910391',
        status: 'Aprobada'
      },
      date: '2026-02-18 14:30:00',
      status: 'En Camino a Domicilio'
    }
  ],
  reservations: [
    {
      id: 'RES-DEMO-101',
      userId: 'usr_carlos_01',
      vehicle: INITIAL_VEHICLES[0],
      customer: {
        name: 'Carlos Gómez',
        email: 'carlos@autohub.co',
        phone: '+57 310 987 6543',
        city: 'Bogotá D.C.',
        notes: 'Deseo revisión peritaje presencial el sábado en Sede Calle 127.'
      },
      deposit_amount_usd: 500,
      deposit_amount_cop: 2000000,
      payment_method: 'PSE - Pagos Seguros en Línea',
      payment_details: {
        type: 'PSE - Pagos Seguros en Línea',
        bankName: 'Bancolombia'
      },
      date: '2026-02-25 10:15:00',
      status: 'Apartado Confirmado (Peritaje 150 Puntos)'
    }
  ],
  appraisals: [
    {
      id: 'VAL-DEMO-301',
      userId: 'usr_carlos_01',
      make: 'Toyota',
      model: 'Corolla Cross',
      year: 2022,
      mileage: 32000,
      condition: 'excelente',
      plate: 'KLU-842',
      vin: '93Y78291048291',
      lowCOP: 94000000,
      highCOP: 104000000,
      instantOfferCOP: 91000000,
      lowUSD: 23800,
      highUSD: 26300,
      instantOfferUSD: 23000,
      date: '2026-02-20 09:00:00'
    }
  ],
  wishlist: [],
  reviews: []
};

// Initialize lowdb database
export const db = await JSONFilePreset(DB_FILE_PATH, defaultData);

// Ensure all initial demo users exist in the database
if (!db.data.users || db.data.users.length === 0) {
  db.data.users = [...INITIAL_USERS];
  await db.write();
} else {
  // Sync any missing demo users
  let hasNew = false;
  for (const initUser of INITIAL_USERS) {
    if (!db.data.users.some(u => u.email.toLowerCase() === initUser.email.toLowerCase())) {
      db.data.users.push(initUser);
      hasNew = true;
    }
  }
  if (hasNew) {
    await db.write();
  }
}

// Helper to persist database writes safely
async function saveDB() {
  await db.write();
}

// -------------------------------------------------------------
// USER DATA ACCESS METHODS (CRUD)
// -------------------------------------------------------------
export const UserDB = {
  getAll: () => db.data.users || INITIAL_USERS,
  
  getById: (id) => {
    if (!id) return null;
    const users = db.data.users && db.data.users.length > 0 ? db.data.users : INITIAL_USERS;
    return users.find(u => u.id === id) || null;
  },

  getByEmail: (email) => {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    const users = db.data.users && db.data.users.length > 0 ? db.data.users : INITIAL_USERS;
    return users.find(u => u.email && u.email.toLowerCase() === clean) || null;
  },

  create: async (userData) => {
    const newUser = {
      id: userData.id || ('usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      phone: userData.phone || '+57 300 000 0000',
      city: userData.city || 'Bogotá D.C.',
      department: userData.department || 'Cundinamarca',
      address: userData.address || '',
      role: userData.role || 'Cliente Verificado',
      avatar: userData.avatar || '🚗',
      createdAt: userData.createdAt || new Date().toISOString().substring(0, 10),
      garageVehicle: userData.garageVehicle || {
        make: 'Toyota',
        model: 'Corolla',
        year: 2022,
        engine: '2.0L Gasolina',
        plate: 'ABC-123'
      },
      garageList: userData.garageList || [
        userData.garageVehicle || {
          make: 'Toyota',
          model: 'Corolla',
          year: 2022,
          engine: '2.0L Gasolina',
          plate: 'ABC-123'
        }
      ]
    };

    if (!db.data.users) db.data.users = [];
    db.data.users.push(newUser);
    await saveDB();
    return newUser;
  },

  update: async (id, updates) => {
    const userIndex = (db.data.users || []).findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    db.data.users[userIndex] = {
      ...db.data.users[userIndex],
      ...updates
    };
    await saveDB();
    return db.data.users[userIndex];
  },

  updatePassword: async (id, newPassword) => {
    const user = (db.data.users || []).find(u => u.id === id);
    if (!user) return false;
    user.password = newPassword;
    await saveDB();
    return true;
  }
};

// -------------------------------------------------------------
// VEHICLES DATA ACCESS METHODS (CRUD)
// -------------------------------------------------------------
export const VehicleDB = {
  getAll: () => db.data.vehicles || [],

  getByIdOrSlug: (idOrSlug) => {
    if (!idOrSlug) return null;
    return (db.data.vehicles || []).find(v => v.id === idOrSlug || v.slug === idOrSlug) || null;
  },

  create: async (vehicleData) => {
    const newVehicle = {
      id: vehicleData.id || ('veh_' + Date.now()),
      slug: vehicleData.slug || (vehicleData.title || 'vehiculo').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ...vehicleData
    };
    if (!db.data.vehicles) db.data.vehicles = [];
    db.data.vehicles.push(newVehicle);
    await saveDB();
    return newVehicle;
  },

  update: async (id, updates) => {
    const index = (db.data.vehicles || []).findIndex(v => v.id === id);
    if (index === -1) return null;
    db.data.vehicles[index] = { ...db.data.vehicles[index], ...updates };
    await saveDB();
    return db.data.vehicles[index];
  },

  delete: async (id) => {
    const prevLen = (db.data.vehicles || []).length;
    db.data.vehicles = (db.data.vehicles || []).filter(v => v.id !== id);
    await saveDB();
    return db.data.vehicles.length < prevLen;
  }
};

// -------------------------------------------------------------
// AUTOPARTS DATA ACCESS METHODS (CRUD)
// -------------------------------------------------------------
export const PartDB = {
  getAll: () => db.data.parts || [],

  getByIdOrSku: (idOrSku) => {
    if (!idOrSku) return null;
    return (db.data.parts || []).find(p => p.id === idOrSku || p.sku === idOrSku) || null;
  },

  create: async (partData) => {
    const newPart = {
      id: partData.id || ('part_' + Date.now()),
      ...partData
    };
    if (!db.data.parts) db.data.parts = [];
    db.data.parts.push(newPart);
    await saveDB();
    return newPart;
  },

  update: async (id, updates) => {
    const index = (db.data.parts || []).findIndex(p => p.id === id);
    if (index === -1) return null;
    db.data.parts[index] = { ...db.data.parts[index], ...updates };
    await saveDB();
    return db.data.parts[index];
  },

  delete: async (id) => {
    const prevLen = (db.data.parts || []).length;
    db.data.parts = (db.data.parts || []).filter(p => p.id !== id);
    await saveDB();
    return db.data.parts.length < prevLen;
  }
};

// -------------------------------------------------------------
// ORDERS DATA ACCESS METHODS
// -------------------------------------------------------------
export const OrderDB = {
  getAll: () => db.data.orders || [],

  getByUserId: (userId) => {
    if (!userId) return [];
    return (db.data.orders || []).filter(o => o.userId === userId);
  },

  getById: (id) => {
    return (db.data.orders || []).find(o => o.id === id) || null;
  },

  create: async (orderData) => {
    if (!db.data.orders) db.data.orders = [];
    db.data.orders.unshift(orderData);
    await saveDB();
    return orderData;
  }
};

// -------------------------------------------------------------
// RESERVATIONS DATA ACCESS METHODS
// -------------------------------------------------------------
export const ReservationDB = {
  getAll: () => db.data.reservations || [],

  getByUserId: (userId) => {
    if (!userId) return [];
    return (db.data.reservations || []).filter(r => r.userId === userId);
  },

  getById: (id) => {
    return (db.data.reservations || []).find(r => r.id === id) || null;
  },

  create: async (reservationData) => {
    if (!db.data.reservations) db.data.reservations = [];
    db.data.reservations.unshift(reservationData);
    await saveDB();
    return reservationData;
  }
};

// -------------------------------------------------------------
// APPRAISALS / TASACIONES DATA ACCESS METHODS
// -------------------------------------------------------------
export const AppraisalDB = {
  getAll: () => db.data.appraisals || [],

  getByUserId: (userId) => {
    if (!userId) return [];
    return (db.data.appraisals || []).filter(a => a.userId === userId);
  },

  create: async (appraisalData) => {
    if (!db.data.appraisals) db.data.appraisals = [];
    db.data.appraisals.unshift(appraisalData);
    await saveDB();
    return appraisalData;
  }
};

// Export database reference
export default db;

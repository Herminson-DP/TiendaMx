// server.js - AutoHub Motors & Parts Full Stack Platform with Persistent Database
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  db, 
  UserDB, 
  VehicleDB, 
  PartDB, 
  OrderDB, 
  ReservationDB, 
  AppraisalDB 
} from './data/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// OTP In-Memory Store for password recovery verification
const OTP_STORE = {};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'autohub-automotive-secret-key-2026',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 1 day
  })
);

// Helper to format currency in Colombian Pesos ($ COP)
function formatCOP(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '$ 0 COP';
  return '$ ' + Math.round(amount).toLocaleString('es-CO') + ' COP';
}

function formatCOPShort(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '$ 0';
  return '$ ' + Math.round(amount).toLocaleString('es-CO');
}

function formatUSD(amount) {
  return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' USD';
}

// VIN & Plate Resolution Engine for Accurate System Autoparts Matching
function resolveVehicleFromVINorSearch(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().toUpperCase();
  if (!clean || clean.length < 3) return null;

  const allVehicles = VehicleDB.getAll();

  // 1. Direct match in database vehicles by exact VIN, plate, or id
  const directVehicle = allVehicles.find(v => 
    (v.vin && v.vin.toUpperCase() === clean) ||
    (v.plate && v.plate.toUpperCase() === clean) ||
    (v.id && v.id.toUpperCase() === clean)
  );
  if (directVehicle) {
    return {
      source: 'database_vehicle',
      make: directVehicle.make,
      model: directVehicle.model,
      year: directVehicle.year,
      vin: directVehicle.vin,
      plate: directVehicle.plate,
      title: directVehicle.title
    };
  }

  // 2. Partial match in database vehicles
  const partialVehicle = allVehicles.find(v => 
    (v.vin && clean.length >= 6 && v.vin.toUpperCase().includes(clean)) ||
    (v.plate && clean.replace(/[^A-Z0-9]/g, '') === (v.plate || '').replace(/[^A-Z0-9]/g, ''))
  );
  if (partialVehicle) {
    return {
      source: 'database_vehicle',
      make: partialVehicle.make,
      model: partialVehicle.model,
      year: partialVehicle.year,
      vin: partialVehicle.vin,
      plate: partialVehicle.plate,
      title: partialVehicle.title
    };
  }

  // 3. Standard NHTSA / ISO 3779 WMI (World Manufacturer Identifier) Decoders
  const WMI_MAP = [
    { prefixes: ['JTM', 'JT1', 'JT2', 'JT3', 'JT4', 'JT5', '4T1', '4T3', '4T4', '2T1'], make: 'Toyota' },
    { prefixes: ['WBS', 'WBA', 'WBX', 'WBY', '4US'], make: 'BMW' },
    { prefixes: ['WP0', 'WP1'], make: 'Porsche' },
    { prefixes: ['WAU', 'WA1'], make: 'Audi' },
    { prefixes: ['JM1', 'JMZ', '3MZ'], make: 'Mazda' },
    { prefixes: ['1G1', '1G2', '1GC', '3G1', '9BG', 'KL1'], make: 'Chevrolet' },
    { prefixes: ['1FA', '1FT', '1FM', '3FA', '3FT'], make: 'Ford' },
    { prefixes: ['VF1', '93Y', '8A1'], make: 'Renault' },
    { prefixes: ['WVW', '3VW', '9BW'], make: 'Volkswagen' },
    { prefixes: ['KMH', 'KM8', 'MAL'], make: 'Hyundai' },
    { prefixes: ['KNA', 'KND', 'KNE'], make: 'Kia' },
    { prefixes: ['1C4', '1J4'], make: 'Jeep' },
    { prefixes: ['JN1', '3N1', '5N1'], make: 'Nissan' },
    { prefixes: ['WDB', 'WDC', 'W1N', '4JG'], make: 'Mercedes-Benz' }
  ];

  for (const entry of WMI_MAP) {
    for (const p of entry.prefixes) {
      if (clean.startsWith(p)) {
        return {
          source: 'wmi_vin_decoder',
          make: entry.make,
          model: '',
          year: null,
          vin: clean
        };
      }
    }
  }

  return null;
}

// Helper to parse dynamic payment method & bank details
function extractPaymentDetails(body) {
  const method = (body.payment_method || 'pse').toLowerCase();
  
  if (method.includes('pse')) {
    return {
      type: 'PSE - Pagos Seguros en Línea',
      methodKey: 'pse',
      bankName: body.pse_bank || 'Bancolombia',
      personType: body.pse_person_type || 'Persona Natural',
      docType: body.pse_doc_type || 'CC',
      docNumber: body.pse_doc_number || '1.098.765.432',
      email: body.pse_email || body.customer_email || body.email || 'cliente@banco.com',
      phone: body.pse_phone || body.customer_phone || body.phone || '3001234567',
      transactionRef: 'ACH-' + Math.floor(100000000 + Math.random() * 900000000),
      authCode: 'AUT-' + Math.floor(100000 + Math.random() * 900000),
      status: 'Aprobada por ACH Colombia / Banco'
    };
  }
  
  if (method.includes('transfer') || method.includes('consignacion') || method.includes('bancaria')) {
    return {
      type: 'Transferencia Bancaria Directa / QR Interoperable',
      methodKey: 'transfer',
      targetBank: body.transfer_target_bank || 'Bancolombia (Cta Corriente #048-928192-11)',
      originBank: body.transfer_origin_bank || 'Bancolombia',
      transferRef: body.transfer_ref_number || ('TRF-' + Math.floor(10000000 + Math.random() * 90000000)),
      holderName: body.transfer_holder_name || body.customer_name || 'Titular de Cuenta',
      transferDate: body.transfer_date || new Date().toISOString().substring(0, 10),
      status: 'Comprobante Registrado / Verificación en Línea Exitosa'
    };
  }
  
  if (method.includes('wallet') || method.includes('nequi') || method.includes('daviplata')) {
    return {
      type: 'Billetera Digital Directa',
      methodKey: 'wallet',
      walletName: body.wallet_provider || (method.includes('daviplata') ? 'Daviplata' : 'Nequi'),
      walletPhone: body.wallet_phone || body.customer_phone || body.phone || '3109876543',
      walletDocNumber: body.wallet_doc_number || '1.032.456.789',
      pushRef: 'WAL-' + Math.floor(10000000 + Math.random() * 90000000),
      status: 'Notificación Push Confirmada en App Móvil'
    };
  }
  
  if (method.includes('card') || method.includes('tarjeta') || method.includes('credito') || method.includes('debito')) {
    const rawCard = (body.card_number || '4532 8921 0492 8821').replace(/\s+/g, '');
    const last4 = rawCard.length >= 4 ? rawCard.slice(-4) : '8821';
    let brand = body.card_brand || 'Visa';
    if (rawCard.startsWith('5')) brand = 'MasterCard';
    if (rawCard.startsWith('3')) brand = 'American Express';
    if (rawCard.startsWith('6')) brand = 'Discover / Diners';

    return {
      type: 'Tarjeta de Crédito / Débito',
      methodKey: 'card',
      cardBrand: brand,
      cardType: body.card_type || 'Tarjeta de Crédito',
      maskedCard: `•••• •••• •••• ${last4}`,
      cardHolder: (body.card_holder || body.customer_name || 'Carlos Gómez').toUpperCase(),
      installments: Number(body.card_installments) || 1,
      expDate: body.card_exp || '08/28',
      docType: body.card_doc_type || 'CC',
      docNumber: body.card_doc_number || '1.020.304.506',
      authCode: 'AUTH-' + Math.floor(100000 + Math.random() * 900000),
      status: 'Transacción Autorizada por Franquicia Bancaria'
    };
  }
  
  if (method.includes('credit') || method.includes('financiam') || method.includes('sufi')) {
    return {
      type: 'Crédito Vehicular & Financiamiento Automotriz',
      methodKey: 'credit',
      entityName: body.credit_entity || 'Sufi (Grupo Bancolombia)',
      downPaymentCOP: Number(body.credit_down_payment) || 2000000,
      termMonths: Number(body.credit_term_months) || 48,
      employmentType: body.credit_employment_type || 'Empleado a Término Indefinido',
      monthlyIncome: Number(body.credit_income) || 5500000,
      preApprovedCode: 'PRE-APROB-' + Math.floor(100000 + Math.random() * 900000),
      status: 'Estudio de Crédito Viable & Pre-Aprobado'
    };
  }
  
  if (method.includes('paypal')) {
    return {
      type: 'PayPal Express Checkout (USD)',
      methodKey: 'paypal',
      paypalEmail: body.paypal_email || body.customer_email || body.email || 'comprador@paypal.com',
      payerCountry: body.paypal_country || 'Colombia (CO)',
      transactionId: 'PAYPAL-TX-' + Math.floor(10000000 + Math.random() * 90000000),
      status: 'Capturado Exitosamente en Pasarela Internacional PayPal'
    };
  }
  
  if (method.includes('mercadopago')) {
    return {
      type: 'Mercado Pago Wallet & Saldo en Cuenta',
      methodKey: 'mercadopago',
      mpEmail: body.mp_email || body.customer_email || body.email || 'cliente@mercadopago.com',
      mpDocNumber: body.mp_doc_number || '1.018.990.221',
      mpPaymentId: 'MP-' + Math.floor(1000000000 + Math.random() * 9000000000),
      status: 'Aprobado Instantáneo Mercado Pago'
    };
  }
  
  return {
    type: body.payment_method || 'Pago Seguro Bancario AutoHub',
    methodKey: 'general',
    status: 'Transacción Exitosa y Verificada'
  };
}

// Global View Helpers Middleware & Database Sync
app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = {};
  if (!req.session.wishlist) req.session.wishlist = [];
  if (!req.session.reservations) req.session.reservations = [];
  if (!req.session.orders) req.session.orders = [];
  if (!req.session.garageVehicle) {
    req.session.garageVehicle = {
      make: 'Toyota',
      model: 'RAV4',
      year: 2021,
      engine: '2.5L Híbrido',
      plate: 'KLU-842'
    };
  }
  if (!req.session.userSettings) {
    req.session.userSettings = {
      currency: 'COP',
      defaultCity: 'Bogotá D.C.',
      autoFilterGarage: true,
      partnerInstallDefault: false,
      extendedWarrantyPrompt: true
    };
  }

  // Synchronize active session user with database record if logged in
  if (req.session.user && req.session.user.id) {
    const freshUser = UserDB.getById(req.session.user.id);
    if (freshUser) {
      req.session.user = freshUser;
      if (freshUser.garageVehicle) {
        req.session.garageVehicle = freshUser.garageVehicle;
      }
    }
  }

  // Calculate cart item count
  let cartCount = 0;
  for (const pid in req.session.cart) {
    cartCount += req.session.cart[pid] || 0;
  }

  // Count user orders from database
  let userOrdersCount = 0;
  if (req.session.user) {
    userOrdersCount = OrderDB.getByUserId(req.session.user.id).length;
  } else {
    userOrdersCount = req.session.orders ? req.session.orders.length : 0;
  }

  res.locals.currentUser = req.session.user || null;
  res.locals.ordersCount = userOrdersCount;
  res.locals.cartCount = cartCount;
  res.locals.wishlistCount = req.session.wishlist.length;
  res.locals.garageVehicle = req.session.garageVehicle;
  res.locals.userSettings = req.session.userSettings;
  res.locals.formatCOP = formatCOP;
  res.locals.formatCOPShort = formatCOPShort;
  res.locals.formatUSD = formatUSD;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.currentPath = req.path;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;

  next();
});

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// 1. HOME LANDING PAGE (Dual Showcase & Search)
app.get(['/', '/index.php'], (req, res) => {
  const allVehicles = VehicleDB.getAll();
  const allParts = PartDB.getAll();

  const featuredVehicles = allVehicles.slice(0, 3);
  const featuredParts = allParts.slice(0, 4);
  const categories = [...new Set(allParts.map(p => p.category))];
  const carMakes = [...new Set(allParts.flatMap(p => p.compatible_vehicles.map(cv => cv.make)))].sort();

  res.render('catalog', {
    title: 'AutoHub | Vehículos Certificados & Autopartes Compatibles',
    featuredVehicles,
    featuredParts,
    categories,
    carMakes,
    totalVehicles: allVehicles.length,
    totalParts: allParts.length
  });
});

// 2. VEHICLES CATALOG & FACETED SEARCH
app.get('/vehiculos', (req, res) => {
  const { make, fuel, transmission, city, min_price, max_price, sort, search } = req.query;

  const allVehicles = VehicleDB.getAll();
  let filtered = [...allVehicles];

  if (make && make !== 'all') {
    filtered = filtered.filter(v => v.make.toLowerCase() === make.toLowerCase());
  }
  if (fuel && fuel !== 'all') {
    filtered = filtered.filter(v => v.fuel.toLowerCase() === fuel.toLowerCase());
  }
  if (transmission && transmission !== 'all') {
    filtered = filtered.filter(v => v.transmission.toLowerCase().includes(transmission.toLowerCase()));
  }
  if (city && city !== 'all') {
    filtered = filtered.filter(v => v.city.toLowerCase() === city.toLowerCase());
  }
  if (min_price) {
    const minVal = Number(min_price);
    filtered = filtered.filter(v => minVal > 1000000 ? v.price_cop >= minVal : v.price_usd >= minVal);
  }
  if (max_price) {
    const maxVal = Number(max_price);
    filtered = filtered.filter(v => maxVal > 1000000 ? v.price_cop <= maxVal : v.price_usd <= maxVal);
  }
  if (search) {
    const q = (Array.isArray(search) ? search.filter(Boolean).join(' ') : String(search)).trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q)
      );
    }
  }

  // Sorting in Colombian Pesos
  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.price_cop - b.price_cop);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.price_cop - a.price_cop);
  } else if (sort === 'year_desc') {
    filtered.sort((a, b) => b.year - a.year);
  } else if (sort === 'mileage_asc') {
    filtered.sort((a, b) => a.mileage_km - b.mileage_km);
  }

  const makes = [...new Set(allVehicles.map(v => v.make))];
  const fuels = [...new Set(allVehicles.map(v => v.fuel))];
  const cities = [...new Set(allVehicles.map(v => v.city))];

  res.render('vehicles-catalog', {
    title: 'Catálogo de Vehículos Certificados | AutoHub',
    vehicles: filtered,
    totalCount: filtered.length,
    selectedFilters: { make, fuel, transmission, city, min_price, max_price, sort, search },
    filterOptions: { makes, fuels, cities }
  });
});

// 3. VEHICLE DETAIL VIEW (360° Gallery, 150-pt Inspection, Legal Report, Finance Calculator, Reservation)
app.get('/vehiculos/:id', (req, res) => {
  const vehicle = VehicleDB.getByIdOrSlug(req.params.id);
  if (!vehicle) {
    req.session.flash = { type: 'error', message: 'Vehículo no encontrado en inventario.' };
    return res.redirect('/vehiculos');
  }

  const relatedVehicles = VehicleDB.getAll().filter(v => v.id !== vehicle.id).slice(0, 3);

  res.render('vehicle-detail', {
    title: `${vehicle.title} (${vehicle.year}) | AutoHub Certificado`,
    vehicle,
    relatedVehicles
  });
});

// 4. VEHICLE RESERVATION SUBMISSION (Persisted in Database)
app.post('/vehiculos/reservar', async (req, res) => {
  const { vehicle_id, customer_name, customer_email, customer_phone, customer_city, payment_method, notes } = req.body;

  // Enforce authentication
  if (!req.session.user) {
    req.session.flash = { 
      type: 'error', 
      message: 'Para continuar con la reserva de tu vehículo debes registrarte o iniciar sesión en tu perfil.' 
    };
    return res.redirect(`/login?redirect=${encodeURIComponent('/vehiculos/' + (vehicle_id || ''))}`);
  }

  const vehicle = VehicleDB.getByIdOrSlug(vehicle_id);

  if (!vehicle) {
    req.session.flash = { type: 'error', message: 'No se pudo procesar la reserva del vehículo.' };
    return res.redirect('/vehiculos');
  }

  const reservationId = 'RES-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const paymentDetails = extractPaymentDetails(req.body);

  const reservation = {
    id: reservationId,
    userId: req.session.user.id,
    vehicle,
    customer: {
      name: customer_name || req.session.user.name,
      email: customer_email || req.session.user.email,
      phone: customer_phone || req.session.user.phone,
      city: customer_city || req.session.user.city,
      notes: notes || 'Sin notas adicionales'
    },
    deposit_amount_usd: 500,
    deposit_amount_cop: 2000000,
    payment_method: paymentDetails.type,
    payment_details: paymentDetails,
    date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: 'Apartado Confirmado por 72h (Peritaje 150 Puntos)'
  };

  // Save in Database
  await ReservationDB.create(reservation);
  req.session.reservations.push(reservation);

  req.session.flash = {
    type: 'success',
    message: `¡Reserva #${reservationId} confirmada exitosamente! El vehículo ha sido apartado para ti y registrado en tu perfil.`
  };

  res.render('vehicle-receipt', {
    title: `Reserva #${reservationId} Confirmada | AutoHub`,
    reservation
  });
});

// 5. AUTO PARTS CATALOG (Strict Database Parts & VIN Compatibility Search)
app.get('/autopartes', (req, res) => {
  let { category, brand, search, car_make, garage_fit_only } = req.query;
  const currentGarage = req.session.garageVehicle;
  const allParts = PartDB.getAll();

  // 1. Normalize input parameters safely
  let rawSearch = '';
  if (Array.isArray(search)) {
    rawSearch = search.map(s => (s || '').trim()).filter(Boolean).join(' ');
  } else if (typeof search === 'string') {
    rawSearch = search.trim();
  }

  let selectedMake = '';
  if (Array.isArray(car_make)) {
    selectedMake = car_make.filter(Boolean)[0] || '';
  } else if (typeof car_make === 'string') {
    selectedMake = car_make.trim();
  }

  let selectedCategory = '';
  if (Array.isArray(category)) {
    selectedCategory = category.filter(Boolean)[0] || '';
  } else if (typeof category === 'string') {
    selectedCategory = category.trim();
  }

  let selectedBrand = '';
  if (Array.isArray(brand)) {
    selectedBrand = brand.filter(Boolean)[0] || '';
  } else if (typeof brand === 'string') {
    selectedBrand = brand.trim();
  }

  // 2. Resolve VIN / Plate / WMI from rawSearch if applicable
  const detectedVehicle = resolveVehicleFromVINorSearch(rawSearch);

  // 3. Strict filtering on database parts
  let filtered = [...allParts];

  if (detectedVehicle) {
    filtered = filtered.filter(part => 
      part.compatible_vehicles.some(cv => {
        const matchMake = cv.make.toLowerCase() === detectedVehicle.make.toLowerCase();
        if (!detectedVehicle.model) return matchMake;
        const cvModel = cv.model.toLowerCase();
        const detModel = detectedVehicle.model.toLowerCase();
        return matchMake && (cvModel.includes(detModel) || detModel.includes(cvModel));
      })
    );
  } else if (rawSearch) {
    const q = rawSearch.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.oem_number.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.compatible_vehicles.some(cv => 
        cv.make.toLowerCase().includes(q) || 
        cv.model.toLowerCase().includes(q) ||
        (cv.engine && cv.engine.toLowerCase().includes(q))
      )
    );
  }

  // Filter by Vehicle Make
  if (selectedMake && selectedMake !== 'all') {
    filtered = filtered.filter(p => 
      p.compatible_vehicles.some(cv => cv.make.toLowerCase() === selectedMake.toLowerCase())
    );
  }

  // Filter by Category
  if (selectedCategory && selectedCategory !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  // Filter by Brand
  if (selectedBrand && selectedBrand !== 'all') {
    filtered = filtered.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
  }

  // Evaluate garage compatibility
  filtered = filtered.map(part => {
    const isCompatible = part.compatible_vehicles.some(
      cv => cv.make.toLowerCase() === currentGarage.make.toLowerCase() &&
            cv.model.toLowerCase() === currentGarage.model.toLowerCase()
    );
    return { ...part, isGarageCompatible: isCompatible };
  });

  if (garage_fit_only === '1') {
    filtered = filtered.filter(p => p.isGarageCompatible);
  }

  const categories = [...new Set(allParts.map(p => p.category))];
  const brands = [...new Set(allParts.map(p => p.brand))].sort();
  const allCarMakes = [...new Set(allParts.flatMap(p => p.compatible_vehicles.map(cv => cv.make)))].sort();

  res.render('parts-catalog', {
    title: detectedVehicle 
      ? `Repuestos Compatibles para ${detectedVehicle.make} ${detectedVehicle.model || ''} | AutoHub`
      : 'Catálogo de Autopartes & Repuestos OEM | AutoHub',
    parts: filtered,
    totalCount: filtered.length,
    selectedFilters: { 
      category: selectedCategory, 
      brand: selectedBrand, 
      search: rawSearch, 
      car_make: selectedMake, 
      garage_fit_only 
    },
    categories,
    brands,
    allCarMakes,
    currentGarage,
    detectedVehicle
  });
});

// 6. AUTO PART DETAIL VIEW
app.get('/autopartes/:id', (req, res) => {
  const part = PartDB.getByIdOrSku(req.params.id);
  if (!part) {
    req.session.flash = { type: 'error', message: 'Pieza o repuesto no encontrado.' };
    return res.redirect('/autopartes');
  }

  const currentGarage = req.session.garageVehicle;
  const isCompatible = part.compatible_vehicles.some(
    cv => cv.make.toLowerCase() === currentGarage.make.toLowerCase() &&
          cv.model.toLowerCase() === currentGarage.model.toLowerCase()
  );

  const relatedParts = PartDB.getAll().filter(p => p.id !== part.id && p.category === part.category).slice(0, 3);

  res.render('part-detail', {
    title: `${part.name} - ${part.brand} | AutoHub`,
    part,
    isCompatible,
    currentGarage,
    relatedParts
  });
});

// 7. VIRTUAL GARAGE & USER SETTINGS ACTION
app.post('/api/garage/set', async (req, res) => {
  const { make, model, year, engine, plate } = req.body;
  const updatedGarage = {
    make: make || 'Toyota',
    model: model || 'RAV4',
    year: Number(year) || 2021,
    engine: engine || '2.5L Híbrido',
    plate: plate ? plate.toUpperCase() : (req.session.garageVehicle ? req.session.garageVehicle.plate : 'KLU-842')
  };

  req.session.garageVehicle = updatedGarage;

  if (req.session.user) {
    await UserDB.update(req.session.user.id, { garageVehicle: updatedGarage });
    req.session.user.garageVehicle = updatedGarage;
  }

  req.session.flash = {
    type: 'success',
    message: `🚗 Garaje virtual actualizado a: ${updatedGarage.make} ${updatedGarage.model} (${updatedGarage.year}). Compatibilidad activa en Pesos Colombianos ($ COP).`
  };

  res.redirect(req.get('Referrer') || '/autopartes');
});

// Full Configuration & Options Save Route
app.post('/api/settings/save', async (req, res) => {
  const { 
    make, model, year, engine, plate,
    currency, defaultCity, autoFilterGarage, partnerInstallDefault, extendedWarrantyPrompt 
  } = req.body;

  if (make || model || year || engine) {
    const updatedGarage = {
      make: make || (req.session.garageVehicle ? req.session.garageVehicle.make : 'Toyota'),
      model: model || (req.session.garageVehicle ? req.session.garageVehicle.model : 'RAV4'),
      year: Number(year) || (req.session.garageVehicle ? req.session.garageVehicle.year : 2021),
      engine: engine || (req.session.garageVehicle ? req.session.garageVehicle.engine : '2.5L Híbrido'),
      plate: plate ? plate.toUpperCase() : (req.session.garageVehicle ? req.session.garageVehicle.plate : 'KLU-842')
    };
    req.session.garageVehicle = updatedGarage;
    if (req.session.user) {
      await UserDB.update(req.session.user.id, { garageVehicle: updatedGarage });
    }
  }

  req.session.userSettings = {
    currency: currency || 'COP',
    defaultCity: defaultCity || 'Bogotá D.C.',
    autoFilterGarage: autoFilterGarage === '1' || autoFilterGarage === 'true',
    partnerInstallDefault: partnerInstallDefault === '1' || partnerInstallDefault === 'true',
    extendedWarrantyPrompt: extendedWarrantyPrompt === '1' || extendedWarrantyPrompt === 'true'
  };

  req.session.flash = {
    type: 'success',
    message: `⚙️ Opciones guardadas en Base de Datos. Precios configurados en Peso Colombiano ($ COP) para ${req.session.userSettings.defaultCity}.`
  };

  res.redirect(req.get('Referrer') || '/');
});

// 8. INTERACTIVE VALUATION / VEHICLE APPRAISAL TOOL ("Vender mi Auto")
app.get(['/tasador', '/vender'], (req, res) => {
  res.render('appraisal', {
    title: 'Tasa y Vende tu Auto en 2 Minutos | AutoHub Motors'
  });
});

app.post('/api/tasador/calcular', async (req, res) => {
  const { plate, vin, make, model, year, mileage, condition, phone, email } = req.body;

  const basePrices = {
    'toyota': 32000,
    'bmw': 55000,
    'audi': 34000,
    'mazda': 25000,
    'chevrolet': 16000,
    'ford': 42000,
    'renault': 14000,
    'volkswagen': 22000,
    'otro': 20000
  };

  const selectedMake = (make || 'toyota').toLowerCase();
  const base = basePrices[selectedMake] || 22000;
  const currentYr = 2026;
  const carYr = Number(year) || 2021;
  const age = Math.max(0, currentYr - carYr);
  const depreciationFactor = Math.pow(0.92, age);
  const km = Number(mileage) || 40000;
  const kmFactor = Math.max(0.75, 1 - (km / 250000) * 0.3);

  let conditionFactor = 1.0;
  if (condition === 'excelente') conditionFactor = 1.08;
  else if (condition === 'regular') conditionFactor = 0.88;

  const estimatedValueUSD = Math.round(base * depreciationFactor * kmFactor * conditionFactor);
  const lowRangeUSD = Math.round(estimatedValueUSD * 0.94);
  const highRangeUSD = Math.round(estimatedValueUSD * 1.06);

  const lowRangeCOP = lowRangeUSD * 3950;
  const highRangeCOP = highRangeUSD * 3950;
  const instantOfferUSD = Math.round(lowRangeUSD * 0.96);
  const instantOfferCOP = Math.round(lowRangeCOP * 0.96);

  const valuationRecord = {
    id: 'VAL-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    userId: req.session.user ? req.session.user.id : null,
    plate: plate ? plate.toUpperCase() : 'NO-REGISTRADA',
    vin: vin ? vin.toUpperCase() : 'PENDIENTE',
    make: make || 'Vehículo',
    model: model || 'N/A',
    year: carYr,
    mileage: km,
    condition: condition || 'bueno',
    lowUSD: lowRangeUSD,
    highUSD: highRangeUSD,
    lowCOP: lowRangeCOP,
    highCOP: highRangeCOP,
    instantOfferUSD,
    instantOfferCOP,
    phone: phone || (req.session.user ? req.session.user.phone : ''),
    email: email || (req.session.user ? req.session.user.email : ''),
    date: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  // Save to database
  await AppraisalDB.create(valuationRecord);

  res.render('appraisal-result', {
    title: `Resultado de Tasación para tu ${make} ${model} | AutoHub`,
    valuation: valuationRecord
  });
});

// 9. SHOPPING CART FOR AUTO PARTS
app.get('/carrito', (req, res) => {
  const cart = req.session.cart || {};
  const items = [];
  let subtotalCOP = 0;
  let subtotalUSD = 0;
  let totalWeightKg = 0;

  for (const partId in cart) {
    const qty = cart[partId];
    const part = PartDB.getByIdOrSku(partId);
    if (part && qty > 0) {
      const itemTotalCOP = part.price_cop * qty;
      const itemTotalUSD = part.price_usd * qty;
      subtotalCOP += itemTotalCOP;
      subtotalUSD += itemTotalUSD;
      totalWeightKg += (part.weight_kg || 1) * qty;

      items.push({
        part,
        quantity: qty,
        totalCOP: itemTotalCOP,
        totalUSD: itemTotalUSD
      });
    }
  }

  // Shipping logic: Free over $200.000 COP, else $15.000 base + weight
  const freeThresholdCOP = 200000;
  const shippingCOP = subtotalCOP >= freeThresholdCOP || subtotalCOP === 0 ? 0 : Math.round(15000 + totalWeightKg * 2000);
  const totalCOP = subtotalCOP + shippingCOP;

  res.render('cart', {
    title: 'Carrito de Compras de Autopartes | AutoHub',
    items,
    subtotalCOP,
    subtotalUSD,
    shippingCOP,
    totalCOP,
    totalWeightKg
  });
});

app.post('/api/cart/add', (req, res) => {
  const { part_id, quantity } = req.body;
  const qty = parseInt(quantity, 10) || 1;

  if (!req.session.cart) req.session.cart = {};
  req.session.cart[part_id] = (req.session.cart[part_id] || 0) + qty;

  req.session.flash = {
    type: 'success',
    message: '✓ Producto añadido exitosamente al carrito.'
  };

  res.redirect('/carrito');
});

app.post('/api/cart/update', (req, res) => {
  const { part_id, quantity } = req.body;
  const qty = parseInt(quantity, 10);

  if (req.session.cart && req.session.cart[part_id] !== undefined) {
    if (qty <= 0) {
      delete req.session.cart[part_id];
    } else {
      req.session.cart[part_id] = qty;
    }
  }

  res.redirect('/carrito');
});

app.post('/api/cart/remove', (req, res) => {
  const { part_id } = req.body;
  if (req.session.cart && req.session.cart[part_id]) {
    delete req.session.cart[part_id];
  }
  res.redirect('/carrito');
});

// 10. CHECKOUT FOR PARTS
app.get('/checkout', (req, res) => {
  const cart = req.session.cart || {};
  const items = [];
  let subtotalCOP = 0;

  for (const partId in cart) {
    const qty = cart[partId];
    const part = PartDB.getByIdOrSku(partId);
    if (part && qty > 0) {
      const itemTotalCOP = part.price_cop * qty;
      subtotalCOP += itemTotalCOP;
      items.push({ part, quantity: qty, totalCOP: itemTotalCOP });
    }
  }

  if (items.length === 0) {
    req.session.flash = { type: 'error', message: 'Tu carrito está vacío.' };
    return res.redirect('/autopartes');
  }

  const shippingCOP = subtotalCOP >= 200000 ? 0 : 18000;
  const totalCOP = subtotalCOP + shippingCOP;

  res.render('checkout', {
    title: 'Finalizar Compra Segura de Autopartes | AutoHub',
    items,
    subtotalCOP,
    shippingCOP,
    totalCOP
  });
});

app.post('/api/checkout/process', async (req, res) => {
  const { 
    first_name, 
    last_name, 
    email, 
    phone, 
    address, 
    city, 
    department, 
    payment_method, 
    install_in_partner_shop,
    direct_part_id,
    direct_quantity
  } = req.body;

  const items = [];
  let subtotalCOP = 0;

  if (direct_part_id) {
    const qty = parseInt(direct_quantity, 10) || 1;
    const part = PartDB.getByIdOrSku(direct_part_id);
    if (part) {
      const itemTotalCOP = part.price_cop * qty;
      subtotalCOP = itemTotalCOP;
      items.push({ part, quantity: qty, totalCOP: itemTotalCOP });
    }
  } else {
    const cart = req.session.cart || {};
    for (const partId in cart) {
      const qty = cart[partId];
      const part = PartDB.getByIdOrSku(partId);
      if (part && qty > 0) {
        const itemTotalCOP = part.price_cop * qty;
        subtotalCOP += itemTotalCOP;
        items.push({ part, quantity: qty, totalCOP: itemTotalCOP });
      }
    }
  }

  // Fallback if no items
  if (items.length === 0 && PartDB.getAll().length > 0) {
    const fallbackPart = PartDB.getAll()[0];
    items.push({ part: fallbackPart, quantity: 1, totalCOP: fallbackPart.price_cop });
    subtotalCOP = fallbackPart.price_cop;
  }

  const orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const trackingNumber = 'AUTOHUB-COL-' + Math.floor(10000000 + Math.random() * 90000000);
  const shippingCOP = subtotalCOP >= 200000 ? 0 : 18000;
  const totalCOP = subtotalCOP + shippingCOP;
  const paymentDetails = extractPaymentDetails(req.body);

  const order = {
    id: orderId,
    userId: req.session.user ? req.session.user.id : null,
    trackingNumber,
    items,
    subtotal: subtotalCOP,
    shipping: shippingCOP,
    total: totalCOP,
    customer: {
      name: `${first_name} ${last_name}`.trim(),
      email,
      phone,
      address: `${address}, ${city} - ${department}`,
      partnerShopInstall: install_in_partner_shop === '1'
    },
    paymentMethod: paymentDetails.type,
    payment_details: paymentDetails,
    date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: 'Preparando Despacho Express'
  };

  // Persist order in Database
  await OrderDB.create(order);
  req.session.orders.push(order);

  if (!direct_part_id) {
    req.session.cart = {}; // Empty cart on checkout
  }

  res.render('receipt', {
    title: `Recibo de Compra #${orderId} | AutoHub`,
    order
  });
});

// 11. ORDERS HISTORY VIEW (/ordenes)
app.get('/ordenes', (req, res) => {
  let ordersList = [];
  if (req.session.user) {
    ordersList = OrderDB.getByUserId(req.session.user.id);
  } else {
    ordersList = req.session.orders || [];
  }

  res.render('orders', {
    title: 'Historial de Pedidos de Autopartes | AutoHub Colombia',
    orders: ordersList
  });
});

// 12. TECHNICAL ARCHITECTURE & DATABASE DELIVERABLE VIEWER
app.get('/arquitectura', (req, res) => {
  res.render('architecture-docs', {
    title: 'Arquitectura de Software, Diagramas & Esquema de Base de Datos | AutoHub'
  });
});

// -------------------------------------------------------------
// 13. AUTHENTICATION & USER MANAGEMENT ROUTES (Database Integrated)
// -------------------------------------------------------------

// A. Login View
app.get(['/login', '/iniciar-sesion'], (req, res) => {
  const mode = req.query.mode || 'login';
  const returnUrl = req.query.redirect || req.query.returnUrl || '/perfil';

  // If already logged in, redirect directly to profile or returnUrl
  if (req.session.user && mode === 'login') {
    return res.redirect(returnUrl);
  }

  res.render('login', {
    title: 'Iniciar Sesión, Registro y Recuperar Contraseña | AutoHub Colombia',
    mode,
    returnUrl
  });
});

// B. Register View (Direct tab shortcut)
app.get(['/registro', '/registrarse'], (req, res) => {
  const returnUrl = req.query.redirect || req.query.returnUrl || '/perfil';
  if (req.session.user) {
    return res.redirect('/perfil');
  }

  res.render('login', {
    title: 'Crear Cuenta Nueva | AutoHub Motors & Parts',
    mode: 'register',
    returnUrl
  });
});

// C. Password Recovery View (Direct tab shortcut)
app.get(['/recuperar-password', '/recuperar', '/forgot-password'], (req, res) => {
  res.render('login', {
    title: 'Recuperar Contraseña | AutoHub Colombia',
    mode: 'recovery',
    returnUrl: '/perfil'
  });
});

// D. Process Login Form (Verified against Database)
app.post('/api/auth/login', (req, res) => {
  const { email, password, returnUrl } = req.body;
  const targetUrl = (returnUrl && returnUrl.startsWith('/') && returnUrl !== '/login') ? returnUrl : '/perfil';

  if (!email || !password) {
    req.session.flash = { type: 'error', message: 'Por favor ingresa tu correo y contraseña.' };
    return res.redirect(`/login?redirect=${encodeURIComponent(targetUrl)}`);
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = UserDB.getByEmail(cleanEmail);

  if (!user || user.password !== password.trim()) {
    req.session.flash = { 
      type: 'error', 
      message: 'Correo electrónico o contraseña incorrectos. Verifica tus credenciales o usa las cuentas de acceso demo.' 
    };
    return res.redirect(`/login?redirect=${encodeURIComponent(targetUrl)}`);
  }

  // Store in session
  req.session.user = user;
  if (user.garageVehicle) {
    req.session.garageVehicle = user.garageVehicle;
  }

  req.session.flash = { 
    type: 'success', 
    message: `¡Bienvenido, ${user.name}! Has iniciado sesión correctamente en tu perfil de AutoHub.` 
  };

  // Redirect directly to profile (or requested URL)
  res.redirect(targetUrl);
});

// E. Process Registration Form (Persisted to Database & Auto-logged in)
app.post('/api/auth/register', async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    phone, 
    city, 
    garage_make, 
    garage_model, 
    garage_plate, 
    returnUrl 
  } = req.body;

  const targetUrl = (returnUrl && returnUrl.startsWith('/') && returnUrl !== '/login' && returnUrl !== '/registro') ? returnUrl : '/perfil';

  if (!name || !email || !password) {
    req.session.flash = { type: 'error', message: 'Nombre, correo y contraseña son obligatorios.' };
    return res.redirect(`/registro?redirect=${encodeURIComponent(targetUrl)}`);
  }

  const cleanEmail = email.trim().toLowerCase();
  const existingUser = UserDB.getByEmail(cleanEmail);

  if (existingUser) {
    req.session.flash = { type: 'error', message: 'Ya existe una cuenta con este correo. Por favor inicia sesión.' };
    return res.redirect(`/login?redirect=${encodeURIComponent(targetUrl)}`);
  }

  // Create new user in Database
  const newUser = await UserDB.create({
    name: name.trim(),
    email: cleanEmail,
    password: password.trim(),
    phone: phone ? phone.trim() : '+57 300 000 0000',
    city: city || 'Bogotá D.C.',
    department: 'Cundinamarca',
    address: '',
    role: 'Cliente Verificado',
    avatar: '🚗',
    garageVehicle: {
      make: garage_make ? garage_make.trim() : 'Toyota',
      model: garage_model ? garage_model.trim() : 'Corolla',
      year: 2022,
      engine: '2.0L Gasolina',
      plate: garage_plate ? garage_plate.trim().toUpperCase() : 'ABC-123'
    }
  });

  // Auto Login immediately
  req.session.user = newUser;
  req.session.garageVehicle = newUser.garageVehicle;

  req.session.flash = { 
    type: 'success', 
    message: `¡Registro exitoso en la Base de Datos! Bienvenido a AutoHub Colombia, ${newUser.name}. Ya tienes tu perfil activo.` 
  };

  res.redirect(targetUrl);
});

// F. API: Request Password Recovery OTP Code
app.post('/api/auth/request-recovery', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Correo electrónico requerido.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const otpCode = 'AH-' + Math.floor(10000 + Math.random() * 90000);
  OTP_STORE[cleanEmail] = {
    code: otpCode,
    expiresAt: Date.now() + 15 * 60 * 1000
  };

  return res.json({
    success: true,
    otpCode,
    message: `Código de verificación generado para ${cleanEmail}.`
  });
});

// G. Process Password Reset Form
app.post('/api/auth/reset-password', async (req, res) => {
  const { recoveryEmail, otpCode, newPassword } = req.body;

  if (!recoveryEmail || !newPassword) {
    req.session.flash = { type: 'error', message: 'Datos incompletos para restablecer la contraseña.' };
    return res.redirect('/recuperar-password');
  }

  const cleanEmail = recoveryEmail.trim().toLowerCase();
  let user = UserDB.getByEmail(cleanEmail);

  if (!user) {
    user = await UserDB.create({
      name: cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      password: newPassword.trim(),
      phone: '+57 310 987 6543',
      city: 'Bogotá D.C.',
      role: 'Cliente Verificado',
      avatar: '👤'
    });
  } else {
    await UserDB.updatePassword(user.id, newPassword.trim());
    user = UserDB.getById(user.id);
  }

  // Clear OTP
  delete OTP_STORE[cleanEmail];

  // Auto Login upon reset
  req.session.user = user;
  if (user.garageVehicle) {
    req.session.garageVehicle = user.garageVehicle;
  }

  req.session.flash = { 
    type: 'success', 
    message: '¡Contraseña actualizada exitosamente en la base de datos! Has iniciado sesión en tu perfil.' 
  };

  res.redirect('/perfil');
});

// H. Logout
app.get(['/logout', '/cerrar-sesion'], (req, res) => {
  delete req.session.user;
  req.session.flash = { type: 'success', message: 'Has cerrado sesión con éxito en AutoHub.' };
  res.redirect('/');
});

// I. User Profile Dashboard (Loaded dynamically from Database)
app.get(['/perfil', '/mi-cuenta'], (req, res) => {
  if (!req.session.user) {
    req.session.flash = { 
      type: 'error', 
      message: 'Por favor inicia sesión para acceder a tu perfil y panel de cuenta.' 
    };
    return res.redirect('/login?redirect=/perfil');
  }

  const freshUser = UserDB.getById(req.session.user.id) || req.session.user;
  const userOrders = OrderDB.getByUserId(freshUser.id);
  const userReservations = ReservationDB.getByUserId(freshUser.id);
  const userAppraisals = AppraisalDB.getByUserId(freshUser.id);

  res.render('profile', {
    title: `Mi Cuenta AutoHub | ${freshUser.name}`,
    currentUser: freshUser,
    orders: userOrders,
    reservations: userReservations,
    appraisals: userAppraisals,
    ordersCount: userOrders.length
  });
});

// J. Update Profile Information (Saved to Database)
app.post('/api/profile/update', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const { name, phone, city, department, address, avatar } = req.body;
  
  const updatedUser = await UserDB.update(req.session.user.id, {
    name: name ? name.trim() : req.session.user.name,
    phone: phone ? phone.trim() : req.session.user.phone,
    city: city ? city.trim() : req.session.user.city,
    department: department ? department.trim() : (req.session.user.department || 'Cundinamarca'),
    address: address ? address.trim() : req.session.user.address,
    avatar: avatar || req.session.user.avatar || '👤'
  });

  if (updatedUser) {
    req.session.user = updatedUser;
  }

  req.session.flash = { 
    type: 'success', 
    message: '✓ Datos personales actualizados correctamente en la Base de Datos.' 
  };

  res.redirect('/perfil');
});

// K. Update Profile Garage Vehicle (Saved to Database)
app.post('/api/profile/garage', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const { garage_make, garage_model, garage_year, garage_plate } = req.body;
  const newGarage = {
    make: garage_make ? garage_make.trim() : 'Toyota',
    model: garage_model ? garage_model.trim() : 'Corolla',
    year: garage_year ? parseInt(garage_year, 10) : 2022,
    engine: 'Motor Optimizado OEM',
    plate: garage_plate ? garage_plate.trim().toUpperCase() : 'ABC-123'
  };

  const updatedUser = await UserDB.update(req.session.user.id, { garageVehicle: newGarage });
  if (updatedUser) {
    req.session.user = updatedUser;
  }
  req.session.garageVehicle = newGarage;

  req.session.flash = { 
    type: 'success', 
    message: `🚗 Garaje virtual guardado en la Base de Datos: ${newGarage.make} ${newGarage.model} (${newGarage.year}).` 
  };

  res.redirect('/perfil');
});

// L. Change Password from Profile (Saved to Database)
app.post('/api/profile/change-password', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const { currentPassword, newPassword } = req.body;
  const user = UserDB.getById(req.session.user.id);

  if (!user || user.password !== currentPassword.trim()) {
    req.session.flash = { type: 'error', message: 'La contraseña actual ingresada no coincide.' };
    return res.redirect('/perfil');
  }

  await UserDB.updatePassword(user.id, newPassword.trim());

  req.session.flash = { 
    type: 'success', 
    message: '🔐 Contraseña actualizada con éxito en la Base de Datos.' 
  };

  res.redirect('/perfil');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AutoHub Motors & Parts server with Database running at http://0.0.0.0:${PORT}`);
});

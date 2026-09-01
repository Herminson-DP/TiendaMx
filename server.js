import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Session configuration
app.use(
  session({
    secret: 'tienda-colombia-secret-ecommerce-2026',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  })
);

// Initial Rich Catalog with Colombian Pesos (COP)
let defaultProducts = {
  1: {
    id: 1,
    name: 'MacBook Pro 16" M3 Max',
    category: 'Electrónica',
    price: 14499000.0,
    discount: 12,
    rating: 4.9,
    reviewsCount: 38,
    stock: 8,
    badge: 'Más Vendido',
    description: 'Potencia profesional extrema con chip M3 Max, pantalla Liquid Retina XDR de 120Hz y hasta 22 horas de autonomía.',
    specs: '36GB RAM Unificada, 1TB SSD NVMe, Chip M3 Max (16 núcleos CPU / 40 GPU), Gris Espacial',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
    ]
  },
  2: {
    id: 2,
    name: 'Sony WH-1000XM5 Noise Cancelling',
    category: 'Audio',
    price: 1799000.0,
    discount: 18,
    rating: 4.8,
    reviewsCount: 114,
    stock: 15,
    badge: 'Oferta',
    description: 'Audífonos inalámbricos líderes en cancelación de ruido activa con procesador V1, audio Hi-Res y llamadas ultra nítidas.',
    specs: 'Cancelación Activa Doble Chip, 30h Batería, Bluetooth 5.2 LDAC, Carga Rápida 3min = 3h',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
    ]
  },
  3: {
    id: 3,
    name: 'iPhone 15 Pro Titanium 256GB',
    category: 'Electrónica',
    price: 5299000.0,
    discount: 8,
    rating: 4.9,
    reviewsCount: 82,
    stock: 12,
    badge: 'Nuevo',
    description: 'Diseño en titanio de grado aeroespacial, chip A17 Pro revolucionario para gaming y cámara de 48 MP con zoom óptico 5x.',
    specs: 'Pantalla 6.1" OLED Super Retina XDR ProMotion, 256GB, USB-C 3.0, Botón de Acción',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
    ]
  },
  4: {
    id: 4,
    name: 'Silla Ergonómica Herman Miller Aeron Style',
    category: 'Hogar & Oficina',
    price: 2450000.0,
    discount: 15,
    rating: 4.7,
    reviewsCount: 46,
    stock: 6,
    badge: 'Ergonómico',
    description: 'Silla ejecutiva de alto confort con malla Pellicle transpirable, soporte lumbar PostureFit SL y reclinación sincronizada.',
    specs: 'Estructura de Aluminio Reforzado, Brazos 4D Ajustables, Pistón Clase 4, Capacidad 150kg',
    image: 'https://images.unsplash.com/photo-1580481077195-c3a9f0a5317b?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1580481077195-c3a9f0a5317b?w=800&auto=format&fit=crop&q=80'
    ]
  },
  5: {
    id: 5,
    name: 'Smartwatch Galaxy Watch Ultra 47mm',
    category: 'Gadgets',
    price: 2390000.0,
    discount: 20,
    rating: 4.8,
    reviewsCount: 63,
    stock: 10,
    badge: 'Oferta',
    description: 'Reloj inteligente todoterreno con caja de titanio grado 4, GPS dual de precisión, ECG y resistencia al agua 10ATM.',
    specs: 'Pantalla Sapphire Crystal 3000 nits, Batería 100h en modo ahorro, Sensor BioActive, LTE',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
    ]
  },
  6: {
    id: 6,
    name: 'Cafetera Espresso Barista Touch Pro',
    category: 'Hogar & Oficina',
    price: 3150000.0,
    discount: 10,
    rating: 4.9,
    reviewsCount: 29,
    stock: 5,
    badge: 'Premium',
    description: 'Prepara café de especialidad colombiano en casa con molinillo integrado cónico, control digital de temperatura PID y vaporizador microespuma.',
    specs: 'Bomba italiana 15 Bares, Pantalla Touch LCD, Molino de 30 niveles, Acero Inoxidable 304',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80'
    ]
  },
  7: {
    id: 7,
    name: 'Tenis Running Nike Air Zoom Alpha',
    category: 'Moda & Deportes',
    price: 689000.0,
    discount: 0,
    rating: 4.6,
    reviewsCount: 75,
    stock: 18,
    badge: 'Popular',
    description: 'Calzado para correr de alto kilometraje con amortiguación de espuma reactiva ZoomX y placa de fibra de carbono.',
    specs: 'Suela de goma antideslizante, Tejido Flyknit transpirable, Drop 8mm, Peso 215g',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
    ]
  },
  8: {
    id: 8,
    name: 'Cámara Mirrorless Sony Alpha A7 IV',
    category: 'Fotografía',
    price: 11490000.0,
    discount: 15,
    rating: 5.0,
    reviewsCount: 42,
    stock: 4,
    badge: 'Pro',
    description: 'Sensor Full-Frame de 33MP, grabación 4K a 60p en 10-bit 4:2:2, estabilización en el cuerpo de 5.5 pasos y enfoque por IA en tiempo real.',
    specs: 'Sensor Exmor R BSI CMOS, 759 puntos AF detección de fases, Doble ranura SD/CFexpress, HDMI tipo A',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
    ]
  }
};

let globalConfig = {
  store_name: 'Tienda Colombia',
  tagline: 'Tu tienda en línea favorita para tecnología, audio, moda y hogar en Colombia',
  tax: 19,
  shipping: 18000.0,
  free_shipping_threshold: 200000.0,
  currency: 'COP'
};

let defaultCoupons = {
  'BIENVENIDO10': { code: 'BIENVENIDO10', type: 'percent', value: 10, description: '10% de descuento de bienvenida' },
  'SUPER20': { code: 'SUPER20', type: 'percent', value: 20, description: '20% de descuento especial' },
  'ENVIOGRATIS': { code: 'ENVIOGRATIS', type: 'free_shipping', value: 0, description: 'Envío completamente gratis' },
  'DESCUENTO50K': { code: 'DESCUENTO50K', type: 'fixed', value: 50000, description: '$50.000 COP de descuento directo' }
};

let globalOrders = {
  'ORD-COL101': {
    id: 'ORD-COL101',
    date: '2026-08-25 14:32:10',
    status: 'Enviado',
    trackingNumber: 'SERVI-88294719CO',
    paymentMethod: 'PSE (Bancolombia)',
    shippingMethod: 'Express Colombia (24-48 hrs)',
    customer: {
      name: 'Andrés Felipe Restrepo',
      email: 'andres.restrepo@email.com',
      phone: '+57 310 456 7890',
      address: 'Cra. 15 # 93-60, Chicó Norte, Bogotá D.C., C.P. 110221'
    },
    items: [
      {
        product: defaultProducts[2],
        quantity: 1,
        unit_price: 1475180.0,
        total: 1475180.0
      }
    ],
    subtotal: 1475180.0,
    discountAmount: 0,
    couponCode: null,
    tax: 280284.2,
    shipping: 18000.0,
    total: 1773464.2
  }
};

// Middleware for Session and Locals
app.use((req, res, next) => {
  // If session has legacy Mexican config, update to Colombian Pesos
  if (!req.session.config || req.session.config.currency === 'MXN') {
    req.session.config = { ...globalConfig };
    req.session.products = JSON.parse(JSON.stringify(defaultProducts));
    req.session.coupons = { ...defaultCoupons };
    req.session.orders = JSON.parse(JSON.stringify(globalOrders));
    req.session.cart = {};
    req.session.activeCoupon = null;
  }
  if (!req.session.products) {
    req.session.products = JSON.parse(JSON.stringify(defaultProducts));
  }
  if (!req.session.cart) {
    req.session.cart = {};
  }
  if (!req.session.wishlist) {
    req.session.wishlist = [];
  }
  if (!req.session.orders) {
    req.session.orders = JSON.parse(JSON.stringify(globalOrders));
  }
  if (!req.session.coupons) {
    req.session.coupons = { ...defaultCoupons };
  }
  if (req.session.activeCoupon === undefined) {
    req.session.activeCoupon = null;
  }

  // Flash message system
  res.locals.flash = req.session.flash || null;
  req.session.flash = null;

  // Cart total badge
  const cartValues = Object.values(req.session.cart || {});
  const cartCount = cartValues.reduce((sum, qty) => sum + (Number(qty) || 0), 0);
  const wishlistCount = (req.session.wishlist || []).length;

  // Global Money / Currency Formatter Helper for Colombian Pesos
  const formatMoney = (val) => {
    const num = Number(val) || 0;
    return '$' + Math.round(num).toLocaleString('es-CO');
  };

  res.locals.formatMoney = formatMoney;
  res.locals.cartCount = cartCount;
  res.locals.wishlistCount = wishlistCount;
  res.locals.wishlist = req.session.wishlist || [];
  res.locals.config = req.session.config;
  res.locals.session = req.session;
  res.locals.currentYear = new Date().getFullYear();

  next();
});

// Helper Functions
function getProducts(req, { category = null, search = null, sort = null, minPrice = null, maxPrice = null, inStock = false }) {
  let products = Object.values(req.session.products || {});

  if (category && category.trim() !== '') {
    products = products.filter(
      p => p.category && p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search && search.trim() !== '') {
    const term = search.toLowerCase();
    products = products.filter(
      p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.specs && p.specs.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term))
    );
  }

  if (minPrice !== null && !isNaN(minPrice) && minPrice !== '') {
    products = products.filter(p => {
      const finalPrice = p.price * (1 - (p.discount || 0) / 100);
      return finalPrice >= parseFloat(minPrice);
    });
  }

  if (maxPrice !== null && !isNaN(maxPrice) && maxPrice !== '') {
    products = products.filter(p => {
      const finalPrice = p.price * (1 - (p.discount || 0) / 100);
      return finalPrice <= parseFloat(maxPrice);
    });
  }

  if (inStock) {
    products = products.filter(p => (p.stock || 0) > 0);
  }

  // Sorting
  if (sort === 'price_asc') {
    products.sort((a, b) => {
      const pA = a.price * (1 - (a.discount || 0) / 100);
      const pB = b.price * (1 - (b.discount || 0) / 100);
      return pA - pB;
    });
  } else if (sort === 'price_desc') {
    products.sort((a, b) => {
      const pA = a.price * (1 - (a.discount || 0) / 100);
      const pB = b.price * (1 - (b.discount || 0) / 100);
      return pB - pA;
    });
  } else if (sort === 'discount') {
    products.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  } else if (sort === 'rating') {
    products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sort === 'newest') {
    products.sort((a, b) => b.id - a.id);
  }

  return products;
}

function calculateCartTotals(req, shippingType = 'standard') {
  const cartItems = req.session.cart || {};
  const products = req.session.products || {};
  const taxRate = Number(req.session.config && req.session.config.tax) || 19;
  const baseShipping = Number(req.session.config && req.session.config.shipping) || 18000.0;
  const freeThreshold = Number(req.session.config && req.session.config.free_shipping_threshold) || 200000.0;

  const items = [];
  let subtotal = 0;

  for (const [productId, qty] of Object.entries(cartItems)) {
    const product = products[productId];
    if (product && qty > 0) {
      const discount = Number(product.discount) || 0;
      const unitPrice = Number(product.price) * (1 - discount / 100);
      const totalItem = unitPrice * Number(qty);
      subtotal += totalItem;

      items.push({
        product,
        quantity: Number(qty),
        unit_price: unitPrice,
        total: totalItem
      });
    }
  }

  // Handle Coupon Discount
  let discountAmount = 0;
  let freeShippingFromCoupon = false;
  const coupon = req.session.activeCoupon;

  if (coupon && subtotal > 0) {
    if (coupon.type === 'percent') {
      discountAmount = subtotal * (coupon.value / 100);
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === 'free_shipping') {
      freeShippingFromCoupon = true;
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Shipping logic
  let shippingCost = 0;
  const expressSurcharge = 12000.0;
  if (subtotal > 0) {
    if (freeShippingFromCoupon || subtotal >= freeThreshold) {
      shippingCost = shippingType === 'express' ? expressSurcharge : 0.0;
    } else {
      shippingCost = shippingType === 'express' ? baseShipping + expressSurcharge : baseShipping;
    }
  }

  const taxAmount = discountedSubtotal * (taxRate / 100);
  const finalTotal = subtotal > 0 ? discountedSubtotal + taxAmount + shippingCost : 0;

  const missingForFreeShipping = Math.max(0, freeThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return {
    items,
    subtotal,
    discountAmount,
    discountedSubtotal,
    coupon,
    tax: taxAmount,
    shipping: shippingCost,
    shippingType,
    freeThreshold,
    missingForFreeShipping,
    freeShippingProgress,
    final_total: finalTotal
  };
}

// Controller Handlers
const handleHome = (req, res) => {
  const category = req.query.category || null;
  const search = req.query.search || null;
  const sort = req.query.sort || 'featured';
  const minPrice = req.query.min_price || null;
  const maxPrice = req.query.max_price || null;
  const inStock = req.query.in_stock === '1' || req.query.in_stock === 'true';

  const products = getProducts(req, { category, search, sort, minPrice, maxPrice, inStock });
  const allProducts = Object.values(req.session.products || {});
  
  // Category counting
  const categoryCounts = {};
  allProducts.forEach(p => {
    if (p.category) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }
  });

  const categories = Object.keys(categoryCounts);
  const featuredProducts = allProducts.filter(p => p.badge || p.discount > 10).slice(0, 4);

  res.render('catalog', {
    title: req.session.config.store_name,
    products,
    featuredProducts,
    categories,
    categoryCounts,
    totalProductsCount: allProducts.length,
    search: search || '',
    selectedCategory: category || '',
    sort,
    minPrice: minPrice || '',
    maxPrice: maxPrice || '',
    inStock
  });
};

const handleProductDetail = (req, res) => {
  const id = parseInt(req.query.id || req.params.id, 10);
  const product = req.session.products[id];

  if (!product) {
    req.session.flash = { type: 'error', message: 'Producto no encontrado.' };
    return res.redirect('/index.php');
  }

  const allProducts = Object.values(req.session.products || {});
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  res.render('product-detail', {
    title: `${product.name} - ${req.session.config.store_name}`,
    product,
    relatedProducts
  });
};

const handleViewCart = (req, res) => {
  const shippingType = req.query.shipping || 'standard';
  const details = calculateCartTotals(req, shippingType);
  res.render('cart', {
    title: `Carrito de Compras - ${req.session.config.store_name}`,
    details
  });
};

const handleAddToCart = (req, res) => {
  const productId = parseInt(req.body.product_id, 10);
  const quantity = parseInt(req.body.quantity || 1, 10);

  if (productId && req.session.products[productId]) {
    const currentQty = req.session.cart[productId] || 0;
    const maxStock = req.session.products[productId].stock || 99;
    const newQty = Math.min(currentQty + quantity, maxStock);

    req.session.cart[productId] = newQty;
    req.session.flash = {
      type: 'success',
      message: `¡${req.session.products[productId].name} agregado al carrito con éxito!`
    };
  }

  const returnUrl = req.body.return_url || '/index.php?action=cart';
  res.redirect(returnUrl);
};

const handleUpdateCart = (req, res) => {
  const productId = parseInt(req.body.product_id, 10);
  const quantity = parseInt(req.body.quantity, 10);
  if (productId) {
    if (quantity <= 0) {
      delete req.session.cart[productId];
      req.session.flash = { type: 'info', message: 'Producto eliminado del carrito.' };
    } else {
      const maxStock = (req.session.products[productId] && req.session.products[productId].stock) || 99;
      req.session.cart[productId] = Math.min(quantity, maxStock);
      req.session.flash = { type: 'success', message: 'Cantidad actualizada.' };
    }
  }
  res.redirect('/index.php?action=cart');
};

const handleRemoveFromCart = (req, res) => {
  const productId = parseInt(req.query.id, 10);
  if (productId && req.session.cart[productId]) {
    delete req.session.cart[productId];
    req.session.flash = { type: 'info', message: 'Producto eliminado del carrito.' };
  }
  res.redirect('/index.php?action=cart');
};

const handleApplyCoupon = (req, res) => {
  const code = (req.body.coupon_code || '').trim().toUpperCase();
  const coupons = req.session.coupons || defaultCoupons;

  if (code && coupons[code]) {
    req.session.activeCoupon = coupons[code];
    req.session.flash = {
      type: 'success',
      message: `Cupón "${code}" aplicado exitosamente (${coupons[code].description}).`
    };
  } else {
    req.session.flash = {
      type: 'error',
      message: `El cupón "${code}" no es válido o ha expirado.`
    };
  }

  const redirectUrl = req.body.redirect_to === 'checkout' ? '/index.php?action=checkout' : '/index.php?action=cart';
  res.redirect(redirectUrl);
};

const handleRemoveCoupon = (req, res) => {
  req.session.activeCoupon = null;
  req.session.flash = { type: 'info', message: 'Cupón de descuento removido.' };
  const redirectUrl = req.query.redirect_to === 'checkout' ? '/index.php?action=checkout' : '/index.php?action=cart';
  res.redirect(redirectUrl);
};

const handleToggleWishlist = (req, res) => {
  const productId = parseInt(req.query.id || req.body.product_id, 10);
  if (productId) {
    const list = req.session.wishlist || [];
    const index = list.indexOf(productId);
    if (index > -1) {
      list.splice(index, 1);
      req.session.flash = { type: 'info', message: 'Producto removido de tu lista de favoritos.' };
    } else {
      list.push(productId);
      req.session.flash = { type: 'success', message: '¡Producto guardado en tus favoritos!' };
    }
    req.session.wishlist = list;
  }

  const referer = req.headers.referer || '/index.php';
  res.redirect(referer);
};

const handleWishlistView = (req, res) => {
  const wishlistIds = req.session.wishlist || [];
  const products = wishlistIds
    .map(id => req.session.products[id])
    .filter(Boolean);

  res.render('wishlist', {
    title: `Mis Favoritos - ${req.session.config.store_name}`,
    products
  });
};

const handleCheckout = (req, res) => {
  const shippingType = req.query.shipping || req.body.shipping || 'standard';
  const details = calculateCartTotals(req, shippingType);
  if (!details.items.length) {
    req.session.flash = { type: 'error', message: 'Tu carrito está vacío para proceder al pago.' };
    return res.redirect('/index.php');
  }
  res.render('checkout', {
    title: `Finalizar Compra - ${req.session.config.store_name}`,
    details,
    shippingType
  });
};

const handleProcessCheckout = (req, res) => {
  const shippingType = req.body.shipping_type || 'standard';
  const details = calculateCartTotals(req, shippingType);

  if (!details.items.length) {
    return res.redirect('/index.php');
  }

  const paymentMethod = req.body.payment_method || 'Tarjeta de Crédito/Débito';

  const customerData = {
    name: `${req.body.name || ''} ${req.body.lastname || ''}`.trim(),
    email: req.body.email || '',
    phone: req.body.phone || '',
    address: `${req.body.address || ''}, ${req.body.city || ''}, ${req.body.state || ''}, C.P. ${req.body.zip || ''}`,
    notes: req.body.notes || ''
  };

  const orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const trackingNumber = 'COL-' + Math.floor(10000000 + Math.random() * 90000000);
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

  // Reduce inventory stock
  details.items.forEach(item => {
    if (req.session.products[item.product.id]) {
      const curStock = req.session.products[item.product.id].stock || 10;
      req.session.products[item.product.id].stock = Math.max(0, curStock - item.quantity);
      defaultProducts[item.product.id].stock = req.session.products[item.product.id].stock;
    }
  });

  const order = {
    id: orderId,
    date: dateStr,
    status: 'Confirmado',
    trackingNumber,
    paymentMethod,
    shippingMethod: shippingType === 'express' ? 'Express Prioritario (24-48 hrs)' : 'Estándar Seguro (3-5 días)',
    customer: customerData,
    items: details.items,
    subtotal: details.subtotal,
    discountAmount: details.discountAmount,
    couponCode: details.coupon ? details.coupon.code : null,
    tax: details.tax,
    shipping: details.shipping,
    total: details.final_total
  };

  req.session.orders[orderId] = order;
  globalOrders[orderId] = order;
  
  // Clear cart and active coupon
  req.session.cart = {};
  req.session.activeCoupon = null;

  req.session.flash = {
    type: 'success',
    message: `¡Felicitaciones! Tu orden #${order.id} fue procesada con éxito.`
  };

  res.redirect(`/index.php?action=receipt&id=${order.id}`);
};

const handleReceipt = (req, res) => {
  const id = req.query.id || '';
  const order = req.session.orders[id] || globalOrders[id];

  if (!order) {
    req.session.flash = { type: 'error', message: 'Orden no encontrada.' };
    return res.redirect('/index.php');
  }

  res.render('receipt', {
    title: `Recibo de Compra #${order.id} - ${req.session.config.store_name}`,
    order
  });
};

const handleOrders = (req, res) => {
  const orders = Object.values(req.session.orders || {});
  orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.render('orders', {
    title: `Historial de Compras - ${req.session.config.store_name}`,
    orders
  });
};

const handleAdmin = (req, res) => {
  const products = Object.values(req.session.products || {});
  const orders = Object.values(req.session.orders || {});
  const coupons = Object.values(req.session.coupons || {});
  const editId = parseInt(req.query.edit, 10);
  const editProduct = editId ? req.session.products[editId] || null : null;

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, ord) => sum + (Number(ord.total) || 0), 0);
  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const lowStockProducts = products.filter(p => (p.stock || 0) <= 5);

  res.render('admin', {
    title: `Panel de Control Administrativo - ${req.session.config.store_name}`,
    products,
    orders,
    coupons,
    editProduct,
    config: req.session.config,
    metrics: {
      totalRevenue,
      totalOrders,
      averageTicket,
      lowStockCount: lowStockProducts.length,
      totalProducts: products.length
    }
  });
};

const handleAdminSaveProduct = (req, res) => {
  const data = req.body;
  const existingId = parseInt(data.id, 10);

  const productKeys = Object.keys(req.session.products || {}).map(Number);
  const id = existingId || (productKeys.length > 0 ? Math.max(...productKeys) + 1 : 1);

  const product = {
    id,
    name: data.name || '',
    category: data.category || 'General',
    price: parseFloat(data.price) || 0,
    discount: parseFloat(data.discount) || 0,
    stock: parseInt(data.stock, 10) || 10,
    rating: parseFloat(data.rating) || 4.8,
    reviewsCount: parseInt(data.reviewsCount, 10) || 1,
    badge: data.badge ? data.badge.trim() : '',
    description: data.description || '',
    specs: data.specs || '',
    image: data.image && data.image.trim() !== '' ? data.image.trim() : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    gallery: [
      data.image && data.image.trim() !== '' ? data.image.trim() : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
    ]
  };

  req.session.products[id] = product;
  defaultProducts[id] = product;

  req.session.flash = {
    type: 'success',
    message: existingId ? 'Producto actualizado correctamente.' : 'Nuevo producto creado con éxito.'
  };

  res.redirect('/index.php?action=admin');
};

const handleAdminDeleteProduct = (req, res) => {
  const id = parseInt(req.query.id, 10);
  if (id && req.session.products[id]) {
    const name = req.session.products[id].name;
    delete req.session.products[id];
    delete defaultProducts[id];
    req.session.flash = { type: 'info', message: `Producto "${name}" eliminado del catálogo.` };
  }
  res.redirect('/index.php?action=admin');
};

const handleAdminUpdateOrderStatus = (req, res) => {
  const orderId = req.body.order_id;
  const newStatus = req.body.status;

  if (orderId && req.session.orders[orderId]) {
    req.session.orders[orderId].status = newStatus;
    if (globalOrders[orderId]) {
      globalOrders[orderId].status = newStatus;
    }
    req.session.flash = { type: 'success', message: `Estado de la orden ${orderId} actualizado a "${newStatus}".` };
  }
  res.redirect('/index.php?action=admin');
};

const handleAdminSaveCoupon = (req, res) => {
  const code = (req.body.code || '').trim().toUpperCase();
  const type = req.body.type || 'percent';
  const value = parseFloat(req.body.value) || 10;
  const description = req.body.description || `Descuento de ${value}`;

  if (code) {
    const coupon = { code, type, value, description };
    req.session.coupons[code] = coupon;
    defaultCoupons[code] = coupon;
    req.session.flash = { type: 'success', message: `Cupón ${code} guardado con éxito.` };
  }
  res.redirect('/index.php?action=admin');
};

const handleAdminDeleteCoupon = (req, res) => {
  const code = (req.query.code || '').trim().toUpperCase();
  if (code && req.session.coupons[code]) {
    delete req.session.coupons[code];
    delete defaultCoupons[code];
    req.session.flash = { type: 'info', message: `Cupón ${code} eliminado.` };
  }
  res.redirect('/index.php?action=admin');
};

const handleAdminSaveConfig = (req, res) => {
  const config = {
    store_name: req.body.store_name || 'Tienda Colombia',
    tagline: req.body.tagline || 'Tu destino favorito para tecnología, audio, moda y hogar en Colombia',
    tax: parseFloat(req.body.tax) || 19,
    shipping: parseFloat(req.body.shipping) || 18000.0,
    free_shipping_threshold: parseFloat(req.body.free_shipping_threshold) || 200000.0,
    currency: req.body.currency || 'COP'
  };

  req.session.config = config;
  globalConfig = { ...config };

  req.session.flash = { type: 'success', message: 'Configuración general actualizada.' };
  res.redirect('/index.php?action=admin');
};

// Front Controller Router for PHP-compatible & REST actions
app.all(['/', '/index.php'], (req, res) => {
  const action = req.query.action || (req.body && req.body.action) || 'home';

  switch (action) {
    case 'home':
      return handleHome(req, res);
    case 'product':
      return handleProductDetail(req, res);
    case 'cart':
      return handleViewCart(req, res);
    case 'add-to-cart':
      return handleAddToCart(req, res);
    case 'update-cart':
      return handleUpdateCart(req, res);
    case 'remove-from-cart':
      return handleRemoveFromCart(req, res);
    case 'apply-coupon':
      return handleApplyCoupon(req, res);
    case 'remove-coupon':
      return handleRemoveCoupon(req, res);
    case 'wishlist':
      return handleWishlistView(req, res);
    case 'toggle-wishlist':
      return handleToggleWishlist(req, res);
    case 'checkout':
      return handleCheckout(req, res);
    case 'process-checkout':
      return handleProcessCheckout(req, res);
    case 'receipt':
      return handleReceipt(req, res);
    case 'orders':
      return handleOrders(req, res);
    case 'admin':
      return handleAdmin(req, res);
    case 'admin-save-product':
      return handleAdminSaveProduct(req, res);
    case 'admin-delete-product':
      return handleAdminDeleteProduct(req, res);
    case 'admin-update-order':
      return handleAdminUpdateOrderStatus(req, res);
    case 'admin-save-coupon':
      return handleAdminSaveCoupon(req, res);
    case 'admin-delete-coupon':
      return handleAdminDeleteCoupon(req, res);
    case 'admin-save-config':
      return handleAdminSaveConfig(req, res);
    default:
      res.status(404).send('<h1>404 - Página no encontrada</h1>');
  }
});

// REST-style route aliases
app.get('/catalog', handleHome);
app.get('/product/:id', handleProductDetail);
app.get('/cart', handleViewCart);
app.post('/cart/add', handleAddToCart);
app.post('/cart/update', handleUpdateCart);
app.get('/cart/remove', handleRemoveFromCart);
app.post('/coupon/apply', handleApplyCoupon);
app.get('/coupon/remove', handleRemoveCoupon);
app.get('/wishlist', handleWishlistView);
app.all('/wishlist/toggle', handleToggleWishlist);
app.get('/checkout', handleCheckout);
app.post('/checkout/process', handleProcessCheckout);
app.get('/receipt', handleReceipt);
app.get('/orders', handleOrders);
app.get('/admin', handleAdmin);
app.post('/admin/product/save', handleAdminSaveProduct);
app.get('/admin/product/delete', handleAdminDeleteProduct);
app.post('/admin/order/status', handleAdminUpdateOrderStatus);
app.post('/admin/coupon/save', handleAdminSaveCoupon);
app.get('/admin/coupon/delete', handleAdminDeleteCoupon);
app.post('/admin/config/save', handleAdminSaveConfig);

// 404 Handler
app.use((req, res) => {
  res.status(404).send('<h1>404 - Página no encontrada</h1><p><a href="/index.php">Volver a la tienda</a></p>');
});

// 500 Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(`<h1>Error del servidor:</h1> <p>${err.message}</p>`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

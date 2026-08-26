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
// Also serve css and js folders directly from root for compatibility
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Session configuration
app.use(
  session({
    secret: 'tienda-mx-secret-key-2026',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  })
);

// Global In-Memory Store & Session Initializer
let defaultProducts = {
  1: {
    id: 1,
    name: 'Laptop Pro 15',
    category: 'Electrónica',
    price: 1200.0,
    discount: 10,
    description: 'Computadora portátil de alto rendimiento.',
    specs: '16GB RAM, 512GB SSD, Intel i7',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60'
  },
  2: {
    id: 2,
    name: 'Smartphone X',
    category: 'Electrónica',
    price: 800.0,
    discount: 0,
    description: 'Teléfono inteligente de última generación.',
    specs: '6.1" Display, 128GB, Cámara 48MP',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60'
  },
  3: {
    id: 3,
    name: 'Silla Ergonómica',
    category: 'Hogar',
    price: 250.0,
    discount: 15,
    description: 'Silla de oficina ajustable y cómoda.',
    specs: 'Soporte lumbar, Malla transpirable',
    image: 'https://images.unsplash.com/photo-1580481077195-c3a9f0a5317b?w=500&auto=format&fit=crop&q=60'
  }
};

let globalConfig = {
  store_name: 'Mi Tienda Online',
  tax: 16,
  shipping: 10.0
};

let globalOrders = {};

// Middleware to inject session state and configuration into views
app.use((req, res, next) => {
  if (!req.session.products) {
    req.session.products = JSON.parse(JSON.stringify(defaultProducts));
  }
  if (!req.session.cart) {
    req.session.cart = {};
  }
  if (!req.session.orders) {
    req.session.orders = JSON.parse(JSON.stringify(globalOrders));
  }
  if (!req.session.config) {
    req.session.config = { ...globalConfig };
  }

  // Calculate cart total quantity for badge
  const cartValues = Object.values(req.session.cart || {});
  const cartCount = cartValues.reduce((sum, qty) => sum + (Number(qty) || 0), 0);

  res.locals.cartCount = cartCount;
  res.locals.config = req.session.config;
  res.locals.session = req.session;
  res.locals.currentYear = new Date().getFullYear();

  next();
});

// Helper Functions
function getProducts(req, category = null, search = null) {
  let products = Object.values(req.session.products || {});

  if (category) {
    products = products.filter(
      p => p.category && p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    const term = search.toLowerCase();
    products = products.filter(
      p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.specs && p.specs.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  }

  return products;
}

function calculateCartTotals(req) {
  const cartItems = req.session.cart || {};
  const products = req.session.products || {};
  const taxRate = Number(req.session.config.tax) || 16;
  const shipping = Number(req.session.config.shipping) || 10.0;

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

  const taxAmount = subtotal * (taxRate / 100);
  const finalTotal = subtotal > 0 ? subtotal + taxAmount + shipping : 0;

  return {
    items,
    subtotal,
    tax: taxAmount,
    shipping,
    final_total: finalTotal
  };
}

// Controller Handlers
const handleHome = (req, res) => {
  const category = req.query.category || null;
  const search = req.query.search || null;

  const products = getProducts(req, category, search);
  const allProducts = Object.values(req.session.products || {});
  const categories = Array.from(
    new Set(allProducts.map(p => p.category).filter(Boolean))
  );

  res.render('catalog', {
    title: req.session.config.store_name,
    products,
    categories,
    search: search || '',
    selectedCategory: category || ''
  });
};

const handleViewCart = (req, res) => {
  const details = calculateCartTotals(req);
  res.render('cart', {
    title: `Carrito - ${req.session.config.store_name}`,
    details
  });
};

const handleAddToCart = (req, res) => {
  const productId = parseInt(req.body.product_id, 10);
  if (productId && req.session.products[productId]) {
    req.session.cart[productId] = (req.session.cart[productId] || 0) + 1;
  }
  res.redirect('/index.php?action=cart');
};

const handleUpdateCart = (req, res) => {
  const productId = parseInt(req.body.product_id, 10);
  const quantity = parseInt(req.body.quantity, 10);
  if (productId) {
    if (quantity <= 0) {
      delete req.session.cart[productId];
    } else {
      req.session.cart[productId] = quantity;
    }
  }
  res.redirect('/index.php?action=cart');
};

const handleRemoveFromCart = (req, res) => {
  const productId = parseInt(req.query.id, 10);
  if (productId && req.session.cart[productId]) {
    delete req.session.cart[productId];
  }
  res.redirect('/index.php?action=cart');
};

const handleCheckout = (req, res) => {
  const details = calculateCartTotals(req);
  if (!details.items.length) {
    return res.redirect('/index.php');
  }
  res.render('checkout', {
    title: `Pago - ${req.session.config.store_name}`,
    details
  });
};

const handleProcessCheckout = (req, res) => {
  const details = calculateCartTotals(req);
  if (!details.items.length) {
    return res.redirect('/index.php');
  }

  const customerData = {
    name: req.body.name || '',
    email: req.body.email || '',
    address: req.body.address || ''
  };

  const orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const order = {
    id: orderId,
    date: dateStr,
    customer: customerData,
    items: details.items,
    total: details.final_total
  };

  req.session.orders[orderId] = order;
  globalOrders[orderId] = order;
  req.session.cart = {};

  res.redirect(`/index.php?action=receipt&id=${order.id}`);
};

const handleReceipt = (req, res) => {
  const id = req.query.id || '';
  const order = req.session.orders[id] || globalOrders[id];

  if (!order) {
    return res.redirect('/index.php');
  }

  res.render('receipt', {
    title: `Recibo de Compra - ${req.session.config.store_name}`,
    order
  });
};

const handleOrders = (req, res) => {
  const orders = Object.values(req.session.orders || {});
  // Sort descending by date
  orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.render('orders', {
    title: `Historial de Compras - ${req.session.config.store_name}`,
    orders
  });
};

const handleAdmin = (req, res) => {
  const products = Object.values(req.session.products || {});
  const editId = parseInt(req.query.edit, 10);
  const editProduct = editId ? req.session.products[editId] || null : null;

  res.render('admin', {
    title: `Panel de Administración - ${req.session.config.store_name}`,
    products,
    editProduct,
    config: req.session.config
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
    category: data.category || '',
    price: parseFloat(data.price) || 0,
    discount: parseFloat(data.discount) || 0,
    description: data.description || '',
    specs: data.specs || '',
    image: data.image && data.image.trim() !== '' ? data.image.trim() : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
  };

  req.session.products[id] = product;
  defaultProducts[id] = product;

  res.redirect('/index.php?action=admin');
};

const handleAdminDeleteProduct = (req, res) => {
  const id = parseInt(req.query.id, 10);
  if (id && req.session.products[id]) {
    delete req.session.products[id];
    delete defaultProducts[id];
  }
  res.redirect('/index.php?action=admin');
};

const handleAdminSaveConfig = (req, res) => {
  const config = {
    store_name: req.body.store_name || 'Mi Tienda Online',
    tax: parseFloat(req.body.tax) || 16,
    shipping: parseFloat(req.body.shipping) || 10.0
  };

  req.session.config = config;
  globalConfig = { ...config };

  res.redirect('/index.php?action=admin');
};

// Front Controller Router for PHP-style index.php requests
app.all(['/', '/index.php'], (req, res) => {
  const action = req.query.action || (req.body && req.body.action) || 'home';

  switch (action) {
    case 'home':
      return handleHome(req, res);
    case 'cart':
      return handleViewCart(req, res);
    case 'add-to-cart':
      return handleAddToCart(req, res);
    case 'update-cart':
      return handleUpdateCart(req, res);
    case 'remove-from-cart':
      return handleRemoveFromCart(req, res);
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
    case 'admin-save-config':
      return handleAdminSaveConfig(req, res);
    default:
      res.status(404).send('<h1>404 - Página no encontrada</h1>');
  }
});

// REST-style route aliases for modern routing
app.get('/catalog', handleHome);
app.get('/cart', handleViewCart);
app.post('/cart/add', handleAddToCart);
app.post('/cart/update', handleUpdateCart);
app.get('/cart/remove', handleRemoveFromCart);
app.get('/checkout', handleCheckout);
app.post('/checkout/process', handleProcessCheckout);
app.get('/receipt', handleReceipt);
app.get('/orders', handleOrders);
app.get('/admin', handleAdmin);
app.post('/admin/product/save', handleAdminSaveProduct);
app.get('/admin/product/delete', handleAdminDeleteProduct);
app.post('/admin/config/save', handleAdminSaveConfig);

// 404 Handler
app.use((req, res) => {
  res.status(404).send('<h1>404 - Página no encontrada</h1>');
});

// 500 Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(`<h1>Error del servidor:</h1> <p>${err.message}</p>`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

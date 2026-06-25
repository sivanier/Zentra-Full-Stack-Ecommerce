import { promises as fs } from 'fs';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcryptjs';

const dataDir = fileURLToPath(new URL('../../../data/', import.meta.url));
const files = {
  products: path.join(dataDir, 'products.json'),
  users: path.join(dataDir, 'users.json'),
  carts: path.join(dataDir, 'carts.json'),
  orders: path.join(dataDir, 'orders.json')
};

const id = () => randomBytes(12).toString('hex');
const now = () => new Date().toISOString();

async function read(collection) {
  try {
    const raw = await fs.readFile(files[collection], 'utf8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function write(collection, records) {
  await fs.writeFile(files[collection], `${JSON.stringify(records, null, 2)}\n`);
  return records;
}

async function list(collection) {
  const records = await read(collection);
  let changed = false;
  const normalized = records.map((record) => {
    const next = { ...record };
    if (!next._id) {
      next._id = id();
      changed = true;
    }
    if (!next.createdAt) {
      next.createdAt = now();
      changed = true;
    }
    if (!next.updatedAt) {
      next.updatedAt = next.createdAt;
      changed = true;
    }
    return next;
  });
  if (changed) await write(collection, normalized);
  return normalized;
}

const safeUser = (user) => user && ({ _id: user._id, name: user.name, email: user.email, role: user.role });

export async function findUserById(userId) {
  return (await list('users')).find((user) => user._id === userId) || null;
}

export async function findUserByEmail(email) {
  return (await list('users')).find((user) => user.email.toLowerCase() === email?.toLowerCase()) || null;
}

export async function createUser({ name, email, password, role = 'user' }) {
  const users = await list('users');
  const user = {
    _id: id(),
    name,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 12),
    role,
    createdAt: now(),
    updatedAt: now()
  };
  users.push(user);
  await write('users', users);
  return user;
}

export async function matchPassword(user, password) {
  if (!user?.password) return false;
  return user.password.startsWith('$2') ? bcrypt.compare(password, user.password) : user.password === password;
}

export async function updateUserPassword(email, password) {
  const users = await list('users');
  const index = users.findIndex((user) => user.email.toLowerCase() === email?.toLowerCase());
  if (index === -1) return null;
  users[index].password = await bcrypt.hash(password, 12);
  users[index].updatedAt = now();
  await write('users', users);
  return users[index];
}

export function publicUser(user) {
  return safeUser(user);
}

export async function getProducts({ category, search } = {}) {
  const term = search?.trim().toLowerCase();
  return (await list('products'))
    .filter((product) => !category || category === 'All' || product.category === category)
    .filter((product) => !term || `${product.title} ${product.description}`.toLowerCase().includes(term))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getCategories() {
  return [...new Set((await list('products')).map((product) => product.category))];
}

export async function getProductById(productId) {
  return (await list('products')).find((product) => product._id === productId) || null;
}

export async function createProduct(payload) {
  const products = await list('products');
  const product = { ...payload, _id: id(), createdAt: now(), updatedAt: now() };
  products.push(product);
  await write('products', products);
  return product;
}

export async function updateProduct(productId, payload) {
  const products = await list('products');
  const index = products.findIndex((product) => product._id === productId);
  if (index === -1) return null;
  products[index] = { ...products[index], ...payload, _id: productId, updatedAt: now() };
  await write('products', products);
  return products[index];
}

export async function deleteProduct(productId) {
  const products = await list('products');
  const next = products.filter((product) => product._id !== productId);
  if (next.length === products.length) return false;
  await write('products', next);
  return true;
}

async function populateCart(cart) {
  const products = await list('products');
  return {
    ...(cart || { items: [] }),
    items: (cart?.items || [])
      .map((item) => ({ ...item, product: products.find((product) => product._id === item.product) }))
      .filter((item) => item.product)
  };
}

export async function getCart(userId) {
  const cart = (await list('carts')).find((item) => item.user === userId);
  return populateCart(cart || { _id: id(), user: userId, items: [] });
}

export async function addToCart(userId, productId, quantity = 1) {
  if (!(await getProductById(productId))) return null;
  const carts = await list('carts');
  let cart = carts.find((item) => item.user === userId);
  if (!cart) {
    cart = { _id: id(), user: userId, items: [], createdAt: now(), updatedAt: now() };
    carts.push(cart);
  }
  const item = cart.items.find((entry) => entry.product === productId);
  if (item) item.quantity += Number(quantity);
  else cart.items.push({ _id: id(), product: productId, quantity: Number(quantity) });
  cart.updatedAt = now();
  await write('carts', carts);
  return getCart(userId);
}

export async function updateCartQuantity(userId, productId, quantity) {
  const carts = await list('carts');
  const cart = carts.find((item) => item.user === userId);
  const cartItem = cart?.items.find((item) => item.product === productId);
  if (!cartItem) return null;
  cart.items = Number(quantity) < 1 ? cart.items.filter((item) => item.product !== productId) : cart.items.map((item) => item.product === productId ? { ...item, quantity: Number(quantity) } : item);
  cart.updatedAt = now();
  await write('carts', carts);
  return getCart(userId);
}

export async function removeFromCart(userId, productId) {
  const carts = await list('carts');
  const cart = carts.find((item) => item.user === userId);
  if (cart) {
    cart.items = cart.items.filter((item) => item.product !== productId);
    cart.updatedAt = now();
    await write('carts', carts);
  }
  return getCart(userId);
}

export async function getOrders(userId) {
  return (await list('orders')).filter((order) => order.user === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function placeOrder(userId) {
  const cart = await getCart(userId);
  if (!cart.items.length) return null;
  const orders = await list('orders');
  const items = cart.items.map(({ product, quantity }) => ({ product: product._id, title: product.title, image: product.image, price: product.price, quantity }));
  const order = { _id: id(), user: userId, items, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0), status: 'placed', createdAt: now(), updatedAt: now() };
  orders.push(order);
  await write('orders', orders);

  const carts = await list('carts');
  const storedCart = carts.find((item) => item.user === userId);
  if (storedCart) {
    storedCart.items = [];
    storedCart.updatedAt = now();
    await write('carts', carts);
  }
  return order;
}

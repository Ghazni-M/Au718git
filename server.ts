import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { randomUUID, randomBytes } from 'crypto';
import { MongoClient, Db } from 'mongodb';
import nodemailer from 'nodemailer';
import 'dotenv/config';   


// ====================== TYPE EXTENSION ======================
declare global {
  namespace Express {
    interface Request {
      authUser?: { uid: string; email: string };
    }
  }
}
// ===========================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), 'db.json');

const SALT_ROUNDS = 10;
const BOOTSTRAP_ADMIN_EMAIL = 'admin@au718.com';

const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET is not set. Using random secret — sessions reset on restart.');
}
const JWT_EXPIRES_IN = '7d';
const SESSION_COOKIE = 'au718_session';
const isProduction = process.env.NODE_ENV === 'production';

const PUBLIC_COLLECTIONS = ['products', 'categories', 'inquiries', 'subscribers', 'campaigns', 'newsletters', 'performance_metrics'];

const DEFAULT_CATEGORIES = [
  "Investment Bars", "Chains", "Rings", "Necklaces", "Pendants",
  "Earrings", "Watches", "Bracelets", "Custom Pieces"
];


function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}


// ====================== DATABASE HELPERS ======================
function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      return { products: [], categories: [], inquiries: [], subscribers: [], campaigns: [], newsletters: [], admin_roles: [], admins: [], users: [], performance_metrics: [] };
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local db:', err);
    return { products: [], categories: [], inquiries: [], subscribers: [], campaigns: [], newsletters: [], admin_roles: [], admins: [], users: [], performance_metrics: [] };
  }
}

function writeDb(data: any) {
  try {
    const tmpPath = `${dbPath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpPath, dbPath);
  } catch (err) {
    console.error('Error writing local db:', err);
  }
}

// ====================== SEEDING ======================
async function seedDefaultCategories() {
  try {
    const existing = await listDocuments('categories');
    if (existing.length === 0) {
      console.log('🌱 Seeding default categories...');
      for (const name of DEFAULT_CATEGORIES) {
        await createDocument('categories', { name, slug: name.toLowerCase().replace(/\s+/g, '-') });
      }
      console.log(`✅ Seeded ${DEFAULT_CATEGORIES.length} default categories`);
    }
  } catch (err) {
    console.error('Failed to seed default categories:', err);
  }
}

// ====================== MONGODB ======================
let mongoDb: Db | null = null;
let mongoClient: MongoClient | null = null;
let isMongoConnected = false;
let mongoConnectionError = '';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function connectToMongo() {
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not set. Using local file fallback.');
    mongoConnectionError = 'MONGODB_URI is not set.';
    return;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    mongoClient = new MongoClient(MONGODB_URI, { connectTimeoutMS: 8000, serverSelectionTimeoutMS: 8000 });
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    isMongoConnected = true;
    mongoConnectionError = '';
    console.log('✅ MongoDB connected successfully!');
    await seedMongoFromLocal();
    await seedDefaultCategories();
  } catch (err: any) {
    isMongoConnected = false;
    mongoConnectionError = err.message || String(err);
    console.error('❌ MongoDB connection failed:', err);
  }
}

async function seedMongoFromLocal() {
  if (!mongoDb) return;
  try {
    const productsCount = await mongoDb.collection('products').countDocuments();
    if (productsCount === 0) {
      console.log('🌱 Seeding MongoDB from local db.json...');
      const dbData = readDb();
      for (const [col, items] of Object.entries(dbData)) {
        if (Array.isArray(items) && items.length > 0) {
          await mongoDb.collection(col).insertMany(items);
          console.log(`Seeded ${items.length} documents into ${col}`);
        }
      }
    }
  } catch (err) {
    console.error('MongoDB seeding error:', err);
  }
}

// ====================== CRUD ======================
async function listDocuments(collectionName: string, filters: any[] = [], sorts: any[] = [], limitVal?: number) {
  try {
    if (mongoDb) {
      const mongoFilter: Record<string, any> = {};
      filters.forEach((filter) => {
        if (filter.type === 'where') {
          const { field, op, value } = filter;
          if (typeof field !== 'string' || field.startsWith('$') || field.includes('.') || field === '__proto__') return;
          if (op === '==' || op === '===') mongoFilter[field] = value;
          else if (op === '!=' || op === '!==') mongoFilter[field] = { $ne: value };
        }
      });

      let cursor = mongoDb.collection(collectionName).find(mongoFilter);

      if (sorts.length > 0) {
        const mongoSort: Record<string, 1 | -1> = {};
        sorts.forEach((sort) => {
          if (sort.type === 'orderBy') {
            const { field, direction } = sort;
            mongoSort[field] = direction === 'desc' ? -1 : 1;
          }
        });
        cursor = cursor.sort(mongoSort);
      }
      if (limitVal !== undefined) cursor = cursor.limit(limitVal);

      const results = await cursor.toArray();

      return results.map(({ _id, ...rest }) => ({
        ...rest,
        id: rest.id || (_id ? _id.toString() : undefined),
        _id: _id ? _id.toString() : undefined
      }));
    }

    const dbData = readDb();
    if (!dbData[collectionName]) return [];
    
    let items = [...dbData[collectionName]];

    filters.forEach((constraint) => {
      const { field, op, value } = constraint;
      items = items.filter((item: any) => {
        const itemVal = item[field];
        if (op === '==' || op === '===') return itemVal === value;
        if (op === '!=' || op === '!==') return itemVal !== value;
        return true;
      });
    });

    sorts.forEach((constraint) => {
      const { field, direction } = constraint;
      items.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA < valB) return direction === 'desc' ? 1 : -1;
        if (valA > valB) return direction === 'desc' ? -1 : 1;
        return 0;
      });
    });

    if (limitVal !== undefined) items = items.slice(0, limitVal);
    return items;
  } catch (err) {
    console.error(`listDocuments(${collectionName}) error:`, err);
    return [];
  }
}


async function getDocument(collectionName: string, id: string) {
  if (mongoDb) {
    try {
      const doc = await mongoDb.collection(collectionName).findOne({ id });
      if (doc) {
        const { _id, ...rest } = doc;
        return rest;
      }
      return null;
    } catch (err) {
      console.error(`MongoDB get error on ${collectionName}/${id}:`, err);
    }
  }
  const dbData = readDb();
  if (!dbData[collectionName]) return null;
  return dbData[collectionName].find((doc: any) => String(doc.id) === String(id)) || null;
}

async function createDocument(collectionName: string, data: any) {
  const id = data.id || randomUUID();
  const newItem = { ...data, id, createdAt: data.createdAt || new Date().toISOString() };

  if (mongoDb) {
    try {
      await mongoDb.collection(collectionName).insertOne(newItem);
      return newItem;
    } catch (err) {
      console.error(`MongoDB insert error on ${collectionName}:`, err);
    }
  }

  const dbData = readDb();
  if (!dbData[collectionName]) dbData[collectionName] = [];
  dbData[collectionName].push(newItem);
  writeDb(dbData);
  return newItem;
}

async function setDocument(collectionName: string, id: string, data: any) {
  const newItem = { ...data, id };
  if (mongoDb) {
    try {
      await mongoDb.collection(collectionName).replaceOne({ id }, newItem, { upsert: true });
      return newItem;
    } catch (err) {
      console.error(`MongoDB upsert error:`, err);
    }
  }
  const dbData = readDb();
  if (!dbData[collectionName]) dbData[collectionName] = [];
  const index = dbData[collectionName].findIndex((doc: any) => String(doc.id) === String(id));
  if (index === -1) dbData[collectionName].push(newItem);
  else dbData[collectionName][index] = newItem;
  writeDb(dbData);
  return newItem;
}

async function updateDocument(collectionName: string, id: string, data: any) {
  const { id: _ignored, ...safeData } = data;
  if (mongoDb) {
    try {
      const result = await mongoDb.collection(collectionName).findOneAndUpdate(
        { id }, { $set: safeData }, { returnDocument: 'after' }
      );
      // Driver v3/v4 return { value: doc }; v5+ return the document directly.
      const updated = (result && typeof result === 'object' && 'value' in result) ? (result as any).value : result;
      if (updated) {
        const { _id, ...rest } = updated;
        return rest;
      }
      return null;
    } catch (err) {
      console.error(`MongoDB update error:`, err);
    }
  }
  const dbData = readDb();
  if (!dbData[collectionName]) return null;
  const index = dbData[collectionName].findIndex((doc: any) => String(doc.id) === String(id));
  if (index === -1) return null;
  dbData[collectionName][index] = { ...dbData[collectionName][index], ...safeData, id };
  writeDb(dbData);
  return dbData[collectionName][index];
}

async function deleteDocument(collectionName: string, id: string) {
  if (mongoDb) {
    try {
      await mongoDb.collection(collectionName).deleteOne({ id });
      return true;
    } catch (err) {
      console.error(`MongoDB delete error:`, err);
    }
  }
  const dbData = readDb();
  if (!dbData[collectionName]) return false;
  dbData[collectionName] = dbData[collectionName].filter((doc: any) => String(doc.id) !== String(id));
  writeDb(dbData);
  return true;
}

// ====================== AUTH HELPERS ======================
async function getAdminRole(email: string): Promise<string | null> {
  try {
    const admins = await listDocuments('admins', [{ type: 'where', field: 'email', op: '==', value: email }]);
    if (admins.length > 0) return admins[0].role || 'Admin';

    const adminRoles = await listDocuments('admin_roles', [{ type: 'where', field: 'email', op: '==', value: email }]);
    if (adminRoles.length > 0) return adminRoles[0].role || 'Admin';

    return null;
  } catch (err) {
    console.error('Error in getAdminRole:', err);
    return null;
  }
}

interface AuthedRequest extends express.Request {
  authUser?: { uid: string; email: string };
}

function requireAuth(req: AuthedRequest, res: express.Response, next: express.NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { uid: string; email: string };
    req.authUser = { uid: payload.uid, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired, please sign in again' });
  }
}

async function requireAdmin(req: AuthedRequest, res: express.Response, next: express.NextFunction) {
  if (!req.authUser) return res.status(401).json({ error: 'Not signed in' });
  try {
    const role = await getAdminRole(req.authUser.email);
    if (!role) return res.status(403).json({ error: 'Admin access required' });
    next();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error verifying admin access' });
  }
}

// ====================== PERFORMANCE METRICS ======================
async function savePerformanceMetric(metric: any) {
  const record = {
    ...metric,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  // Try MongoDB first
  if (mongoDb) {
    try {
      await mongoDb.collection('performance_metrics').insertOne(record);
      console.log(`[RUM] Saved to MongoDB: ${metric.name}`);
      return;
    } catch (err) {
      console.error('MongoDB performance metric save error:', err);
      // Continue to fallback
    }
  }

  // Local JSON fallback with better error handling
  try {
    const dbData = readDb();
    if (!dbData.performance_metrics) dbData.performance_metrics = [];

    dbData.performance_metrics.push(record);

    // Keep size under control
    if (dbData.performance_metrics.length > 5000) {
      dbData.performance_metrics = dbData.performance_metrics.slice(-4000);
    }

    writeDb(dbData);
    console.log(`[RUM] Saved to local db.json: ${metric.name}`);
  } catch (err: any) {
    console.error('Local performance metric save failed:', err.message);
    // Don't throw — we don't want this to break the whole request
  }
}

// ====================== EXPRESS SERVER ======================
async function startServer() {
  await connectToMongo();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());


   // ====================== ROOT ROUTE (FIXED) ======================
  app.get("/", (req, res) => {
    res.send(`
      <h1>🚀 AU718 Gold Backend</h1>
      <p><strong>Server is running successfully on Railway!</strong></p>
      <p>Time: ${new Date().toISOString()}</p>
      <hr>
      <p><a href="/api/db-status">→ Check Database Status</a></p>
      <p><a href="/api/newsletter/subscribers">→ View Subscribers</a></p>
    `);
  });

  // Debug middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`📡 ${req.method} ${req.path}`);
    }
    next();
  });

  console.log("🚀 Registering API routes...");


  // Upload
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination: uploadDir,
      filename: (_, file, cb) => cb(null, `file-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
      cb(null, allowed.includes(file.mimetype));
    }
  });

  

// ====================== NEWSLETTER ROUTES ======================
  app.get('/api/newsletter/subscribers', async (req, res) => {
    console.log("GET /api/newsletter/subscribers called");
    try {
      const subscribers = await listDocuments('subscribers');
      res.json(subscribers);
    } catch (err) {
      console.error("GET subscribers error:", err);
      res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
  });

  app.post('/api/newsletter/subscribers', async (req, res) => {
    console.log("POST /api/newsletter/subscribers called with body:", req.body);
    try {
      const { email } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' });
      }

      const cleanEmail = email.toLowerCase().trim();

      const existing = await listDocuments('subscribers', [
        { type: 'where', field: 'email', op: '==', value: cleanEmail }
      ]);

      if (existing.length > 0) {
        return res.status(409).json({ error: 'already_subscribed' });
      }

      const subscriber = await createDocument('subscribers', {
        email: cleanEmail,
        timestamp: new Date().toISOString(),
        status: 'active'
      });

      console.log("Subscriber created successfully");
      res.json({ success: true, subscriber });
    } catch (err) {
      console.error("POST subscribers error:", err);
      res.status(500).json({ error: 'Subscription failed' });
    }
  });

  app.delete('/api/newsletter/subscribers/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ DELETE /api/newsletter/subscribers/${id} called`);

  try {
    const success = await deleteDocument('subscribers', id);
    if (success) {
      console.log("✅ Subscriber deleted");
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Subscriber not found' });
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

// ====================== NEWSLETTER SEND ======================
  app.post('/api/newsletter/send', async (req, res) => {
  console.log("📤 [SEND NEWSLETTER] Request received");

  try {
    const { subject, content, imageUrl } = req.body;

    if (!subject?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Subject and content are required' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      return res.status(500).json({ error: 'Email credentials not configured on server' });
    }

    const subscribers = await listDocuments('subscribers');
    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No subscribers found' });
    }

    const campaign = await createDocument('campaigns', {
      subject: subject.trim(),
      content: content.trim(),
      imageUrl: imageUrl || null,
      sentAt: new Date().toISOString(),
      recipientCount: subscribers.length
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    let sentCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < subscribers.length; i++) {
      const sub = subscribers[i];
      try {
        await transporter.sendMail({
          from: `"AU718 Gold" <${process.env.EMAIL_USER}>`,
          to: sub.email,
          subject: subject.trim(),
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <!-- Image display encouragement -->
              <p style="font-size: 13px; color: #666; text-align: center; margin-bottom: 15px;">
                📧 If images don't load, click <strong>"Display images"</strong> above.
              </p>

              ${imageUrl ? `
                <img 
                  src="${imageUrl}" 
                  alt="AU718 Gold Newsletter" 
                  style="width:100%; max-width:600px; border-radius:12px; margin-bottom:25px; display:block;" 
                  width="600"
                />
              ` : ''}

              <h1 style="color: #D4AF37; text-align: center;">${subject}</h1>
              <div style="line-height: 1.7; color: #333; font-size: 16px;">
                ${content}
              </div>
              <hr style="margin: 30px 0; border-color: #ddd;">
              <p style="color: #888; text-align: center; font-size: 13px;">
                AU718 Gold Store • Premium Gold Jewelry<br>
                <a href="https://au718.netlify.app" style="color: #D4AF37;">Visit Store</a>
              </p>
            </div>
          `
        });

        sentCount++;
        console.log(`✅ Sent ${i + 1}/${subscribers.length} to ${sub.email}`);

        if (i < subscribers.length - 1) {
          await new Promise(r => setTimeout(r, 800)); // Increased delay
        }
      } catch (emailErr: any) {
        errors.push(sub.email);
        console.error(`Failed to send to ${sub.email}:`, emailErr.message);
      }
    }

    res.json({ 
      success: true, 
      sentCount,
      totalSubscribers: subscribers.length,
      failed: errors.length,
      campaign 
    });

  } catch (err: any) {
    console.error("Send campaign error:", err);
    res.status(500).json({ 
      error: 'Failed to send newsletter', 
      details: err.message 
    });
  }
});

  app.get('/api/newsletter/campaigns', async (req, res) => {
    try {
      const campaigns = await listDocuments('campaigns', [], [{ type: 'orderBy', field: 'sentAt', direction: 'desc' }]);
      res.json(campaigns);
    } catch (err) {
      console.error("GET campaigns error:", err);
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  });  

    // ====================== DELETE CAMPAIGN ======================
  app.delete('/api/newsletter/campaigns/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`🗑️ DELETE /api/newsletter/campaigns/${id} called`);

    try {
      const success = await deleteDocument('campaigns', id);
      
      if (success) {
        console.log("✅ Campaign deleted successfully");
        res.json({ success: true, message: "Campaign deleted" });
      } else {
        res.status(404).json({ error: 'Campaign not found' });
      }
    } catch (err) {
      console.error("Delete campaign error:", err);
      res.status(500).json({ error: 'Failed to delete campaign' });
    }
  });
  

  app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const url = `/uploads/${req.file.filename}`;
  console.log(`📸 Image uploaded: ${url}`);

  res.json({ url });
});

  app.get('/api/db-status', (req, res) => {
    res.json({
      connected: isMongoConnected,
      error: mongoConnectionError,
      uriDefined: !!MONGODB_URI,
      fallbackActive: !isMongoConnected
    });
  });

  // Performance Metrics
    app.post('/api/performance', async (req, res) => {
    try {
      const metric = req.body;
      if (!metric || !metric.name || typeof metric.value !== 'number') {
        return res.status(400).json({ error: 'Invalid performance metric' });
      }
      await savePerformanceMetric(metric);
      res.status(201).json({ success: true });
    } catch (err: any) {
      console.error('Performance error:', err);
      res.status(500).json({ error: 'Failed to record performance metric' });
    }
  });

  // Inquiry Traffic
  app.get('/api/dashboard/inquiry-traffic', async (req, res) => {
    try {
      const inquiries = await listDocuments('inquiries');
      const last7Days = new Array(7).fill(0).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const trafficData = last7Days.map(date => {
        const count = inquiries.filter((inq: any) => {
          const inqDate = inq.createdAt ? inq.createdAt.split('T')[0] : '';
          return inqDate === date;
        }).length;
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        return { name: dayName, value: count, date };
      });

      res.json(trafficData);
    } catch (error: any) {
      console.error('Inquiry traffic error:', error);
      res.status(500).json({ error: 'Failed to fetch inquiry traffic' });
    }
  });

  // Dashboard Stats
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const products = await listDocuments('products');
      const inquiries = await listDocuments('inquiries', [], [{ type: 'orderBy', field: 'createdAt', direction: 'desc' }], 5);
      const categories = await listDocuments('categories');
      const adminRoles = await listDocuments('admin_roles');
      const admins = await listDocuments('admins');

      const activeListings = products.filter((p: any) => p.status === 'published').length;

      res.json({
        stats: {
          products: products.length,
          inquiries: inquiries.length,
          categories: categories.length,
          activeListings,
          admins: adminRoles.length + admins.length + 1
        },
        recentInquiries: inquiries,
        dbStatus: {
          connected: isMongoConnected,
          uriDefined: !!MONGODB_URI,
          fallbackActive: !isMongoConnected
        }
      });
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  // Products & Categories
  app.get('/api/products', async (req, res) => {
    try {
      const filters: any[] = [];
      if (typeof req.query.status === 'string') {
        filters.push({ type: 'where', field: 'status', op: '==', value: req.query.status });
      }
      let limitVal: number | undefined;
      if (typeof req.query.limit === 'string') {
        const parsed = Number(req.query.limit);
        if (!Number.isNaN(parsed) && parsed > 0) limitVal = parsed;
      }
      const products = await listDocuments('products', filters, [], limitVal);
      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error listing products' });
    }
  });

  app.post('/api/products', requireAuth, requireAdmin, async (req, res) => {
    try {
      const newProduct = await createDocument('products', req.body);
      res.json(newProduct);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error creating product' });
    }
  });

 app.get('/api/categories', async (req, res) => {
    try {
      const categories = await listDocuments('categories');
      const cleanCategories = categories.map((c: any) => ({
        id: c.id || c._id,
        name: c.name || c.title || String(c)
      }));
      res.json(cleanCategories);
    } catch (err: any) {
      console.error('Categories fetch error:', err);
      res.status(500).json({ error: err.message || 'Error listing categories' });
    }
  });

  app.post('/api/categories', requireAuth, requireAdmin, async (req, res) => {
    try {
      const newCategory = await createDocument('categories', req.body);
      res.json(newCategory);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error creating category' });
    }
  });

  // Generic DB routes
 function requirePublicCollection(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!PUBLIC_COLLECTIONS.includes(req.params.collection)) {
      return res.status(403).json({ error: 'This collection is not accessible via the generic API' });
    }
    next();
  }

  app.get('/api/db/:collection', requirePublicCollection, async (req, res) => {
    const { collection } = req.params;

    const filters: any[] = [];
    const sorts: any[] = [];
    let limitVal: number | undefined = undefined;

    const queryKeys = Object.keys(req.query).filter(k => k.startsWith('c_'));

    for (const k of queryKeys) {
      try {
        const constraint = JSON.parse(req.query[k] as string);
        if (constraint.type === 'where') {
          filters.push(constraint);
        } else if (constraint.type === 'orderBy') {
          sorts.push(constraint);
        } else if (constraint.type === 'limit') {
          limitVal = constraint.num;
        }
      } catch (e) {
        console.error('Error parsing constraint:', e);
      }
    }

    try {
      const items = await listDocuments(collection, filters, sorts, limitVal);
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error listing documents' });
    }
  });

  app.get('/api/db/:collection/:id', requirePublicCollection, async (req, res) => {
    const { collection, id } = req.params;
    try {
      const item = await getDocument(collection, id);
      if (!item) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error getting document' });
    }
  });

  app.post('/api/db/:collection', requirePublicCollection, async (req, res) => {
    const { collection } = req.params;
    try {
      const newItem = await createDocument(collection, req.body);
      res.json(newItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error creating document' });
    }
  });

  app.put('/api/db/:collection/:id', requirePublicCollection, async (req, res) => {
    const { collection, id } = req.params;
    try {
      const newItem = await setDocument(collection, id, req.body);
      res.json(newItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error setting document' });
    }
  });

  app.patch('/api/db/:collection/:id', requirePublicCollection, async (req, res) => {
    const { collection, id } = req.params;
    try {
      const updatedItem = await updateDocument(collection, id, req.body);
      if (!updatedItem) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json(updatedItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error updating document' });
    }
  });

  app.delete('/api/db/:collection/:id', requirePublicCollection, async (req, res) => {
    const { collection, id } = req.params;
    try {
      const success = await deleteDocument(collection, id);
      if (!success) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error deleting document' });
    }
  });


  // ====================== UPDATE PROFILE ROUTE ======================
   
  app.patch('/api/auth/update-profile', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { displayName } = req.body;

    if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    const users = await listDocuments('users', [
      { type: 'where', field: 'email', op: '==', value: req.authUser!.email }
    ]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await updateDocument('users', users[0].id || users[0].uid, {
      displayName: displayName.trim()
    });

    res.json({ 
      success: true, 
      message: "Profile updated successfully",
      user: updated 
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update Password
app.post('/api/auth/update-password', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    const users = await listDocuments('users', [
      { type: 'where', field: 'email', op: '==', value: req.authUser!.email }
    ]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash || '');
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await updateDocument('users', user.id || user.uid, { passwordHash });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err: any) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

  // ====================== AUTH ======================

 // ====================== AUTH ROUTES ======================

  app.post('/api/auth/signup', async (req, res) => {
    const { email: rawEmail, password } = req.body;
    if (!rawEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const email = normalizeEmail(rawEmail);

    try {
      const existing = await listDocuments('users', [{ type: 'where', field: 'email', op: '==', value: email }]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const uid = `uid-${randomUUID()}`;

      const newUser = await createDocument('users', { 
        uid, 
        email, 
        passwordHash 
      });

      // Auto admin for bootstrap email
      if (email === BOOTSTRAP_ADMIN_EMAIL) {
        await createDocument('admins', {
          id: uid,
          email,
          role: 'Admin',
          addedAt: new Date().toISOString()
        });
      }

      const role = await getAdminRole(email);
      const token = jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      res.json({ uid, email, isAdmin: !!role, role });
    } catch (err: any) {
      console.error('Signup error:', err);
      res.status(500).json({ error: 'Signup failed', details: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email: rawEmail, password } = req.body;
    if (!rawEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const email = normalizeEmail(rawEmail);

    try {
      const users = await listDocuments('users', [{ type: 'where', field: 'email', op: '==', value: email }]);
      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];
      const passwordValid = await bcrypt.compare(password, user.passwordHash || '');

      if (!passwordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const uid = user.uid || user.id;
      const role = await getAdminRole(email);
      const token = jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      res.json({ uid, email, isAdmin: !!role, role });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed', details: err.message });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req: AuthedRequest, res) => {
    try {
      const { uid, email } = req.authUser!;
      const role = await getAdminRole(email);
      res.json({ uid, email, isAdmin: !!role, role });
    } catch (err: any) {
      console.error('Me route error:', err);
      res.status(500).json({ error: 'Failed to fetch session' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ success: true });
  });

  // ====================== ADMIN USERS MANAGEMENT ======================
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const admins = await listDocuments('admins');
    const adminRoles = await listDocuments('admin_roles');
    
    const combined = [...admins, ...adminRoles];
    res.json(combined);
  } catch (err: any) {
    console.error('Admin users fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch admin users' });
  }
});

app.post('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    const cleanEmail = normalizeEmail(email);

    const existing = await listDocuments('admins', [
      { type: 'where', field: 'email', op: '==', value: cleanEmail }
    ]);

    if (existing.length > 0) {
      return res.status(409).json({ error: 'User is already an admin' });
    }

    const newAdmin = await createDocument('admins', {
      email: cleanEmail,
      role,
      addedAt: new Date().toISOString(),
      addedBy: req.authUser?.email
    });

    res.json({ success: true, admin: newAdmin });
  } catch (err: any) {
    console.error('Add admin error:', err);
    res.status(500).json({ error: 'Failed to add admin' });
  }
});

app.delete('/api/admin/users/:email', requireAuth, requireAdmin, async (req, res) => {
  const { email } = req.params;
  const cleanEmail = normalizeEmail(decodeURIComponent(email));

  try {
    // Try deleting from both collections
    await deleteDocument('admins', cleanEmail);
    await deleteDocument('admin_roles', cleanEmail);

    res.json({ success: true });
  } catch (err: any) {
    console.error('Delete admin error:', err);
    res.status(500).json({ error: 'Failed to revoke admin access' });
  }
});

  
 // Error handling for multer — must be registered after all routes that use
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large (max 10MB)' });
      }
      return res.status(400).json({ error: err.message });
    }
    next(err);
  });

  // Serve uploads
  // ====================== STATIC & ERROR HANDLING ======================
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  });

  // ====================== VITE MIDDLEWARE (LAST) ======================
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Vite middleware mode activated");
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // ====================== START LISTENING ======================
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(" Registering API routes...");
 });

  const shutdown = async () => {
    server.close();
    if (mongoClient) await mongoClient.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch(console.error);
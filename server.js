import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsers - support both application/json and text/plain (sent by frontend)
app.use(express.json());
app.use(express.text({ type: '*/*' }));
app.use((req, res, next) => {
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // not valid JSON string, leave as string
    }
  }
  next();
});

// Seed data
const settings = {
  PRODUCT_NAME: 'প্রিমিয়াম কোয়ালিটি প্রোডাক্ট',
  ORIGINAL_PRICE: 1500,
  SALE_PRICE: 999,
  INSIDE_DHAKA_DELIVERY: 80,
  OUTSIDE_DHAKA_DELIVERY: 120,
  WHATSAPP_NUMBER: '8801700000000'
};

const reviews = [
  {
    name: 'তানভীর আহমেদ',
    rating: 5,
    review: 'অসাধারণ কোয়ালিটি! ডেলিভারিও খুব দ্রুত পেয়েছি। ধন্যবাদ স্টোরকে।',
    image: ''
  },
  {
    name: 'সুমাইয়া আক্তার',
    rating: 5,
    review: 'পণ্যটি যেমন ছবিতে দেখেছিলাম ঠিক তেমনই। ক্যাশ অন ডেলিভারিতে চেক করে নিতে পেরেছি।',
    image: ''
  },
  {
    name: 'রাকিবুল হাসান',
    rating: 4,
    review: 'দাম অনুযায়ী মান বেশ ভালো। প্যাকেজিংও সুন্দর ছিল।',
    image: ''
  }
];

const faqs = [
  {
    question: 'ডেলিভারি চার্জ কত?',
    answer: 'ঢাকার ভেতরে ডেলিভারি চার্জ ৮০ টাকা এবং ঢাকার বাইরে ১২০ টাকা।'
  },
  {
    question: 'পণ্য কীভাবে হাতে পাব?',
    answer: 'আমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery) সার্ভিসের মাধ্যমে পণ্য ডেলিভারি করি। পণ্য হাতে পেয়ে মূল্য পরিশোধ করবেন।'
  },
  {
    question: 'ডেলিভারি পেতে কতদিন সময় লাগবে?',
    answer: 'ঢাকার মধ্যে ১-২ কার্যদিবস এবং ঢাকার বাইরে ২-৪ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।'
  },
  {
    question: 'কোনো সমস্যা হলে পণ্য ফেরত দেওয়া যাবে কি?',
    answer: 'হ্যাঁ, পণ্য গ্রহণের সময় কোনো ত্রুটি থাকলে ডেলিভারি ম্যানের সামনেই রিটার্ন করতে পারবেন অথবা আমাদের কাস্টমার কেয়ারে যোগাযোগ করতে পারেন।'
  }
];

let orderCounter = 1;
const orders = [
  {
    id: 'SP-20260925-000001',
    createdAt: '2026-09-25 14:20:00',
    name: 'মোহাম্মদ করিম',
    phone: '01712345678',
    division: 'ঢাকা',
    district: 'ঢাকা',
    upazila: 'ধানমন্ডি',
    address: 'রোড ৪/এ, বাড়ি ১২, ধানমন্ডি, ঢাকা',
    product: 'প্রিমিয়াম কোয়ালিটি প্রোডাক্ট',
    variant: 'Standard',
    color: 'Black',
    size: 'M',
    quantity: 1,
    unitPrice: 999,
    subtotal: 999,
    discount: 0,
    delivery: 80,
    total: 1079,
    status: 'Confirmed',
    note: 'সন্ধ্যার পরে ডেলিভারি দিলে ভালো হয়',
    clientRequestId: 'seed-req-1'
  },
  {
    id: 'SP-20260925-000002',
    createdAt: '2026-09-25 16:45:00',
    name: 'তানজিলা বেগম',
    phone: '01898765432',
    division: 'চট্টগ্রাম',
    district: 'চট্টগ্রাম',
    upazila: 'পাঁচলাইশ',
    address: 'প্রবর্তক মোড়, পাঁচলাইশ, চট্টগ্রাম',
    product: 'প্রিমিয়াম কোয়ালিটি প্রোডাক্ট',
    variant: 'Standard',
    color: 'Navy Blue',
    size: 'L',
    quantity: 2,
    unitPrice: 999,
    subtotal: 1998,
    discount: 0,
    delivery: 120,
    total: 2118,
    status: 'Pending',
    note: '',
    clientRequestId: 'seed-req-2'
  }
];

// In-memory active admin sessions
const sessions = new Set();

function clean(x, max = 300) {
  return String(x == null ? '' : x).trim().replace(/[<>]/g, '').slice(0, max);
}

function phone(x) {
  return String(x || '').replace(/[\s-]/g, '').replace(/^\+880/, '0').replace(/^880/, '0');
}

function formatDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  const YYYY = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
}

function generateOrderId() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  orderCounter++;
  return `SP-${dateStr}-${String(orderCounter + orders.length).padStart(6, '0')}`;
}

// Unified API Handler
function handleApi(req, res) {
  const params = req.method === 'GET' ? req.query : (req.body || {});
  const action = params.action;

  // GET or POST handlers
  if (action === 'getSettings') {
    return res.json({ success: true, message: 'OK', data: settings });
  }

  if (action === 'getProduct') {
    return res.json({
      success: true,
      message: 'OK',
      data: {
        name: settings.PRODUCT_NAME,
        salePrice: Number(settings.SALE_PRICE),
        originalPrice: Number(settings.ORIGINAL_PRICE),
        stock: true
      }
    });
  }

  if (action === 'getReviews') {
    return res.json({ success: true, message: 'OK', data: reviews });
  }

  if (action === 'getFaq') {
    return res.json({ success: true, message: 'OK', data: faqs });
  }

  if (action === 'createOrder') {
    try {
      const p = params;
      const c = p.customer || {};
      const pr = p.product || {};
      const clientReqId = clean(p.clientRequestId, 80);

      if (clientReqId && orders.some(o => o.clientRequestId === clientReqId)) {
        return res.json({ success: false, message: 'এই অর্ডারটি ইতোমধ্যে গ্রহণ করা হয়েছে।' });
      }

      const custName = clean(c.name, 80);
      const custPhone = phone(c.phone);
      const custDivision = clean(c.division, 40);
      const custDistrict = clean(c.district, 40);
      const custUpazila = clean(c.upazila, 60);
      const custAddress = clean(c.address, 300);

      if (!custName || !/^01[3-9]\d{8}$/.test(custPhone) || !custDivision || !custDistrict || !custUpazila || !custAddress) {
        return res.json({ success: false, message: 'সকল প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন।' });
      }

      const quantity = Math.max(1, Math.min(10, Number(pr.quantity) || 1));
      const unitPrice = Number(settings.SALE_PRICE) || 999;
      const subtotal = unitPrice * quantity;
      const deliveryCharge = (custDivision === 'ঢাকা' && custDistrict === 'ঢাকা')
        ? Number(settings.INSIDE_DHAKA_DELIVERY || 80)
        : Number(settings.OUTSIDE_DHAKA_DELIVERY || 120);
      const total = subtotal + deliveryCharge;

      const orderId = generateOrderId();
      const newOrder = {
        id: orderId,
        createdAt: formatDate(new Date()),
        name: custName,
        phone: custPhone,
        division: custDivision,
        district: custDistrict,
        upazila: custUpazila,
        address: custAddress,
        product: clean(pr.name || settings.PRODUCT_NAME, 100),
        variant: clean(pr.variant, 50),
        color: clean(pr.color, 40),
        size: clean(pr.size, 30),
        quantity,
        unitPrice,
        subtotal,
        discount: 0,
        delivery: deliveryCharge,
        total,
        status: 'Pending',
        note: clean(p.note, 300),
        clientRequestId: clientReqId
      };

      orders.unshift(newOrder);

      return res.json({
        success: true,
        message: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে',
        data: {
          orderId,
          total
        }
      });
    } catch {
      return res.json({ success: false, message: 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে।' });
    }
  }

  // Admin Actions
  if (action === 'adminLogin') {
    const username = clean(params.username, 80);
    const password = String(params.password || '');
    // Allow login with admin / admin123 or admin / admin
    if (username === 'admin' && (password === 'admin123' || password === 'admin')) {
      const token = crypto.randomUUID();
      sessions.add(token);
      return res.json({
        success: true,
        message: 'OK',
        data: { token, expiresIn: 21600 }
      });
    }
    return res.json({ success: false, message: 'লগইন তথ্য সঠিক নয়।' });
  }

  if (action === 'adminLogout') {
    const token = params.token;
    if (token) sessions.delete(token);
    return res.json({ success: true, message: 'OK', data: { loggedOut: true } });
  }

  // Protected Admin Routes
  const token = params.token;
  if (!token || !sessions.has(token)) {
    return res.json({ success: false, message: 'অনুমতি নেই।' });
  }

  if (action === 'getOrders') {
    return res.json({ success: true, message: 'OK', data: orders });
  }

  if (action === 'getOrder') {
    const target = orders.find(o => o.id === params.id) || null;
    return res.json({ success: true, message: 'OK', data: target });
  }

  if (action === 'updateOrderStatus') {
    const allowed = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    if (!allowed.includes(params.status)) {
      return res.json({ success: false, message: 'অবৈধ স্ট্যাটাস।' });
    }
    const target = orders.find(o => o.id === params.orderId);
    if (!target) {
      return res.json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });
    }
    target.status = params.status;
    return res.json({ success: true, message: 'OK', data: { updated: true } });
  }

  if (action === 'updateAdminNote') {
    const target = orders.find(o => o.id === params.orderId);
    if (!target) {
      return res.json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });
    }
    target.note = clean(params.note, 500);
    return res.json({ success: true, message: 'OK', data: { updated: true } });
  }

  return res.json({ success: false, message: 'অজানা অনুরোধ।' });
}

app.all('/api', handleApi);

// Serve static frontend files
app.use(express.static(__dirname));

// Fallback to index.html for root or SPA navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`E-Commerce Single Product BD server running on http://0.0.0.0:${PORT}`);
});

# نظام إدارة مكتب المحاماة (Lawyer Management System)

تطبيق MERN كامل: React + Vite + TailwindCSS + Framer Motion (Frontend) و Node.js + Express + MongoDB + Mongoose (Backend).

## التشغيل

### 1) Backend
```bash
cd backend
cp .env.example .env   # عدّل القيم
npm install
npm run seed           # (اختياري) بيانات تجريبية + أدمن افتراضي
npm run dev            # http://localhost:5000
```

### 2) Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

### بيانات الأدمن الافتراضية (بعد seed)
- Username: `admin`
- Password: `admin123`

## البنية
- `backend/` — Express API
- `frontend/` — React + Vite + Tailwind (RTL عربي)

## الميزات
- صفحة هبوط فاخرة (أسود/ذهبي)
- بطاقتان: متابعة القضية / حجز استشارة
- تتبع القضية بالحساب أو برقم القضية + كود تتبع
- تايملاين تحديثات + ملفات قابلة للتحميل
- نموذج حجز استشارة
- لوحة أدمن: قضايا، استشارات، رسائل، إعدادات
- JWT + bcrypt + Multer + بنية إيميل جاهزة

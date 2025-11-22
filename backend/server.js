const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Import bcrypt
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_key_123";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_key_456";

let refreshTokens = []; // Lưu tạm bộ nhớ

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// 1. USER SCHEMA (Thêm role)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // 'user' hoặc 'admin'
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// PROPERTY SCHEMA (Giữ nguyên)
const propertySchema = new mongoose.Schema({
  address: String, totalPrice: String, pricePerM2: String, area: String, 
  type: String, width: String, length: String, direction: String, 
  ownerName: String, phone: String, regDate: String, description: String, 
  mainImage: String, thumb1: String, thumb2: String, thumb3: String,
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);

// Middleware Verify
const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];
  if (!tokenHeader) return res.status(401).json({ message: "No token" });
  try {
    const token = tokenHeader.split(' ')[1];
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Expired" });
  }
};

// Middleware Admin Only (Chặn truy cập API nếu không phải admin)
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin' || req.user.role === 'superadmin') {
            next();
        } else {
            res.status(403).json({ message: "Bạn không có quyền Admin" });
        }
    });
};

// --- AUTH ROUTES ---

// ĐĂNG KÝ
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email đã tồn tại" });

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Mặc định tạo ra là 'user'
    const newUser = new User({ email, password: hashedPassword, role: 'user' });
    await newUser.save();
    
    res.json({ message: "Đăng ký thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ĐĂNG NHẬP
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Tài khoản cứng (Backdoor Admin)
  if (email === "admin@bds.com" && password === "admin123") {
    const payload = { email, role: 'admin' };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    refreshTokens.push(refreshToken);
    return res.json({ accessToken, refreshToken, role: 'admin' });
  }

  // Tài khoản DB
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email không tồn tại" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

    const payload = { id: user._id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    refreshTokens.push(refreshToken);

    // Trả về role để frontend xử lý ẩn/hiện nút
    res.json({ accessToken, refreshToken, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) return res.status(403).json({ message: "Invalid Refresh Token" });
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, data) => {
    if (err) return res.status(403).json({ message: "Expired" });
    const accessToken = jwt.sign({ email: data.email, role: data.role }, ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
    res.json({ accessToken });
  });
});

app.post('/api/logout', (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.json({ message: "Logged out" });
});

// --- USER MANAGEMENT ROUTES (Admin Only) ---
app.get('/api/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/users/:id', verifyAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa user" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- PROPERTY ROUTES ---
// Ai cũng xem được
app.get('/api/properties', async (req, res) => {
  const properties = await Property.find().sort({ createdAt: -1 });
  res.json(properties);
});

// Chỉ admin mới được thêm/sửa/xóa
app.post('/api/properties', verifyAdmin, async (req, res) => {
  const newProperty = await new Property(req.body).save();
  res.status(201).json(newProperty);
});

app.put('/api/properties/:id', verifyAdmin, async (req, res) => {
  const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/api/properties/:id', verifyAdmin, async (req, res) => {
  await Property.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
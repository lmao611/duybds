const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error("FATAL ERROR: Missing ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET in .env");
    process.exit(1);
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

let refreshTokens = [];

app.use(helmet());

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, 
    standardHeaders: true,
    legacyHeaders: false, 
    message: { message: "Too many login attempts, please try again after 15 minutes" }
});

app.use(cors({
  origin: [
    "https://duybatdongsan.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const propertySchema = new mongoose.Schema({
  address: String, totalPrice: String, pricePerM2: String, area: String, 
  type: String, width: String, length: String, direction: String, 
  ownerName: String, phone: String, regDate: String, description: String, 
  mainImage: String, thumb1: String, thumb2: String, thumb3: String,
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);

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

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin' || req.user.role === 'superadmin') {
            next();
        } else {
            res.status(403).json({ message: "Forbidden" });
        }
    });
};

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({ email, password: hashedPassword, role: 'user' });
    await newUser.save();
    
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const payload = { id: user._id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    refreshTokens.push(refreshToken);

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
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/properties', verifyToken, async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/properties', verifyAdmin, async (req, res) => {
  try {
    const newProperty = await new Property(req.body).save();
    res.status(201).json(newProperty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/properties/:id', verifyAdmin, async (req, res) => {
  try {
    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/properties/:id', verifyAdmin, async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/', (req, res) => {
    res.send('Server is running securely');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Define a User model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_key'; 
const PORT = process.env.PORT || 7000; // Define PORT variable

// Register a new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Registering user: ${username}`);

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            console.log('User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        console.log('User registered successfully');
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login a user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Logging in user: ${username}`);

    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('Invalid credentials: User not found');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid credentials: Password does not match');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Login successful');
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.log('Error logging in:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('Token not provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed');
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    });
}

// Protected route
app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: `Welcome to the dashboard, ${req.user.username}` });
});

// Route to check registered users
app.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password field
        res.json(users);
    } catch (error) {
        console.log('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

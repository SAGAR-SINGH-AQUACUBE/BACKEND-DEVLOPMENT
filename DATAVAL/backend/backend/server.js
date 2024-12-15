const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const Joi = require('joi'); // Import Joi

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/studentDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Use uploads directory
    },
    filename: (req, file, cb) => {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype !== 'image/jpeg') {
        return cb(new Error('Only JPEG format is allowed.'), false);
    }
    cb(null, true);
};

const upload = multer({ storage, fileFilter });

const studentSchema = new mongoose.Schema({
    studentName: String,
    studentId: String,
    address: String,
    dob: Date,
    age: Number,
    password: String,
    profileImage: String  // Field to store the image file name
});

const Student = mongoose.model('Student', studentSchema, 'students');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(401).send('Access Denied');

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid Token');
        req.user = user;
        next();
    });
};

// Joi validation schemas
const registerSchema = Joi.object({
    studentName: Joi.string().required(),
    studentId: Joi.string().required(),
    address: Joi.string().required(),
    dob: Joi.date().iso().required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    studentId: Joi.string().required(),
    password: Joi.string().min(6).required()
});

const updateSchema = Joi.object({
    studentId: Joi.string().required(),
    studentName: Joi.string(),
    address: Joi.string(),
    dob: Joi.date().iso(),
    password: Joi.string().min(6)
});

// Register student
app.post('/register', upload.single('profileImage'), async (req, res) => {
    // Validate request body
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const { studentName, studentId, address, dob, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const student = new Student({
            studentName,
            studentId,
            address,
            dob,
            age: new Date().getFullYear() - new Date(dob).getFullYear(),
            password: hashedPassword,
            profileImage: req.file ? req.file.filename : null // Store image filename
        });

        const savedStudent = await student.save();
        res.status(201).send(savedStudent);
    } catch (err) {
        console.error("Error registering student:", err);
        res.status(500).send("Error registering student.");
    }
});

// Login route
app.post('/login', async (req, res) => {
    // Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { studentId, password } = req.body;

    try {
        const student = await Student.findOne({ studentId });
        if (!student) return res.status(404).send('Student not found');
        const validPassword = await bcrypt.compare(password, student.password);
        if (!validPassword) return res.status(400).send('Invalid password');
        const token = jwt.sign({ studentId: student.studentId }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.status(200).json({ accessToken: token });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).send("Error logging in.");
    }
});

// Get student details
app.get('/student', authenticateToken, async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.user.studentId });
        if (!student) return res.status(404).send('Student not found');
        res.status(200).json(student);
    } catch (err) {
        console.error("Error fetching student details:", err);
        res.status(500).send("Error fetching student details.");
    }
});

// Update student details
app.put('/update', authenticateToken, async (req, res) => {
    // Validate request body
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { studentId, ...updateDetails } = req.body;

    try {
        if (updateDetails.dob) {
            const dob = new Date(updateDetails.dob);
            updateDetails.age = new Date().getFullYear() - dob.getFullYear();
        }
        const updatedStudent = await Student.findOneAndUpdate(
            { studentId: req.user.studentId },
            updateDetails,
            { new: true }
        );
        if (updatedStudent) {
            res.status(200).json(updatedStudent);
        } else {
            res.status(404).send("Student not found.");
        }
    } catch (err) {
        console.error("Error updating student details:", err);
        res.status(500).send("Error updating student details.");
    }
});

// Delete student
app.delete('/delete', authenticateToken, async (req, res) => {
    try {
        const deletedStudent = await Student.findOneAndDelete({ studentId: req.user.studentId });
        if (!deletedStudent) return res.status(404).send("Student not found");
        res.status(200).send("Student deleted successfully.");
    } catch (err) {
        console.error("Error deleting student:", err);
        res.status(500).send("Error deleting student.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

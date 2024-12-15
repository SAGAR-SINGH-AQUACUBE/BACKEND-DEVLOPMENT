const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 9000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/students', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
});

// Define a schema and model
const userSchema = new mongoose.Schema({
    name: String,
    birthdate: Date,
    location: String,
    subject: String
});

const User = mongoose.model('students', userSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// Route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'), (err) => {
        if (err) {
            console.error("Error sending file:", err.message);
            res.status(404).send("File not found");
        }
    });
});

// Route to handle form submission
app.post('/submit', async (req, res) => {
    const { name, birthdate, location, subject } = req.body;

    try {
        // Validate and parse date
        const parsedBirthdate = new Date(birthdate);
        if (isNaN(parsedBirthdate.getTime())) {
            return res.status(400).send('Invalid date format');
        }

        // Create a new user document
        const user = new User({ name, birthdate: parsedBirthdate, location, subject });

        // Save user to database
        await user.save();
        res.status(200).send('Data saved successfully');
    } catch (error) {
        console.error('Error saving data:', error.message);
        res.status(500).send('Error saving data');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
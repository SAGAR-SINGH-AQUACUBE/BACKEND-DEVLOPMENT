const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MySQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
});

sequelize.authenticate()
    .then(() => console.log("Connected to MySQL"))
    .catch(err => console.error("Could not connect to MySQL", err));

// Define Student model
const Student = sequelize.define('Student', {
    studentName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    studentId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'students',
    timestamps: false
});

// Sync the model with the database
sequelize.sync()
    .then(() => console.log("Student table created or already exists"))
    .catch(err => console.error("Error creating table", err));

app.use(bodyParser.json());  // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));  // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'firstproblem.html'));
});

// Create student
app.post('/submit', async (req, res) => {
    const studentDetails = req.body;

    try {
        const dob = new Date(studentDetails.dob);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        studentDetails.age = age;

        const student = await Student.create(studentDetails);
        console.log("Student saved successfully:", student);

        res.send(student);  // Return saved student data as JSON
    } catch (err) {
        console.error("Error saving student details to the database:", err);
        res.status(500).send("Error saving student details to the database.");
    }
});

// Update student
app.put('/update', async (req, res) => {
    const { studentId, ...updateDetails } = req.body;

    try {
        if (updateDetails.dob) {
            const dob = new Date(updateDetails.dob);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            updateDetails.age = age;
        }

        const updatedStudent = await Student.update(updateDetails, {
            where: { studentId }
        });

        if (updatedStudent[0] > 0) {
            const student = await Student.findOne({ where: { studentId } });
            console.log("Student updated successfully:", student);
            res.send(student);  // Return updated student data as JSON
        } else {
            res.status(404).send("Student not found.");
        }
    } catch (err) {
        console.error("Error updating student details in the database:", err);
        res.status(500).send("Error updating student details.");
    }
});

// Delete student
app.delete('/delete', async (req, res) => {
    const { studentId } = req.body;

    try {
        const deletedStudent = await Student.destroy({
            where: { studentId }
        });

        if (deletedStudent) {
            console.log("Student deleted successfully.");
            res.send("Student details deleted successfully.");
        } else {
            res.status(404).send("Student not found.");
        }
    } catch (err) {
        console.error("Error deleting student details from the database:", err);
        res.status(500).send("Error deleting student details.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
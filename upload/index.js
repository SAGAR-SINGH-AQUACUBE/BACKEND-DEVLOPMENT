const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
const multer = require('multer');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './uploads'); // Ensure 'uploads' directory exists
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Setting up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views")); // Ensure views folder is set

app.use(express.json()); // To handle JSON body parsing
app.use(express.urlencoded({ extended: false })); // To handle form submissions

// Route to serve the homepage
app.get("/", (req, res) => {
  return res.render("homepage"); // No need to add .ejs, as view engine handles that
});

// File upload route
app.post('/upload', upload.single('profileimage'), (req, res) => {
  console.log(req.body);
  console.log(req.file);
  return res.redirect("/");
});

// File download route
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join('D:/SEM-5-BACKEND-LAB/upload/uploads', filename); // Absolute path
  
  res.download(filePath, (err) => {
    if (err) {
      console.error('Error while sending file:', err);
      res.status(404).send('File not found');
    }
  });
});
// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}`));

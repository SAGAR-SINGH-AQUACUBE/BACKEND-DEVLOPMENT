const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'hi.html'));
});



// Serve the student list page

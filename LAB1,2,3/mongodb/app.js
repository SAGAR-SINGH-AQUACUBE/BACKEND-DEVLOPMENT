const mongoose = require('mongoose');

// Replace '127.0.0.1' with your actual MongoDB server address if different
const uri = 'mongodb://127.0.0.1:27017/testdb';

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("We're connected!");
});

// Define a simple schema
const Schema = mongoose.Schema;
const testSchema = new Schema({
  name: String,
  age: Number
});

// Compile model from schema
const TestModel = mongoose.model('TestModel', testSchema);

// (async () => {
//   try {
//     const testDoc = new TestModel({ name: 'SAGAR SINGH', age: 29 });
//     const savedDoc = await testDoc.save();
//     console.log('Document saved:', savedDoc);
//   } catch (err) {
//     console.error('Error saving document:', err);
//   }
// })();




//now read******************************
(async () => {

  try {
    const documents = await TestModel.find();
    console.log('All documents:', documents);
  } catch (err) {
    console.error('Error finding documents:', err);
  }
})();


// now updateeee***************************************************************************
(async () => {
  try {
    const updatedDoc = await TestModel.updateOne(
      { name: 'SAGAR SINGH' },  
      { $set: { age: 100
       } }       
    );
    console.log('Update result:', updatedDoc);
  } catch (err) {
    console.error('Error updating document:', err);
  }
})();



// now delete ****************************************************
// (async () => {
//   try {
//     const deleteResult = await TestModel.deleteOne({ name: 'SAGAR' });
//     console.log('Delete result:', deleteResult);
//   } catch (err) {
//     console.error('Error deleting document:', err);
//   }
// })();

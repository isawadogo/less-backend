const mongoose = require('mongoose');

const connectionString = "mongodb+srv://jenandria:9eZNhyncLNasR9qn@cluster0.krymsty.mongodb.net/API_produits"

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));


//appel de la dépendance Mongoose
const mongoose = require('mongoose');

//connexion à la base de donnée
const connectionString = 'mongodb+srv://admin:31830@clusterbam.4mwajc8.mongodb.net/API_produits';

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
	.then(() => console.log('Database connected'))
	.catch(error => console.error(error))
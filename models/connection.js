//appel de la dépendance Mongoose
const mongoose = require('mongoose');

const connectionString = process.env.MONGODB_CONNECTION_STRING

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
	.then(() => console.log('Database connected'))
	.catch(error => console.error(error))
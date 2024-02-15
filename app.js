// Importe le framework Express
const express = require('express');
//Importe le module mongoose
const mongoose = require('mongoose');
// Crée une instance d'Express
const app = express();
// Import de la route vers la collection book
const bookRoutes = require('./routes/book');
// Import de la route vers la collection user
const userRoutes = require('./routes/user');
// Import de path ?? A vérifier à quoi cela sert
const path= require('path');

require('dotenv').config();

// Connecte l'application à la base de données MongoDB en utilisant l'URL de connexion
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log('Connexion à MongoDB réussie !'))
	.catch(() => console.log('Connexion à MongoDB échouée !'));


// Middleware pour traiter les données JSON dans les requêtes
app.use(express.json());

// Middleware pour gérer les CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
	// Autorise toutes les origines
	res.setHeader('Access-Control-Allow-Origin', '*');
	// Autorise certains en-têtes dans les requêtes
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
	);
	// Autorise certains types de méthodes HTTP
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, DELETE, PATCH, OPTIONS'
	);
	// Passe au middleware suivant
	next();
});


app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
// On indique à Express de gérer la ressource images de manière statique via express.static,puis on combine ce chemin via
//  __dirname(var -g de node représentant le chemin absolu du répertoire script) dès qu'elle recevra une requête vers la route images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Exporte l'application Express pour utilisation dans d'autres modules
module.exports = app;

// Ce fichier configure une application Express avec des routes simples pour
// créer un livre via une requête POST et récupérer une liste de livres via
// une requête GET. La connexion à la base de données MongoDB est établie
// au démarrage de l'application.








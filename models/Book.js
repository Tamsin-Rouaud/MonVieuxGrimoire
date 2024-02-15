const mongoose = require('mongoose');
// Création de mon shéma de données
const bookSchema = mongoose.Schema({
	userId: { type: String, required: true },
	title: { type: String, required: true },
	author: { type: String, required: true },
	imageUrl: { type: String, required: true },
	year: { type: Number, required: true },
	genre: { type: String, required: true },
	ratings: [
		{
			userId: { type: String, required:true },
			grade: { type: Number ,required:true},
		},
	],
	averageRating: { type: Number },
});

// Export de notre modèle
module.exports = mongoose.model('Book', bookSchema);

// La méthode Shéma de Mongoose permet de créer un shéma de données pour
// la base de données MongoDB.La méthode model transforme ce modèle en
// modèle utilisable.

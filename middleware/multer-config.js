// Importation du module Multer
const multer = require('multer');

// Définition des types MIME associés aux extensions de fichiers
const MIME_TYPES = {
	'image/jpg': 'jpg',
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
};

// Configuration du stockage avec Multer
const storage = multer.diskStorage({
	// Définit le dossier de destination pour les fichiers téléchargés
	destination: (req, file, callback) => {
		callback(null, 'images');
	},
	// Définit le nom de fichier lors du téléchargement
	filename: (req, file, callback) => {
		// Remplace les espaces par des underscores dans le nom d'origine
		const name = file.originalname.split(' ').join('_');
		// Obtient l'extension du fichier à partir du type MIME
		const extension = MIME_TYPES[file.mimetype];
		// Ajoute un horodatage unique au nom du fichier
		callback(null, name);
	},
});

// Exporte la configuration Multer avec le stockage configuré
module.exports = multer({ storage: storage }).single('image');

// Importe le module HTTP pour créer un serveur
const http = require('http');
// Importe l'application Express depuis le fichier app.js
const app = require('./app');
// Fonction pour normaliser le port, renvoie le port valide ou false
const normalizePort = (val) => {
	const port = parseInt(val, 10);

	if (isNaN(port)) {
		return val;
	}
	if (port >= 0) {
		return port;
	}
	return false;
};
// Récupère le port à partir de la variable d'environnement ou utilise le port 3000 par défaut
const port = normalizePort(process.env.PORT || '4000');
// Configure le port de l'application Express
app.set('port', port);
// Fonction de gestion des erreurs lors de la création du serveur
const errorHandler = (error) => {
	if (error.syscall !== 'listen') {
		throw error;
	}
	const address = server.address();
	const bind =
		typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges.');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use.');
			process.exit(1);
			break;
		default:
			throw error;
	}
};
// Crée un serveur HTTP en utilisant l'application Express

const server = http.createServer(app);

// Gère les erreurs lors de la création du serveur
server.on('error', errorHandler);

// Écoute l'événement "listening" du serveur
server.on('listening', () => {
	const address = server.address();
	const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
	console.log('Listening on ' + bind);
});
// Fait écouter le serveur sur le port défini
server.listen(port);

// Ce fichier configure et crée un serveur HTTP en utilisant Node.js et Express. Il utilise
// également la fonction normalizePort pour s'assurer que le port est correctement configuré
// et fournit une gestion des erreurs pour éviter les problèmes potentiels lors du démarrage
// du serveur. Enfin, il écoute les événements liés au serveur et affiche un message
// lorsqu'il est prêt à accepter des connexions.


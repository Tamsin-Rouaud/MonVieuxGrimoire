const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	try {
		// Récupération du Headers en le splitant en tableau et en récupérant le deuxième élément du tableau, le token
		const token = req.headers.authorization.split(' ')[1];
		// Décodage du token grâce à .verify en lui passant le token récupéré et la clé secrète
		const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
		// Récupération du userId en le récupérant via le token décodé
		const userId = decodedToken.userId;
		// On transmet le userId à l'objet req. qui sera transmis aux routes transmises par la suite ou aux autres middlewares
		req.auth = {
			userId: userId,
		};
		next();
		// Si le token n'est pas décodé une erreur sera renvoyée grâce au catch qui indiquera au client que son token est invalide
	} catch (error) {
		res.status(401).json({ error });
	}
};

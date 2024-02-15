const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Import du modèle User
const User = require('../models/User');

// Fonction  logique métier inscription utilisateur
exports.signup = (req, res, next) => {
	// Appel de la fonction pour hâcher (crypter) le mdp (data :mdp corps de la requête, salt :nb de tours de l'algorythme de hachâge)
	bcrypt
		.hash(req.body.password, 10)
		// Récupération mdp crypté pour l'enregistrer dans un nouveau User crée ds la BDD
		.then((hash) => {
			// Création du nouvel utilisateur avec le modèle mongoose User
			const user = new User({
				// Adresse mail du corps de la requête
				email: req.body.email,
				// Enregistrement du mdp crypté
				password: hash,
			});
			// Enregistrement du User dans la BDD
			user
				.save()
				// Si l'enregistrement est réussi on renvoie un code 201(= ressource crée) et un message
				.then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
				// Si l'enregistrement à échoué on renvoie une erreur 400 avec l'obj error
				.catch((error) => res.status(400).json({ error }));
		})
		// Renvoie un code 500 pour une erreur de serveur avec l'obj error
		.catch((error) => res.status(500).json({ error }));
};

// Fonction logique métier connexion utilisateur
exports.login = (req, res, next) => {
	User.findOne({ email: req.body.email })
		.then((user) => {
			// Vérification si l'utilisateur a été trouvé
			if (user === null) {
				// Erreur retourné si l'utilisateur n'existe pas
				res
					.status(401)
					.json({ message: 'Paire identifiant/mot de passe incorrecte' });
				// Dans le cas ou l'utilisateur existe
			} else {
				// Appel de la méthode compare de bcrypt pour récupérer le mdp de la BDD et celui saisi par l'utilisateur
				bcrypt
					.compare(req.body.password, user.password)
					.then((valid) => {
						// On vérifie si le mdp est faux
						if (!valid) {
							// On retourne un message d'erreur si le mdp saisi est incorrect
							res
								.status(401)
								.json({ message: 'Paire identifiant/mot de passe incorrecte' });
							// Dans le cas ou l'utilisateur saisi le bon mdp
						} else {
							// On retourne l'objet User contenant le userId et le token
							res.status(200).json({
								userId: user._id,
								// Appel de la fonction .sign pour l'encodage du Token, elle prend plusieurs arguments
								token: jwt.sign(
									// Le premier argument correspondent aux données que l'on veut encoder (payload)
									// Création obj avec le userId qui sera l'identifiant utilisateur du User ainsi
									// on est certain que  la requête correspond bien au userId indiqué ci-dessus
									{ userId: user._id },
									// Le second argument correspond à la clé secrète d'encodage
									'RANDOM_TOKEN_SECRET',
									// Le troisième argument (de configuration) correspond à l'application d'une expiration pour le token de 24h'
									{ expiresIn: '24h' }
								),
							});
						}
					})
					// Vérification erreur exécution de la requête dans la BDD et non pas si l'utilisateur existe
					.catch((error) => {
						res.status(500).json({ error });
					});
			}
		})
		// Vérification erreur exécution de la requête dans la BDD et non pas si l'utilisateur existe
		.catch((error) => {
			res.status(500).json({ error });
		});
};

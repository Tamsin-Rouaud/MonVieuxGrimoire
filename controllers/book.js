const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');

// Gère la création d'un nouveau livre, le format sera différent car un fichier a été transmis
exports.createBook = (req, res, next) => {
	// Parse le contenu JSON de la propriété 'book' dans le corps de la requête
	const bookObject = JSON.parse(req.body.book);
	// Supprime les propriétés '_id' et '_userId' de l'objet book
	delete bookObject._id;
	delete bookObject._userId;
	// Spécifie un nom de fichier pour l'image redimensionnée avec l'extension '.webp'
	const resizedFileName = `resized-${req.file.filename.replace(
		/\.[^.]+$/,
		''
	)}.webp`;
	// Construit le chemin d'accès pour l'image redimensionnée dans le dossier 'images'
	const resizedImagePath = `./images/${resizedFileName}`;
	// Utilise Sharp pour redimensionner l'image
	sharp(req.file.path)
		// Redimensionne l'image à une largeur de 206 pixels et une hauteur de 260 pixels
		.resize(206, 260)
		// Convertit l'image en format WebP
		.toFormat('webp', { quality: 80 })
		.toFile(resizedImagePath, (err, info) => {
			// Gère les erreurs lors du redimensionnement et de la conversion
			if (err) {
				return res.status(401).json({ error: err.message });
			}
			// Supprime le fichier original après redimensionnement
			fs.unlink(req.file.path, (unlinkErr) => {
				// Gère les erreurs lors de la suppression du fichier original
				if (unlinkErr) {
					console.error(
						'Erreur lors de la suppression du fichier original:',
						unlinkErr
					);
				}
				// Crée un objet Book avec l'URL de l'image redimensionnée
				const book = new Book({
					...bookObject,
					
					userId: req.auth.userId,
					imageUrl: `${req.protocol}://${req.get(
						'host'
					)}/images/${resizedFileName}`,
				});

				// Sauvegarde le livre dans la base de données
				book
					.save()
					.then(() => {
						res.status(201).json({ message: 'Livre enregistré !' });
					})
					.catch((error) => {
						res
							.status(401)
							.json({ error: "Erreur lors de l'enregistrement !" });
					});
			});
		});
};

// Gère la création de la notation du livre
exports.createRatingBook = async (req, res, next) => {
	try {

		// Récupère l'identifiant de l'utilisateur via le token
		const userId = req.auth.userId;
		// Récupère la note fournie dans le corps de la requête
		const rating = req.body.rating;
		// Crée un objet contenant l'identifiant de l'utilisateur et la note donnée
		const userRating = { userId, grade: rating };

		// Vérifie si l'utilisateur a déjà noté ce livre
		const userHasRatedBook = await Book.findOne({

			_id: req.params.id,
			'ratings.userId': userId,
		});

		// Si l'utilisateur a déjà noté le livre, renvoie une réponse d'erreur
		if (userHasRatedBook) {
			return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
		}

		// J'utilise la méthode Mongoose findByIdAndUpdate pour la mise à jour de la base de données.
		// Elle prend 3 paramètres : l'id du livre, l'ajout de l'objet userRating au tableau ratings,
		// et la spécification qu'il faut renvoyer le document mis à jour.
		const book = await Book.findByIdAndUpdate(
			{ _id: req.params.id },
			{ $push: { ratings: userRating } },
			{ new: true }
		);

		// Si la mise à jour a échoué, renvoie une réponse d'erreur
		if (!book) {
			return res.status(404).json({ message: 'Livre introuvable' });
		}

		// On met à jour la note moyenne du livre en calculant la somme des notes
		const totalRatings = book.ratings.reduce(
			(sumOfRatings, rating) => sumOfRatings + rating.grade,
			0
		);

		// Calcule la nouvelle note moyenne et l'attribue au livre
		book.averageRating = totalRatings / book.ratings.length;

		// On sauvegarde le livre avec la note moyenne mise à jour
		await book.save();

		// La mise à jour et la sauvegarde ont réussi, renvoie l'objet book mis à jour avec sa note moyenne
		res.status(200).json(book);
	} catch (error) {
		// Gère les erreurs liées à la recherche, la mise à jour ou la sauvegarde du livre dans la base de données
		res.status(500).json({ error });
	}
};

// Attention selon si le user a transmis ou non un fichier, le format de la requête ne sera pas le même
exports.modifyBook = (req, res, next) => {
	// Vérifie si le user a transmis un fichier dans la requête
	const bookObject = req.file
		? {
				...JSON.parse(req.body.book),
				// Si un fichier est transmis, crée l'URL de l'image avec le nom de fichier
				imageUrl: `${req.protocol}://${req.get('host')}/images/${
					req.file.filename
				}`,
		  }
		: // Si aucun fichier n'est transmis, utilise le corps de la requête directement
		  { ...req.body };

	// Supprime la propriété '_userId' de l'objet bookObject
	delete bookObject._userId;

	// Recherche le livre dans la base de données avec l'identifiant fourni dans la requête
	Book.findOne({ _id: req.params.id })
		.then((book) => {
			// Vérifie si le user actuel est le propriétaire du livre
			if (book.userId !== req.auth.userId) {
				return res.status(403).json({ message: '403: Unauthorized request' });
			} else if (req.file) {
				// Si un fichier est transmis, spécifie un chemin de sortie différent pour le fichier redimensionné
				const resizedFileName = `resized-${req.file.filename.replace(
					/\.[^.]+$/,
					''
				)}.webp`;
				const resizedImagePath = `./images/${resizedFileName}`;

				// Utilisez Sharp pour redimensionner l'image
				sharp(req.file.path)
					.resize(206, 260)
					.toFormat('webp')
					.toFile(resizedImagePath, (err, info) => {
						// Gère les erreurs lors du redimensionnement et de la conversion
						if (err) {
							return res.status(401).json({ error: err.message });
						}
						// Supprime le fichier original après redimensionnement
						fs.unlink(req.file.path, (unlinkErr) => {
							// Gère les erreurs lors de la suppression du fichier original
							if (unlinkErr) {
								console.error(
									'Erreur lors de la suppression du fichier original:',
									unlinkErr
								);
							}
							// Met à jour le livre avec la nouvelle URL redimensionnée
							Book.updateOne(
								{ _id: req.params.id },
								{
									...bookObject,
									imageUrl: `${req.protocol}://${req.get(
										'host'
									)}/images/${resizedFileName}`,
									_id: req.params.id,
								}
							)
								.then(() => res.status(200).json({ message: 'Livre modifié!' }))
								.catch((updateError) =>
									res.status(401).json({ error: updateError.message })
								);
						});
					});
			} else {
				// Si aucun fichier n'est transmis, met simplement à jour le livre avec les nouvelles informations
				Book.updateOne({ _id: req.params.id }, { ...bookObject })
					.then(() => res.status(200).json({ message: 'Livre modifié!' }))
					.catch(
						(updateError) =>
							res.status(401).json({ error: updateError.message }) // Erreur à revoir
					);
			}
		})
		.catch((error) => {
			// Gère les erreurs liées à la recherche du livre dans la base de données
			res.status(500).json({ error });
		});
};

// Supprime un livre en fonction de l'identifiant fourni dans la requête
exports.deleteBook = (req, res, next) => {
	// Recherche le livre dans la base de données avec l'identifiant fourni dans la requête
	Book.findOne( {_id: req.params.id })
		.then((book) => {
			// Vérifie si le user actuel est le propriétaire du livre
			if (book.userId != req.auth.userId) {
				// Si le user n'est pas autorisé, renvoie une réponse non autorisée
				res.status(401).json({ message: 'Not authorized' });
			} else {
				// Si le user est autorisé, extrait le nom de fichier de l'URL de l'image
				const filename = book.imageUrl.split('/images/')[1];

				// Supprime le fichier correspondant à l'image du livre
				fs.unlink(`images/${filename}`, () => {
					// Supprime le livre de la base de données
					Book.deleteOne({ _id: req.params.id })
						.then(() => {
							// Renvoie une réponse indiquant que l'objet a été supprimé avec succès
							res.status(200).json({ message: 'Objet supprimé !' });
						})
						.catch((error) => res.status(401).json({ error })); // Vérifier code erreur
				});
			}
		})
		.catch((error) => {
			// Gère les erreurs liées à la recherche du livre dans la base de données
			res.status(500).json({ error }); // Vérifier code erreur
		});
};

// Récupère un livre en fonction de l'identifiant fourni dans la requête
exports.getOneBook = (req, res, next) => {
	// Recherche le livre dans la base de données avec l'identifiant fourni dans la requête
	Book.findOne({ _id: req.params.id })
		.then((book) => res.status(200).json(book)) // Renvoie le livre trouvé avec un statut 200 (OK)
		.catch((error) => res.status(400).json({ error })); // Gère les erreurs liées à la recherche du livre dans la base de données
};

// Récupère tous les livres de la base de données
exports.getAllBooks = (req, res, next) => {
	// Utilise la méthode find() de Mongoose pour récupérer tous les livres
	Book.find()
		.then((books) => res.status(200).json(books)) // Envoie la liste des livres avec un statut 200 (OK)
		.catch((error) => res.status(400).json({ error })); // Gère les erreurs liées à la récupération des livres depuis la base de données
};

// Récupère les trois livres les mieux notés dans la base de données
exports.bestRatings = (req, res, next) => {
	// Utilise la méthode find() de Mongoose pour récupérer tous les livres de la base de données
	Book.find()
		// Utilise .sort pour trier les livres en fonction de la note moyenne (averageRating) de manière décroissante
		.sort({ averageRating: -1 })
		// Limite le nombre de résultats renvoyés à 3, donc les trois livres les mieux notés
		.limit(3)
		// Si la recherche est réussie
		.then((BestRatedBooks) => res.status(200).json(BestRatedBooks))
		// Renvoie une erreur serveur qui a eu lieu lors de la recherche des livres
		.catch((error) => res.status(500).json({ error }));
};

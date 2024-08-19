const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
    categorieProduit: String,
    prix: Number,
    quantite: Number,
    enseigne: String,
    criteres: [String],
});

const listeSchema = new mongoose.Schema({
    nom: String,
    adresseLivraison: {
        commune: { type: String, default: '' },
        codePostal: { type: String, default: '' },
        nomDeRue: { type: String, default: '' },
        numeroDeRue: { type: String, default: '' }
    },
    prix: Number,
    listeArticle: articleSchema,
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateurs" },
    dateArriveePrevu: Date,
    statutLivraison: String,
<<<<<<< HEAD
    dateCreation: Date.now
=======
    dateCreation: { type: Date, default: Date.now },
>>>>>>> 0d529f88493227aff737875f6773b84b89d60830
})

const Liste = mongoose.model('listes', listeSchema);

module.exports = Liste
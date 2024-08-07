const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
    categorieProduit: String,
    prix: Number,
    quantite: Number,
    enseigne: String,
    critere: [String],
});

const listeSchema = new mongoose.Schema({
    nom: String,
    adresseLivraison: Object,
    prix: Number,
    listeArticle: articleSchema,
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateurs" },
    dateArriveePrevu: Date,
    statutLivraison: String
})

const Liste = mongoose.model('listes', listeSchema);

module.exports = Liste
const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
    categorieProduit: String,
    prix: Number,
    enseigne: String,
    critere: Array,
});

const listeSchema = new mongoose.Schema({

    nom: String,
    adresseLivraison: Object,
    prix: Number,
    listeArticle: articleSchema,
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "utilisateurs" },
    dateArriveePrevu: Date,
})

const Liste = mongoose.model('listes', listeSchema);

module.exports = Liste
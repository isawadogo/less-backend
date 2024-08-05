const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
    nom: String,
    prix: Number,
    local: Boolean,
    bio: Boolean,
    vegan: Boolean,
    vegetarien: Boolean,
    premierPrix: Boolean,
    carbone: Number,
    matiereGrasse: Number,
    sucre: Number,
    allergies: Array,
    enseigne: { type: mongoose.Schema.Types.ObjectId, ref: 'enseigne' },

});

const Produit = mongoose.model('produits', produitSchema);

module.exports = Produit
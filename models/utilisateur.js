const mongoose = require('mongoose');

const critereSchema = mongoose.Schema({

    local: Boolean,
    bio: Boolean,
    vegetarien: Boolean,
    vegan: Boolean,
    premierPrix: Boolean,
    faibleEnSucre: Boolean,
    faibleEnMatiereGrasse: Boolean,
    faibleEmpreinte: Boolean,
    allergie: Array,
    budget: Number,
});




const utilisateurSchema = new mongoose.Schema({

    prefixe: String,
    prenom: String,
    nom: String,
    dateDeNaissance: Date,
    adresses: Array,
    telephone: String,
    email: String,
    modDePasse: String,
    token: String,
    profilConso: String,
    criteres: critereSchema
})




const Utilisateur = mongoose.model('enseignes', utilisateurSchema);

module.exports = Utilisateur
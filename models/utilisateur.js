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
    allergie: [String],
    budget: Number, 
    distance: Number,
});

const utilisateurSchema = new mongoose.Schema({
    prefixe: String,
    prenom: String,
    nom: String,
    dateDeNaissance: { type: Date, default: new Date("1995-12-17T03:24:00")},
    adresses: [{
        commune: String,
        codePostal: Number,
        nomDeRue: String,
        numeroDeRue: String
    }],
    telephone: String,
    email: String,
    motDePasse: String,
    token: String,
    profilConso: String,
    criteres: {
        type: critereSchema,
        default: {}
    },
    notifications: [String],
    preferences: {
        afficherEcranAccueil: Boolean,
        recevoirNotifications: Boolean
    }
})

const Utilisateur = mongoose.model('utilisateurs', utilisateurSchema);

module.exports = Utilisateur
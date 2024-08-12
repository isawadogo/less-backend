const mongoose = require('mongoose');

const critereSchema = mongoose.Schema({
    local: { type: Boolean, default: false }, 
    bio: { type: Boolean, default: false },
    vegetarien: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    premierPrix: { type: Boolean, default: false },
    faibleEnSucre: { type: Boolean, default: false },
    faibleEnMatiereGrasse: { type: Boolean, default: false },
    faibleEmpreinte: { type: Boolean, default: false },
    allergie: [String],
    budget: { type: Number, default: 0 },
    distance: { type: Number, default: 0 }
});

const utilisateurSchema = new mongoose.Schema({
    prefixe: { type: String, default: '' },
    prenom: { type: String, default: '' },
    nom: { type: String, default: '' },
    dateDeNaissance: { type: Date, default: new Date("1995-12-17T03:24:00")},
    adresses: [{
        commune: { type: String, default: '' },
        codePostal: { type: String, default: '' },
        nomDeRue: { type: String, default: '' },
        numeroDeRue: { type: String, default: '' }
    }],
    telephone: { type: String, default: '' },
    email: { type: String, default: '' },
    motDePasse: { type: String, default: '' },
    token: { type: String, default: '' },
    profilConso: { type: String, default: '' },
    criteres: {
        type: critereSchema,
        default: {}
    },
    notifications: [String],
    preferences: {
        afficherEcranAccueil: { type: Boolean, default: false },
        recevoirNotifications: { type: Boolean, default: false }
    }
})

const Utilisateur = mongoose.model('utilisateurs', utilisateurSchema);

module.exports = Utilisateur
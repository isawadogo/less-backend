const mongoose = require('mongoose');

const enseigneSchema = new mongoose.Schema({

    nom: String,
    adresse: Object,
    localisation: Object,

})

const Enseigne = mongoose.model('enseignes', enseigneSchema);

module.exports = Enseigne
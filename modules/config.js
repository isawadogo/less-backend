const produitBackend = 'http://127.0.0.1:3100/produit';

const enseignesList = [ 
    {   id: 'enseigne1', 
        nom: 'Leclerc',
        backendURL: 'http://127.0.0.1:3100/enseigne1'
    }, 
    {
        id: 'enseigne2',
        nom: 'Naturalia',
        backendURL: 'http://127.0.0.1:3100/enseigne2'
    }, 
    {
        id: 'enseigne3',
        nom: 'Monoprix',
        backendURL: 'http://127.0.0.1:3100/enseigne3'
    }, 
    {
        id: 'enseigne4',
        nom: 'Leaderprice',
        backendURL: 'http://127.0.0.1:3100/enseigne4'
    } 
];

module.exports = { produitBackend, enseignesList };
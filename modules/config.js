const produitBackend = 'https://less-backend-magasin.vercel.app/produit';

const enseigneBackend = 'https://less-backend-magasin.vercel.app/enseigne';

const enseignesList = [ 
    {   id: 'enseigne1', 
        nom: 'Leclerc',
        backendURL: 'https://less-backend-magasin.vercel.app/enseigne1'
    }, 
    {
        id: 'enseigne2',
        nom: 'Naturalia',
        backendURL: 'https://less-backend-magasin.vercel.app/enseigne2'
    }, 
    {
        id: 'enseigne3',
        nom: 'Monoprix',
        backendURL: 'https://less-backend-magasin.vercel.app/enseigne3'
    }, 
    {
        id: 'enseigne4',
        nom: 'Leaderprice',
        backendURL: 'https://less-backend-magasin.vercel.app/enseigne4'
    } 
];

module.exports = { produitBackend, enseignesList, enseigneBackend };

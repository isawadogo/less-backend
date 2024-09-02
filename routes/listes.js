var express = require('express');
var router = express.Router();

const { body, validationResult } = require('express-validator');
const { produitBackend, enseignesList, enseigneBackend } = require('../modules/config');
const {getDistance} = require('geolib');

require('../models/connection');
//const User = require('../models/utilisateur');
const User = require('../models/utilisateur');
const Liste = require('../models/liste');
const API_KEY = process.env.ENSEIGNE_API_KEY;

router.post('/calcul',
  body('enseignes').notEmpty(),
  body('criteres').notEmpty(),
  body('produits').notEmpty(),
  body('userCoordinates').notEmpty(),
  async function (req, res, next) {
  // validate params: nom and utilisateur are mandatory
   const result = validationResult(req);
    if (!result.isEmpty()) {
      res.json({result: false, error: result.array()})
      return
  }
  const { criteres, produits, enseignes, userCoordinates, userDistance } = req.body;
  //console.log('Data received : ', req.body)
    // get all the produits matching criteres grouped by enseigne
    var results = [];
    let distancesToEnseignes =  {};
    for (ens of enseignes) {
        //console.log('USER COPRDS :', userCoordinates);
        //console.log('ENS : ', ens);
        distancesToEnseignes[ens._id] = getDistance(
        {latitude: userCoordinates.latitude, longitude: userCoordinates.longitude},
        {latitude: ens.localisation.latitude, longitude: ens.localisation.longitude})/1000
    }
    const resultatsProduits= []
    for (const produit of produits) {
      const reqURL = produitBackend + '/categories/' + produit.categorie + '?nomProduit=' + produit.nom +'&page=1&limit=1000' 
      try {
        const resTemp = await fetch(reqURL,
        {
          headers: { "Content-Type": "application/json", "authorization": API_KEY},
        });
        const json = await resTemp.json();
        if (json.result) {
          for (const critereNom of criteres) {
            let produitsMatch = [];
            switch (critereNom) {
              case 'bio':
              case 'faibleEmpreinte':
              case 'premierPrix':
                produitsMatch = json.produits.filter((e) => e[critereNom] === true )
                //results.push({ critere: critereNom, produitsMatch, nom: produit.nom, categorie: produit.categorie });
                break;
              case 'faibleEnMatiereGrasse':
                produitsMatch = json.produits.filter((e) => e.tauxDeMatiereGrasse <= 10 )
                //results.push({ critere: critereNom, produitsMatch, nom: produit.nom, categorie: produit.categorie });
                break;
              case 'faibleEnSucre':
                produitsMatch = json.produits.filter((e) => e.tauxDeSucre <= 10 )
                //results.push({ critere: critereNom, produitsMatch, nom: produit.nom, categorie: produit.categorie });
                break;
              case 'distance':
                // get the produits of enseignes that satify the conditions
                if (!userDistance || userDistance === 0) {
                  produitsMatch = json.produits.filter((e) => distancesToEnseignes.filter((d) => d <= userDistance).include(e.enseigne._id) )
                }
                //console.log('PRODUITS DISTANCE : ', produitsMatch);
              break;
            }
            //console.log('JSON RPD : ', json.produits)
            //console.log('PROD MATCH : ', produitsMatch)
            //if (produitsMatch.length === 0 ) {
            //  produitsMatch = json.produits;
            //}
            let resultats = [];
            // Get distance to the enseigne
            for (const enseigne of enseignes) {
            //enseignes.forEach(function(enseigne) {
              const enseigneProduits = produitsMatch.filter((p) => p.enseigne._id === enseigne._id);
              //console.log(`enseignes ${enseigne.nom}, critere : ${critereNom}, produits : ${JSON.stringify(enseigneProduits)}`)
              
              const enseigneProduitsCount = enseigneProduits.length;
              const matched = enseigneProduitsCount !== 0;
              const ponderation = matched ? 1 : 0;
              let produitEnseigne = {};
              //const produitEnseigne = matched ? enseigneProduits[0] : json.produits[0]; // FAUX - filter sur l'id enseigne
              if (matched) {
                produitEnseigne = enseigneProduits[0]
              } else {
                produitEnseigne = json.produits.filter((p) => p.enseigne._id === enseigne._id)[0];
              }
              //console.log('PROD ENSEI : ', produitEnseigne)
              //console.log(`MATCHED : ${matched}, ENSEIGNE PRODUITS COUNT : ${enseigneProduitsCount}, ENSEIGNE PRD : ${enseigneProduits}`)
              results.push({ 
                enseigneId: enseigne._id, 
                enseigneNom: enseigne.nom, 
                nomProduit: produit.nom, 
                categorie: produit.categorie,
                ponderation: ponderation,
                critere: critereNom,
                produit: produitEnseigne,
                quantite: produit.quantite,
                matched: matched,
                distance: distancesToEnseignes[enseigne._id],
              })
            }
          }//, resultatCriteres
        }
      } catch(err) {
        console.error(err.stack);
        res.json({result: false, error: "Failed to get produits list. Please see logs for more details"});
        next(err);
      }
    }
    //console.log('RES PROD : ', JSON.stringify(results));

   // res.json({result: true, results});
    const listeRes = results
    //const criteresUtilisateur = [ ...new Set(listeRes.resultat.filter((f) => f.critere !== '_id' && user.criteres[f.critere] ).map((c) => c.critere)) ]
    const criteresUtilisateur = criteres;
    const produitsSelected = produits;
    const catSelected = [...new Set(produitsSelected.map((e) => e.categorie))].map((e, i) => {return {nom: e, id: i}})
    //console.log('LISTES RES : ', listeRes);
    const resultComparaison = listeRes.reduce((a, v, i, res) => {
      const isKeyPresent = a.some((k) => k.enseigneId == v.enseigneId);
      if (!isKeyPresent) {
       // console.log('PASSAGE : ',i )
        let tmp = { 
          enseigneId: v.enseigneId,
          nom: v.enseigneNom,
          distance: v.distance,
          criteresPercentage: [],
          produits: [],
        }
        //const critereMapping = {}
        criteresUtilisateur.map((c) => {
          const nbCrit = res.filter((r) => r.critere === c && v.enseigneId === r.enseigneId);
          const poids = nbCrit.reduce((acc, val) => acc + val.ponderation, 0);
          const totalCrit = produitsSelected.length;
          const moyenne = totalCrit !== 0 ? (poids/nbCrit.length)*100: 0;
          tmp['criteresPercentage'].push({nom: c, note: moyenne});
          //const crits = produitsSelected.map((k) => {
          //  const critMatchedProduits = nbCrit.filter((n) => n.matched && n.nomProduit === k)
          //})
        });
        catSelected.map((d) => {
          res.filter((b) => b.enseigneId === v.enseigneId && v.categorie === d.nom).map((f) => {
            if (!tmp['produits'].some((x) => x.nomProduit === f.nomProduit )) {
              let crits = [];
              //if (Object.keys(f.produit).length > 0) {
              // Produits pour une enseigne, qui matchent au moins un critère
              const critMatchedProduits = res.filter((g) => g.enseigneId === f.enseigneId && 
              g.categorie === f.categorie && g.matched &&
              f.nomProduit === g.nomProduit)
              //  .map((m, i, arr) => arr.filter((e) => e.produit._id === m.produit._id).map((f) => f.critere) )
              //}
              // Les articles eventuels des produits qui matchent
              let produitArticles = {}
              // Les critères qui matchent pour les produits
              let critereMatch = []
              for ( let m=criteresUtilisateur.length; m>0; m--) {
                let tempCrit = critMatchedProduits.filter((e, i, arr) => arr.filter((f) => f.produit._id === e.produit._id))
                //console.log('critMatchedProduits : ', critMatchedProduits);
                //console.log('TMPCRIT : ', tempCrit);
                let tempM = tempCrit.map((g) => g.critere)
                //console.log('TMPM : ', tempM);
                // Si un critere matche, on récupère l'article le moins cher
                if (tempM.length === m) {
                  produitArticles = tempCrit.sort((u, v) => u.produit.prix - v.produit.prix)[0].produit
                  critereMatch = tempM;
                  break;
                }
              }
              //console.log('Produits Articles : ', produitArticles);
              if (Object.keys(produitArticles).length === 0) {
                produitArticles = res.filter((f) => v.produit._id === f.produit._id)[0].produit
              }
              tmp['produits'].push({categorie: f.categorie, nomProduit: f.nomProduit, produit: produitArticles, criteres: critereMatch, quantite: f.quantite});
          }
          });
          if (tmp['produits']) {
            tmp['produits'].sort((c, d) => d.criteres.length - c.criteres.length);
          }
        });
        tmp['conformite'] = (tmp.criteresPercentage.reduce((acc, val) => acc + val.note, 0)/criteresUtilisateur.length).toFixed(2);
        //console.log('TMP : ', tmp);
        return a.concat(tmp)
      } else { return a}
    }, []);
    //console.log('Result status : Data sent - ', resultComparaison)
   res.json({result: true, resultComparaison});
});

/*
Route : GET - Get -liste details /getListe/:nom
IN : params =
              nom: liste_name 
Returns : 
    OK = { result: true, liste: {liste_detail} }
    KO = { result: false, error: error_message }
Description : This route returns the details for a liste
*/
router.get('/getListeByName/:nom', 
  async function (req, res, next) {
  try {
    const excludedFields = { 
      __v: false,
    };
    const listeDetails = await Liste.findOne({
      nom: req.params.nom      
    }, excludedFields);
    
    if (!listeDetails){
      res.json({result: false, error: `A liste with name ${req.params.nom} does not exist`});
      return;
    }
    res.json({ result: true, liste: listeDetails });
  } catch(err) {
    console.error(err.stack);
    res.json({result: false, error: "Failed to get liste details. Please see logs for more details"});
    next(err);
  }
});

/*
Route : GET - Get -liste details /getListe/:id
IN : params =
              id: liste_id 
Returns : 
    OK = { result: true, liste: {liste_detail} }
    KO = { result: false, error: error_message }
Description : This route returns the details for a liste
*/
router.get('/getListeByID/:id', 
  async function (req, res, next) {
  try {
    const excludedFields = { 
      __v: false,
    };
    const listeDetails = await Liste.findOne({
      _id: req.params.id
    }, excludedFields);
    
    if (!listeDetails){
      res.json({result: false, error: `A liste with id ${req.params.id} does not exist`});
      return;
    }
    res.json({ result: true, liste: listeDetails });
  } catch(err) {
    console.error(err.stack);
    res.json({result: false, error: "Failed to get liste details. Please see logs for more details"});
    next(err);
  }
});

/*
Route : GET - Get -listes for a user /getListes/:id
IN : params =
              id: user_id
Returns : 
    OK = { result: true, listes: [{liste_detail}] }
    KO = { result: false, error: error_message }
Description : This route returns all the liste for a given user
*/
router.get('/getListes/:id', 
  async function (req, res, next) {
  try {
    const excludedFields = { 
      __v: false,
    };
    const listeDetails = await Liste.find({
      utilisateur: req.params.id 
    }, excludedFields);
    
    if (listeDetails.length === 0){
      res.json({result: true, listes: []});
      return;
    }
    res.json({ result: true, listes: listeDetails });
  } catch(err) {
    console.error(err.stack);
    res.json({result: false, error: "Failed to get liste details. Please see logs for more details"});
    next(err);
  }
});

/*
Route : POST - Add liste - /listes/create
IN : body = { nom: String, adresseLivraison: {commune, nomDeRue, numeroDeRue,codePostal}, prix, listeArticles: 
              {id, categorieDeProduit,prix,quantite,enseigne,criteres},
              utilisateur: id_utilisateur, dateArriveePrevue,statutLivraison, dateCreation }
Returns : 
    OK = { result: true, liste: {} }
    KO = { result: false, error: error_message }

Description : This route is for creating a liste
*/
router.post('/create',
  body('nom').notEmpty(),
  body('utilisateur').notEmpty(),
  async function (req, res, next) {
  // validate params: nom and utilisateur are mandatory
   const result = validationResult(req);
    if (!result.isEmpty()) {
      res.json({result: false, error: result.array()})
      return
    }
    const nomListe = req.body.nom.toLowerCase()
    try {
      const findListe = await Liste.findOne({
        name: nomListe
      });
      if ( findListe === null) {
        const newListe = new Liste({
          ...req.body,
        });
        const newListeSave = await newListe.save();
        res.json({ result: true, liste: newListeSave });
      } else {
          // Liste already exists in database
          res.json({ result: false, error: `A liste with the name ${nomListe} already exists` });
      }
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Create liste failed. Please see logs for more details"});
      next(err);
    }
});

// Delete liste
router.delete('/delete/:id',
  async function (req, res, next) {
  // validate params: nom and utilisateur are mandatory
   //const result = validationResult(req);
    //if (!result.isEmpty()) {
    //  res.json({result: false, error: result.array()})
    //  return
    //}
    //const nomListe = req.body.nom.toLowerCase()
    try {
      const deleteRes = await Liste.deleteOne({
        _id: req.params.id
      });
      if (deleteRes.acknowledged) {
        if (deleteRes.deletedCount === 1) {
          res.json({result: true, msg: 'Liste deleted '});
        } else {
          res.json({result: true, msg: 'No liste has been deleted '});
        }
      } else {
          console.log('Delete request not acknowledged : ', deleteRes);
          res.json({result: false, error: 'Error with liste delete. See see logs for details'});
      }
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Create liste failed. Please see logs for more details"});
      next(err);
    }
});

// Update liste
// Same params for Create by with listeID for the mongodb ID
router.put('/update', 
  body('listeId').notEmpty(),
  async function (req, res, next) {
  // validate params: listeID is mandatory
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.json({result: false, error: result.array()})
      return
    }
    try {
      const excludedFields = { 
        __v: false,
        _id: false,
      };
      const listeDetails = await Liste.find({
        _id: req.body.listeId
      }, excludedFields);
      
      if (listeDetails.length === 0){
        res.json({result: false, error: `A liste with id ${req.body.listeId} does not exist`});
        return;
      }

      const mergedData = listeDetails[0];
      Object.assign(mergedData, req.body);
      const updatedData = await Liste.updateOne(
        { _id: req.body.listeId },
        mergedData
      );
      if ( updatedData.acknowledged) {
        const updateListeData = await Liste.find({
          _id: req.body.listeId
        }, excludedFields);
        res.json({ result: true, user: updateListeData[0] });
      } else {
        res.json({ result: false, message: "No Liste have been updated" });
      }

    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to update liste details. Please see logs for more details"});
      next(err);
    }
});

module.exports = router;
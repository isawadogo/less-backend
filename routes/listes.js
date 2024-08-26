var express = require('express');
var router = express.Router();

const { body, validationResult } = require('express-validator');

require('../models/connection');
//const User = require('../models/utilisateur');
const User = require('../models/utilisateur');
const Liste = require('../models/liste');
const API_KEY = process.env.ENSEIGNE_API_KEY;

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
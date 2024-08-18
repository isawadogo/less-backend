var express = require('express');
var router = express.Router();

require('../models/connection');
//const User = require('../models/utilisateur');
const User = require('../models/utilisateur');
const Liste = require('../models/liste');
const API_KEY = process.env.ENSEIGNE_API_KEY;

/*
Route : GET - Get -listes /getListe/:id
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
    const resTemp = await fetch(ens.backendURL + '/categories',
      {
        headers: { "Content-Type": "application/json", "authorization": API_KEY},
      }
    )
    const json = await resTemp.json();
    if (json.result) {
      //console.log(`categories enseigne ${ens.id} : ${json.categories}`);
      json.categories.map((c) => {if (!categoriesList.includes(c)) {categoriesList.push(c)}})
    }
    res.json({result: true, categories: categoriesList });
  } catch(err) {
    console.error(err.stack);
    res.json({result: false, error: "Failed to get categories list. Please see logs for more details"});
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
  async function (req, res, next) {
  // validate params: email and password are mandatory
   // const result = validationResult(req);
   // if (!result.isEmpty()) {
   //   res.json({result: false, error: result.array()})
   //   return
   // }
    try {
      const userDetails = await User.findOne({
        email: req.body.email
      });
      if (userDetails && bcrypt.compareSync(req.body.password, userDetails.motDePasse)) {
        res.json({ result: true, token: userDetails.token, id: userDetails._id });
      } else {
        res.json({ result: false, error: 'User not found or wrong password' });
      }
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Signup failed. Please see logs for more details"});
      next(err);
    }
});

// Delete liste

// Updalte liste

module.exports = router;
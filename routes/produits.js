var express = require('express');
var router = express.Router();

require('../models/connection');
//const User = require('../models/utilisateur');
const API_KEY = process.env.ENSEIGNE_API_KEY

const { produitBackend, enseignesList, enseigneBackend } = require('../modules/config')

//const { body, validationResult } = require('express-validator');
/*
Route : GET - Get categories - /produits/categories
IN : body = { }
Returns : 
    OK = { result: true, categories: [category_name] }
    KO = { result: false, error: error_message }
Description : This route returns all the categories we manage
*/
router.get('/enseignes', 
  async function (req, res, next) {
  try {
      const resTemp = await fetch(enseigneBackend,
        {
          headers: { "Content-Type": "application/json", "authorization": API_KEY},
        }
      )
      const json = await resTemp.json();
      //console.log('json enseigne list : ', json)
      if (json.result) {
        res.json({result: true, enseignes: json.enseignes })  
      } else {
        res.json({result: false, error: 'failed to get enseignes list from enseigne backend API'});
      }
  } catch(err) {
    console.error(err.stack);
    res.json({result: false, error: "Failed to get categories list. Please see logs for more details"});
    next(err);
  }
});


/*
Route : GET - Get categories - /produits/categories
IN : body = { }
Returns : 
    OK = { result: true, categories: [category_name] }
    KO = { result: false, error: error_message }
Description : This route returns all the categories we manage
*/
router.get('/categories', 
  async function (req, res, next) {
  try {
    let categoriesList = [];
    const resTemp = await fetch(enseigneBackend + '/getCategories',
      {
        headers: { "Content-Type": "application/json", "authorization": API_KEY},
      }
    )
    const json = await resTemp.json();
    if (json.result) {
      //console.log(`categories enseigne ${ens.id} : ${json.categories}`);
      res.json({result: true, categories: json.categories });
    } else {
      res.json({result: false, error: "Failed to get categories from backend "})
      console.log('Failed to get categories from backend :', res.json);
    }
  } catch(err) {
    console.error(err.stack);
    res.json({result: false, error: "Failed to get categories list. Please see logs for more details"});
    next(err);
  }
});

/*
Route : GET - Get categories - /produits/categories/:id?nomProduit&page=pageNumber&limit=resultsPerPage
IN : body = 
Returns : 
    OK = { result: true, produits: [{ id: category_id, name: category_name}] }
    KO = { result: false, error: error_message }
Description : This route returns all the products for a given category
*/
router.get('/categories/:id', 
  async function (req, res, next) {

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  //const offset = (page - 1) * limit;
  //const nomProduit = req.query.nomProduit || '';
  const nomProduit = req.query.nomProduit ;

  let totalProduits = 0;

  let reqURL = produitBackend + '/categories/' + req.params.id + '?page=' + page + '&limit=' + limit
  if (nomProduit) {
    reqURL = produitBackend + '/categories/' + req.params.id + '?nomProduit=' + nomProduit +'&page=' + page + '&limit=' + limit 
  }
  try {
    const resTemp = await fetch(reqURL,
      {
        headers: { "Content-Type": "application/json", "authorization": API_KEY},
      }
    )
    const json = await resTemp.json();
    if (json.result) {
      //console.log(`categories enseigne ${ens.id} : ${json.categories}`);
      //json.categories.map((c) => {if (!categoriesList.includes(c)) {categoriesList.push(c)}})
      totalProduits += json.totalProduits
      res.json({result: true, produits: json.produits, totalProduits: totalProduits });
    } else {
      res.json({result: false, error: `call to backend did not succed. lease see logs for more details`})
    }
  } catch (err) {
    console.error(err.stack);
    res.json({result: false, error: `Failed to get produits for ${eq.params.id} . Please see logs for more details`});
    next(err);
  }
});

/*
Route : GET - Get product details - /produits/:id
IN : body = { }
Returns : 
    OK = { result: true, produit: [{ id: category_id, name: category_name}] }
    KO = { result: false, error: error_message }
Description : This route returns all the products for a given category
*/
router.get('/details/:id', 
  async function (req, res, next) {
  // validate params: email and password are mandatory
    try {
      const resTemp = await fetch(produitBackend + '/' + req.params.id,
      {
        headers: { "Content-Type": "application/json", "authorization": API_KEY},
      }
      );
      const resJson = await resTemp.json();
      if (!resJson.result ){
        res.json({result: false, error: `Failed to produit with id ${req.params.id} : error from backend : ${resJson.error}`});
      } else {
        if (!resJson.produit) {
          res.json({result: false, error: `Failed to produit with id ${req.params.id} : produit key is empty`});
        } else {
          res.json({ result: true, produit: resJson.produit});
        }
      }
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to get produit detalils. Please see logs for more details"});
      next(err);
    }
});
/*
Route : GET - Get categories - /produits/produitsNom/:id
IN : body = 
Returns : 
    OK = { result: true, produits: [{ url: url_produit, nom: nom_produit}] }
    KO = { result: false, error: error_message }
Description : This route returns all the products for a given category
*/
router.get('/categories/produitsNom/:id', 
  async function (req, res, next) {

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  //const offset = (page - 1) * limit;

  try {
    //const resTemp = await fetch(backendURL + '/produits/nomsProduit/' + req.params.id + '?page=' + page + '&limit=' + limit,
    const resTemp = await fetch(produitBackend + '/nomsProduit/' + req.params.id,
      {
        headers: { "Content-Type": "application/json", "authorization": API_KEY},
      }
    )
    const json = await resTemp.json();
    if (json.result) {
      //console.log(`categories enseigne ${ens.id} : ${json.categories}`);
      //json.categories.map((c) => {if (!categoriesList.includes(c)) {categoriesList.push(c)}})
      res.json({result: true, produits: json.produits});
    } else {
      res.json({result: false, error: `call to backend  did not succed. lease see logs for more details`})
    }
  } catch (err) {
    console.error(err.stack);
    res.json({result: false, error: `Failed to get produits for ${req.params.id}. Please see logs for more details`});
    next(err);
  }
});

module.exports = router;
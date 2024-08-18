var express = require('express');
var router = express.Router();

require('../models/connection');
//const User = require('../models/utilisateur');
const API_KEY = process.env.ENSEIGNE_API_KEY

const { produitBackend, enseignesList } = require('../modules/config')

//const { body, validationResult } = require('express-validator');

/* Route : GET - Get categories - /produits/categories
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
    for (const ens of enseignesList) {
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
    }
    res.json({result: true, categories: categoriesList });
  } catch(err) {
    console.error(err.stack);
    res.json({result: false, error: "Failed to get categories list. Please see logs for more details"});
    next(err);
  }
  try {
    let categoriesList = [];
    for (const ens of enseignesList) {
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
    }
    res.json({result: true, categories: categoriesList });
  } catch(err) {
    console.error(err.stack);
    res.json({result: false, error: "Failed to get categories list. Please see logs for more details"});
    next(err);
  }
});

/* Route : GET - Get categories - /produits/categories/:id
IN : body = { }
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

  let totalProduits = 0;

  let categoriesList = [];
  for (const ens of enseignesList) {
    try {
      const resTemp = await fetch(ens.backendURL + '/categories/' + req.params.id + '?page=' + page + '&limit=' + limit,
        {
          headers: { "Content-Type": "application/json", "authorization": API_KEY},
        }
      )
      const json = await resTemp.json();
      if (json.result) {
        //console.log(`categories enseigne ${ens.id} : ${json.categories}`);
        //json.categories.map((c) => {if (!categoriesList.includes(c)) {categoriesList.push(c)}})
        categoriesList.push(...json.produits)
        totalProduits += json.totalProduits

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  //const offset = (page - 1) * limit;

  let totalProduits = 0;

  let categoriesList = [];
  for (const ens of enseignesList) {
    try {
      const resTemp = await fetch(ens.backendURL + '/categories/' + req.params.id + '?page=' + page + '&limit=' + limit,
        {
          headers: { "Content-Type": "application/json", "authorization": API_KEY},
        }
      )
      const json = await resTemp.json();
      if (json.result) {
        //console.log(`categories enseigne ${ens.id} : ${json.categories}`);
        //json.categories.map((c) => {if (!categoriesList.includes(c)) {categoriesList.push(c)}})
        categoriesList.push(...json.produits)
        totalProduits += json.totalProduits
      } else {
        res.json({result: false, error: `call to enseigne ${ens} did not succed. lease see logs for more details`})
        continue
        res.json({result: false, error: `call to enseigne ${ens} did not succed. lease see logs for more details`})
        continue
      }
    } catch (err) {
    } catch (err) {
      console.error(err.stack);
      res.json({result: false, error: `Failed to get produits for ${eq.params.id} on enseigne ${ens}. Please see logs for more details`});
      res.json({result: false, error: `Failed to get produits for ${eq.params.id} on enseigne ${ens}. Please see logs for more details`});
      next(err);
    }
  }
  res.json({result: true, produits: categoriesList, totalProduits: totalProduits });
  }
  res.json({result: true, produits: categoriesList, totalProduits: totalProduits });
});

/* Route : GET - Get product details - /produits/:id
IN : body = { }
Returns : 
    OK = { result: true, produit: [{ id: category_id, name: category_name}] }
    KO = { result: false, error: error_message }
Description : This route returns all the products for a given category
*/
router.get('/details/:id', 
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
        if (!resJson.produit) {
          res.json({result: false, error: `Failed to produit with id ${req.params.id} : produit key is empty`});
        } else {
          res.json({ result: true, produit: resJson.produit});
        }
      }
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to get produit detalils. Please see logs for more details"});
      res.json({result: false, error: "Failed to get produit detalils. Please see logs for more details"});
      next(err);
    }
});

module.exports = router;
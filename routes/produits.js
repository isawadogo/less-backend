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
  // validate params: email and password are mandatory
    /*const result = validationResult(req);
    if (!result.isEmpty()) {
      res.json({result: false, error: result.array()})
      return
    }*/
    try {
      const excludedFields = { 
        __v: false,
        _id: false,
        motDePasse: false,
      };
      const userDetails = await User.find({
        _id: req.body.userId
      }, excludedFields);
      
      if (userDetails.length === 0){
        res.json({result: false, error: `User with id ${req.body.userId} does not exist`});
        return;
      }

      const mergedData = userDetails[0];
      Object.assign(mergedData, req.body);
      const updatedData = await User.updateOne(
        { _id: req.body.userId },
        mergedData
      );
      if ( updatedData.acknowledged) {
        const updateUserData = await User.find({
          _id: req.body.userId
        }, excludedFields);
        res.json({ result: true, user: updateUserData[0] });
      } else {
        res.json({ result: false, message: "No User have been updated" });
      }

    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to update user details. Please see logs for more details"});
      next(err);
    }
});

/* Route : GET - Get product details - /produits/:id
IN : body = { }
Returns : 
    OK = { result: true, produit: [{ id: category_id, name: category_name}] }
    KO = { result: false, error: error_message }
Description : This route returns all the products for a given category
*/
router.get('/:id', 
  async function (req, res, next) {
  // validate params: email and password are mandatory
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.json({result: false, error: result.array()})
      return
    }
    try {
      const userDetails = await User.findOne({
        _id: req.body.userId
      });
      
      if (userDetails === null){
        res.json({result: false, error: `User with id ${req.body.userId} does not exist`});
        return;
      }
      
      const hash = bcrypt.hashSync(req.body.password, HASH_ROUNDS);

      const updatedData = await User.updateOne(
        { _id: req.body.userId },
        { motDePasse: hash }
      );
      if ( updatedData.acknowledged) {
        res.json({ result: true, message: "User password successfully updated" });
      } else {
        res.json({ result: false, message: "The password has not been updated" });
      }

    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to update user password. Please see logs for more details"});
      next(err);
    }
});

module.exports = router;
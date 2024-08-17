const express = require('express');
const router = express.Router();

require('../models/connection');
const User = require('../models/utilisateur');

const { body, validationResult } = require('express-validator');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

const HASH_ROUNDS = 10;
const UID_LENGTH = 32;

/* Route : POST - User login - /utilisateur/signin
IN : body = {  email: String, password: String }
Returns : 
    OK = { result: true, token: The_User_Token, id: ObjectId }
    KO = { result: false, error: error_message }

Description : This will just create the user in the DB, its profil update will
              be handled by  the route /utilisateur/update
*/
router.post('/signin', 
  body('email').notEmpty(),
  body('password').notEmpty(),
  async function (req, res, next) {
  // validate params: email and password are mandatory
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.json({result: false, error: result.array()})
      return
    }
    try {
      const findUser = await User.findOne({ email: req.body.email })
      console.log(findUser)
      if ( findUser === null) {
          const hash = bcrypt.hashSync(req.body.password, HASH_ROUNDS);
          const newUser = new User({
            email: req.body.email,
            motDePasse: hash,
            token: uid2(UID_LENGTH),
          });
          const newUserSave = await newUser.save();
          res.json({ result: true, token: newUserSave.token, id: newUserSave._id });
      } else {
          // User already exists in database
          res.json({ result: false, error: `A user with email ${req.body.email} already exists` });
      }
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed create user. Please see logs for more details"});
      next(err);
  }
});

/* Route : POST - User data update - /utilisateur/update
IN : body = { usedId: ObjectId: nom: String, prenom: String, dateDeNaissance, notifications: [String],
              telephone: String, prefixe: String, profilConso: String,
              criteres: { local: Boolean, bio: Boolean, vegeterien: Boolean, vegan: Boolean
                          premierPrix: Boolean, faibleEnMatiereGrasse: Boolean, faibleEnSucre: Boolean,
                          faibleEmpreinte: Boolean, allergies: [String], budget: Number, distance: Number},
              adresses: [{ commune: String, codePostal: Number, nomDeRue: String, numeroDeRue: String}] },
              preferences: { afficheEcranAccueil: Boolean, recevoirNotifications: Boolean }
Returns : 
    OK = { result: true, token: The_User_Token }
    KO = { result: false, error: error_message }

Description : This route updates user details except the password
*/
router.post('/update', 
  body('userId').notEmpty(),
  async function (req, res, next) {
  // validate params: email and password are mandatory
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.json({result: false, error: result.array()})
      return
    }
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

/* Route : POST - User password update - /utilisateur/updatePassword
IN : body = { usedId: ObjectId, password: String }
Returns : 
    OK = { result: true }
    KO = { result: false, error: error_message }

Description : This route will update the user password
*/
router.post('/updatePassword', 
  body('password').notEmpty(),
  body('userId').notEmpty(),
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

/* Route : POST - User signup- /utilisateur/signup
IN : body = { email: ObjectId, password: String }
Returns : 
    OK = { result: true }
    KO = { result: false, error: error_message }

Description : This route allows user signup
*/
router.post('/signup',
  body('password').notEmpty(),
  body('email').notEmpty(),
  async function (req, res, next) {
  // validate params: email and password are mandatory
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.json({result: false, error: result.array()})
      return
    }
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

/* Route : GET - User signup- /utilisateur/details/:userID
IN : body = {  }
Returns : 
    OK = { result: true, user: UserDetailsFromMongoDB }
    KO = { result: false, error: error_message }

Description : This route retrieves user details except password
*/
router.get('/details/:userId', async function (req, res, next) {
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
        _id: req.params.userId
      }, excludedFields);
      
      if (userDetails.length === 0){
        res.json({result: false, error: `User with id ${req.params.userId} does not exist`});
        return;
      }

      res.json({ result: true, user: userDetails[0] });

    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to get user details. Please see logs for more details"});
      next(err);
    }
});

module.exports = router;
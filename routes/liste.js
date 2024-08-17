const express = require('express');
const router = express.Router();

/* Route : GET - User budget - /utilisateur/budget/:token
IN : user token
Returns :
  OK = { result: true, budget: UserBudgetFromMongoDB }
  KO = { result: false, error: error_message }

Description : This route retrieves user's budget detail with user token
*/

modules.exports = router;
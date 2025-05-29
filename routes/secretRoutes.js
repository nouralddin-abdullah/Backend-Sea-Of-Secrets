const express = require("express");
const router = express.Router();
const secretsController = require("../controllers/secretController");

// Routes
router
  .route('/')
  .get(secretsController.getAllSecrets)
  .post(secretsController.getAllSecrets); // Support POST for large seenSecrets arrays

router
  .route('/create')
  .post(secretsController.createSecret);

router
  .route('/:id')
  .get(secretsController.getSecret);

router
  .route('/delete')
  .delete(secretsController.deleteSecret);

module.exports = router;
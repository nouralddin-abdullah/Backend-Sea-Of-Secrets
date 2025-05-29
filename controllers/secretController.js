const Secret = require("../models/secretModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const crypto = require("crypto");

// Create a new secret
exports.createSecret = catchAsync(async (req, res, next) => {
  console.log('Request body:', req.body); // Debug log
  console.log('Request headers:', req.headers); // Debug headers
  console.log('Content type:', req.headers['content-type']); // Debug content type
  console.log('Raw body keys:', Object.keys(req.body)); // Debug body keys
  
  const { content } = req.body;
  
  console.log('Extracted content:', content); // Debug extracted content
  console.log('Content type:', typeof content); // Debug content type
  console.log('Content length:', content ? content.length : 'undefined'); // Debug content length

  if (!content || content.trim() === '') {
    return next(new AppError("Content is required to create a secret", 400));
  }

  // Generate a unique key for the secret
  const key = crypto.randomBytes(16).toString('hex');

  const newSecret = await Secret.create({
    content,
    key,
    isDeleted: false
  });

  res.status(201).json({
    status: 'success',
    data: {
      secret: {
        id: newSecret._id,
        key: newSecret.key,
        createdAt: newSecret.createdAt
      }
    }
  });
});

// Get random secrets for reels-like experience (without content)
exports.getAllSecrets = catchAsync(async (req, res, next) => {
  // Filter out deleted secrets
  const filter = { isDeleted: { $ne: true } };
  
  // Get limit from query params or default to 10
  const limit = req.query.limit * 1 || 10;
  
  // Get array of seen secret IDs from request body or query params
  let seenSecretIds = [];
  
  // Check if seen IDs are provided in request body (for POST-like behavior)
  if (req.body && req.body.seenSecrets && Array.isArray(req.body.seenSecrets)) {
    seenSecretIds = req.body.seenSecrets;
  }
  // Check if seen IDs are provided as query parameter (comma-separated string)
  else if (req.query.seenSecrets) {
    seenSecretIds = req.query.seenSecrets.split(',').filter(id => id.trim());
  }
  
  // Convert string IDs to ObjectIds and add to filter
  if (seenSecretIds.length > 0) {
    try {
      const mongoose = require('mongoose');
      const objectIds = seenSecretIds.map(id => new mongoose.Types.ObjectId(id.trim()));
      filter._id = { $nin: objectIds };
    } catch (error) {
      return next(new AppError('Invalid secret IDs provided in seenSecrets', 400));
    }
  }
  
  // Use MongoDB aggregation to get random secrets
  const secrets = await Secret.aggregate([
    // Match non-deleted secrets and exclude seen ones
    { $match: filter },
    // Randomly sample documents
    { $sample: { size: limit } },
    // Exclude sensitive fields
    {
      $project: {
        content: 0,
        key: 0,
        __v: 0
      }
    }
  ]);
  
  // Get total count for info (excluding seen secrets)
  const total = await Secret.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: secrets.length,
    total: total,
    excluded: seenSecretIds.length,
    data: {
      secrets
    }
  });
});

// Get one secret by ID (with content)
exports.getSecret = catchAsync(async (req, res, next) => {
  const secret = await Secret.findById(req.params.id).select('-key -__v');

  if (!secret || secret.isDeleted) {
    return next(new AppError('No secret found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      secret
    }
  });
});

// Soft delete secret using key
exports.deleteSecret = catchAsync(async (req, res, next) => {
  const { key } = req.body;

  if (!key) {
    return next(new AppError('Key is required to delete a secret', 400));
  }

  const secret = await Secret.findOneAndUpdate(
    { key, isDeleted: { $ne: true } },
    { isDeleted: true },
    { new: true }
  );

  if (!secret) {
    return next(new AppError('No secret found with that key or secret already deleted', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Secret successfully deleted'
  });
});



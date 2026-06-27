const express = require('express');
const router = express.Router();
const { submitInquiry, getInquiries } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(submitInquiry)
  .get(protect, authorize('Admin'), getInquiries);

module.exports = router;

const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const verifyToken = require("../middlewares/auth.middleware");

router.post("/", verifyToken, reviewController.addReview);
router.get("/:productId", reviewController.getReviews);

module.exports = router;

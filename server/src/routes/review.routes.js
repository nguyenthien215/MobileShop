const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const verifyToken = require("../middlewares/auth.middleware");

// Thêm /eligible để client biết có thể đánh giá hay không
router.post("/", verifyToken, reviewController.addReview);
router.get("/:productId", reviewController.getReviews);
router.get("/eligible/:productId", verifyToken, reviewController.getEligibility);

module.exports = router;
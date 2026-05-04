const express = require("express");
const profileController = require("./profile.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

router.get("/me", authMiddleware, profileController.getMyProfile);
router.patch("/me", authMiddleware, profileController.updateMyProfile);

module.exports = router;
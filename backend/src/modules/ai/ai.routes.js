const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");
const validateDto = require("../../middlewares/validate.middleware");
const { classifyPublicationDto } = require("./ai.dto");
const aiController = require("./ai.controller");

const router = express.Router();

router.post(
  "/classify",
  authMiddleware,
  requireRole("docente", "admin"),
  validateDto(classifyPublicationDto),
  aiController.classifyPublicationController
);

module.exports = router;

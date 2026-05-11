const express = require("express");
const publicationController = require("./publication.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requireRole("docente"),
  publicationController.createPublication
);

router.get(
  "/",
  authMiddleware,
  requireRole("docente", "admin"),
  publicationController.getPublicationFeed
);

module.exports = router;
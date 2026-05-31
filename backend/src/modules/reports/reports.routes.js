const express = require("express");
const reportsController = require("./reports.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");

const router = express.Router();

router.get("/posts",
    authMiddleware,
    requireRole("admin", "moderator"),
    reportsController.getReportedPosts);

router.get("/",
    authMiddleware,
    requireRole("admin", "moderator"),
    reportsController.getAllReports);

router.get("/:postId",
    authMiddleware,
    requireRole("admin", "moderator"),
    reportsController.getReportsByPostId);

router.post("/:postId",
    authMiddleware,
    reportsController.createReport);

router.delete("/:postId",
    authMiddleware,
    requireRole("admin", "moderator"),
    reportsController.deleteReports);

router.get("/:postId/total",
    authMiddleware,
    requireRole("admin", "moderator"),
    reportsController.getTotalReportsByPostId);

module.exports = router;
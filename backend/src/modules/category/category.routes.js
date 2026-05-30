const express = require("express");
const categoryController = require("./category.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");
const validateDto = require("../../middlewares/validate.middleware");
const { categoryCreateDto, categoryUpdateDto } = require("./category.dto");

const router = express.Router();

router.get("/", authMiddleware, categoryController.getCategories);
router.post("/", authMiddleware, validateDto(categoryCreateDto), requireRole("admin"), categoryController.postCategory);
router.put("/:id", authMiddleware, validateDto(categoryUpdateDto), requireRole("admin"), categoryController.updateCategory);
router.delete("/:id", authMiddleware, requireRole("admin"), categoryController.deleteCategory);

module.exports = router;
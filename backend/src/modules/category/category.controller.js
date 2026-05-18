const categoryService = require("./category.service");
const { ApiResponse } = require("../../config/api.response");
const categoryDto = require("./category.dto");

async function getCategories(req, res, next) {
    try {
        const categories = await categoryService.getCategories();

        const apiResponse = new ApiResponse(true, 200, "Categorías obtenidas correctamente", categories);
        return res.status(200).json(apiResponse);
    } catch (error) {
        next(error);
    }
}

async function postCategory(req, res, next) {
    try {
        const categoryData = await categoryService.postCategory(req.body);

        const apiResponse = new ApiResponse(true, 201, "Categoría creada correctamente", categoryData);
        return res.status(201).json(apiResponse);
    } catch (error) {
        next(error);
    }
}

async function updateCategory(req, res, next) {
    try {
        const id = Number(req.params.id);
        const categoryData = await categoryService.updateCategory(id, req.body);

        const apiResponse = new ApiResponse(true, 200, "Categoría actualizada correctamente", categoryData);
        return res.status(200).json(apiResponse);
    } catch (error) {
        next(error);
    }
}

async function deleteCategory(req, res, next) {
    try {
        const id = Number(req.params.id);
        const categoryData = await categoryService.deleteCategory(id);

        return res.status(204).json();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCategories,
    postCategory,
    updateCategory,
    deleteCategory
}
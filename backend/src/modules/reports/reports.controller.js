const { ApiResponse } = require("../../config/api.response");
const reportsService = require("./reports.service");

async function getAllReports(req, res, next) {
  try {
    const reports = await reportsService.getAllReports();
    res.status(200).json(new ApiResponse(true, 200, "Reportes obtenidos", reports));
  } catch (err) {
    next(err);
  }
}

async function getReportsByPostId(req, res, next) {
  try {
    const postId = parseInt(req.params.postId, 10);
    const reports = await reportsService.getReportsByPostId(postId);
    res.status(200).json(new ApiResponse(true, 200, "Reportes obtenidos", reports));
  } catch (err) {
    next(err);
  }
}

async function createReport(req, res, next) {
  try {
    const postId = parseInt(req.params.postId, 10);
    const userId = req.user.id;
    const report = await reportsService.createReport(postId, userId);
    res.status(201).json(new ApiResponse(true, 201, "Reporte creado", report));
  } catch (err) {
    next(err);
  }
}

async function deleteReports(req, res, next) {
  try {
    const postId = parseInt(req.params.postId, 10);
    const reports = await reportsService.deleteReports(postId);
    res.status(200).json(new ApiResponse(true, 200, "Reportes eliminados", reports));
  } catch (err) {
    next(err);
  }
}

async function getTotalReportsByPostId(req, res, next) {
  try {
    const postId = parseInt(req.params.postId, 10);
    const totalReports = await reportsService.getTotalReportsByPostId(postId);
    res.status(200).json(new ApiResponse(true, 200, "Total de reportes", totalReports));
  } catch (err) {
    next(err);
  }
}

async function getReportedPosts(req, res, next) {
  try {
    const posts = await reportsService.getReportedPosts();
    res.status(200).json(new ApiResponse(true, 200, "Publicaciones reportadas obtenidas", posts));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllReports,
  getReportsByPostId,
  createReport,
  deleteReports,
  getTotalReportsByPostId,
  getReportedPosts
};
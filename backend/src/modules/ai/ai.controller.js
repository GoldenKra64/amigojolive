const { ApiResponse } = require("../../config/api.response");
const aiService = require("./ai.service");

async function classifyPublicationController(req, res, next) {
  try {
    const result = await aiService.classifyPublication({
      title: req.body.title,
      content: req.body.content,
      postId: req.body.postId,
      applyTags: req.body.applyTags,
      user: req.user,
    });

    return res.status(200).json(
      new ApiResponse(true, 200, "Clasificación generada correctamente", result)
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  classifyPublicationController,
};

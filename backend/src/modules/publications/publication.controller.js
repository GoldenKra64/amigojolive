const publicationService = require("./publication.service");

async function createPublication(req, res, next) {
  try {
    const publication = await publicationService.createPublication({
      title: req.body.title,
      content: req.body.content,
      isAnonymous: req.body.isAnonymous,
      authorId: req.user.id,
    });

    return res.status(201).json({
      message: "Publicación creada correctamente",
      data: publication,
    });
  } catch (error) {
    next(error);
  }
}

async function getPublicationFeed(req, res, next) {
  try {
    const publications = await publicationService.getPublicationFeed();

    return res.status(200).json({
      message: "Feed de publicaciones obtenido correctamente",
      data: publications,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPublication,
  getPublicationFeed,
};
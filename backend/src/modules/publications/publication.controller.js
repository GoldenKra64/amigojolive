const publicationService = require("./publication.service");
const { ApiResponse } = require("../../config/api.response");
const { listPublicationsDto } = require("./publication.dto");

async function createPublication(req, res, next) {
  try {
    const publication = await publicationService.createPublication({
      title: req.body.title,
      content: req.body.content,
      isAnonymous: req.body.isAnonymous,
      tagIds: req.body.tags,
      authorId: req.user.id,
      files: req.files || [],
    });

    return res.status(201).json(new ApiResponse(true, 201, "Publicación creada correctamente", publication));
  } catch (error) {
    next(error);
  }
}

async function getPublicationFeed(req, res, next) {
  try {
    const parsed = listPublicationsDto.safeParse(req.query);
    const tagIds = parsed.success ? parsed.data.tagIds : undefined;

    const publications = await publicationService.getPublicationFeed({ tagIds });

    return res.status(200).json(new ApiResponse(true, 200, "Publicaciones obtenidas correctamente", publications));
  } catch (error) {
    next(error);
  }
}

async function getPublicationById(req, res, next) {
  try {
    const publication = await publicationService.getPublicationById(Number(req.params.id));

    return res.status(200).json(
      new ApiResponse(true, 200, "Publicación obtenida correctamente", publication)
    );
  } catch (error) {
    next(error);
  }
}

async function updatePublication(req, res, next) {
  try {
    const publication = await publicationService.updatePublication(
      Number(req.params.id),
      req.user.id,
      req.body
    );

    return res.status(200).json(new ApiResponse(true, 200, "Publicación actualizada correctamente", publication));
  } catch (error) {
    next(error);
  }
}

async function deletePublication(req, res, next) {
  try {
    const result = await publicationService.deletePublication(
      Number(req.params.id),
      req.user
    );

    return res.status(200).json(new ApiResponse(true, 200, "Publicación eliminada correctamente", result));
  } catch (error) {
    next(error);
  }
}

async function getPublicationAttachments(req, res, next) {
  try {
    const attachments = await publicationService.getPublicationAttachments(
      Number(req.params.id)
    );

    return res.status(200).json(
      new ApiResponse(true, 200, "Adjuntos obtenidos correctamente", attachments)
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPublication,
  getPublicationFeed,
  getPublicationById,
  updatePublication,
  deletePublication,
  getPublicationAttachments,
};

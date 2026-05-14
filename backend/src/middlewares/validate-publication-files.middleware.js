const { ApiResponse } = require("../config/api.response");

const MAX_IMAGE_SIZE_MB = 2;
const MAX_PDF_SIZE_MB = 10;
const MAX_IMAGES = 4;
const MAX_PDFS = 1;

function validatePublicationFiles(req, res, next) {
  const files = req.files || [];

  const images = files.filter((f) => f.mimetype.startsWith("image/"));
  const documents = files.filter((f) => f.mimetype === "application/pdf");

  if (images.length > MAX_IMAGES) {
    return res
      .status(400)
      .json(new ApiResponse(false, 400, `Máximo ${MAX_IMAGES} imágenes por publicación`, {}));
  }

  if (documents.length > MAX_PDFS) {
    return res
      .status(400)
      .json(new ApiResponse(false, 400, `Máximo ${MAX_PDFS} PDF por publicación`, {}));
  }

  for (const image of images) {
    const limitBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
    if (image.size > limitBytes) {
      return res.status(400).json(
        new ApiResponse(
          false,
          400,
          `La imagen "${image.originalname}" supera el límite de ${MAX_IMAGE_SIZE_MB} MB`,
          {}
        )
      );
    }
  }

  for (const doc of documents) {
    const limitBytes = MAX_PDF_SIZE_MB * 1024 * 1024;
    if (doc.size > limitBytes) {
      return res.status(400).json(
        new ApiResponse(
          false,
          400,
          `El PDF "${doc.originalname}" supera el límite de ${MAX_PDF_SIZE_MB} MB`,
          {}
        )
      );
    }
  }

  next();
}

module.exports = validatePublicationFiles;

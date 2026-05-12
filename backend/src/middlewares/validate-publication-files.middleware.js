function validatePublicationFiles(
  req,
  res,
  next
) {

  const files = req.files || [];

  const images =
    files.filter(
      f =>
        f.mimetype.startsWith("image/")
    );

  const documents =
    files.filter(
      f =>
        f.mimetype ===
        "application/pdf"
    );

  if (images.length > 4) {

    return res.status(400).json({
      message:
        "Máximo 4 imágenes",
    });

  }

  if (documents.length > 1) {

    return res.status(400).json({
      message:
        "Máximo 1 PDF",
    });

  }

  for (const image of images) {

    if (image.size > 100 * 1024) {

      return res.status(400).json({
        message:
          "Las imágenes no pueden superar 100KB",
      });

    }
  }

  for (const doc of documents) {

    if (doc.size > 1024 * 1024) {

      return res.status(400).json({
        message:
          "El PDF no puede superar 1MB",
      });

    }
  }

  next();
}

module.exports =
  validatePublicationFiles;
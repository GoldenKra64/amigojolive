const { ApiResponse } = require("../config/api.response");
const FileType = require("file-type");
const fs = require("fs");
const prisma = require("../lib/prisma");

const MAX_IMAGE_SIZE_MB = 2;
const MAX_DOCUMENT_SIZE_MB = 10;
const MAX_IMAGES = 4;
const MAX_DOCUMENTS = 1;

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

async function validatePublicationFiles(req, res, next) {
  try {
    const files = req.files || [];

    const images = files.filter((f) => f.mimetype.startsWith("image/"));
    const documents = files.filter((f) => DOCUMENT_MIME_TYPES.has(f.mimetype));

    if (images.length > MAX_IMAGES) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, `Máximo ${MAX_IMAGES} imágenes por publicación`, {}));
    }

    if (documents.length > MAX_DOCUMENTS) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, `Máximo ${MAX_DOCUMENTS} documento por publicación`, {}));
    }

    // Validación de Magic Numbers
    for (const file of files) {
      // Analiza los primeros bytes del archivo
      const fileTypeResult = await FileType.fromFile(file.path);
      const mimeReal = fileTypeResult ? fileTypeResult.mime : "unknown";
      
      // text/plain y application/msword y application/vnd.ms-excel a veces no son detectados bien por file-type
      // Para simplificar, nos aseguramos que si es detectado, coincida parcialmente o sea aceptable.
      // Aquí comparamos si el detectado es totalmente diferente al reclamado o si se intentó subir un tipo prohibido
      // y se camufló. Lo principal es si detectamos un ejecutable o si el detectado no concuerda con el mimetype reclamado.
      
      const isTextFile = file.mimetype === "text/plain" && mimeReal === "unknown"; // file-type no siempre detecta text/plain
      const isOfficeDocument = (file.mimetype === "application/msword" || file.mimetype === "application/vnd.ms-excel") && mimeReal === "unknown"; // .doc o .xls antiguos
      
      if (!isTextFile && !isOfficeDocument && fileTypeResult && !file.mimetype.includes(mimeReal) && mimeReal !== file.mimetype) {
         // Validaciones específicas porque ms-office puede ser detectado como application/zip (los docx, xlsx)
         const isDocxOrXlsx = file.mimetype.includes("openxmlformats") && mimeReal === "application/zip";
         if (!isDocxOrXlsx) {
            // ¡Peligro de seguridad! El archivo no es lo que dice ser
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path); // Borramos el archivo malicioso
            }

            // Registramos el incidente
            const userId = req.user ? req.user.id : 0; // Asumiendo que el ID del usuario está en req.user
            await prisma.securityIncident.create({
              data: {
                userId,
                fileName: file.originalname,
                attemptedMime: file.mimetype,
                detectedMime: mimeReal,
                status: "PENDING",
              },
            });

            return res.status(400).json(
              new ApiResponse(false, 400, `Alerta de Seguridad: El archivo "${file.originalname}" está camuflado o es malicioso y ha sido bloqueado.`, {})
            );
         }
      }
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
      const limitBytes = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;
      if (doc.size > limitBytes) {
        let documentLabel = "archivo Excel";
        if (doc.mimetype === "application/pdf") documentLabel = "PDF";
        else if (doc.mimetype.includes("wordprocessingml") || doc.mimetype === "application/msword") documentLabel = "documento Word";
        else if (doc.mimetype === "text/plain") documentLabel = "archivo de texto";
        
        return res.status(400).json(
          new ApiResponse(
            false,
            400,
            `El ${documentLabel} "${doc.originalname}" supera el límite de ${MAX_DOCUMENT_SIZE_MB} MB`,
            {}
          )
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = validatePublicationFiles;

const { z } = require("zod");

const createPublicationDto = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio")
    .max(150, "Máximo 150 caracteres"),

  content: z
    .string()
    .trim()
    .min(1, "El contenido es obligatorio"),

  isAnonymous: z
    .union([
      z.boolean(),
      z.string().transform(
        value => value === "true"
      )
    ])
    .optional(),
});

const updatePublicationDto = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(150)
    .optional(),

  content: z
    .string()
    .trim()
    .min(1)
    .optional(),

  isAnonymous: z
    .boolean()
    .optional(),

  status: z.enum([
    "PUBLISHED",
    "ARCHIVED",
    "HIDDEN",
  ]).optional(),
});

module.exports = {
  createPublicationDto,
  updatePublicationDto,
};
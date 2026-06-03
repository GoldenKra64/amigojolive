const { z } = require("zod");

const classifyPublicationDto = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  postId: z.coerce.number().int().positive().optional(),
  applyTags: z.boolean().optional().default(false),
});

module.exports = {
  classifyPublicationDto,
};

const { z } = require("zod");

const categoryCreateDto = z.object({
    name: z.string().min(1).max(100)
});

const categoryUpdateDto = z.object({
    name: z.string().min(1).max(100).optional()
});

module.exports = {
    categoryCreateDto,
    categoryUpdateDto
}
const prisma = require("../../lib/prisma");

function validateCreatePublicationInput({ title, content, isAnonymous }) {
  if (!title || typeof title !== "string" || !title.trim()) {
    const error = new Error("El título de la publicación es obligatorio");
    error.statusCode = 400;
    throw error;
  }

  if (title.trim().length > 150) {
    const error = new Error("El título no puede superar los 150 caracteres");
    error.statusCode = 400;
    throw error;
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    const error = new Error("El contenido de la publicación es obligatorio");
    error.statusCode = 400;
    throw error;
  }

  if (typeof isAnonymous !== "undefined" && typeof isAnonymous !== "boolean") {
    const error = new Error("El campo isAnonymous debe ser verdadero o falso");
    error.statusCode = 400;
    throw error;
  }
}

function mapPostToResponse(post) {
  const shouldHideAuthor = post.isAnonymous;

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    isAnonymous: post.isAnonymous,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: shouldHideAuthor
      ? {
          id: null,
          firstName: "Anónimo",
          lastName: "",
          institutionalEmail: null,
          role: null,
        }
      : {
          id: post.author.id,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          institutionalEmail: post.author.institutionalEmail,
          role: post.author.role?.name,
        },
  };
}

async function createPublication({ title, content, isAnonymous, authorId }) {
  validateCreatePublicationInput({ title, content, isAnonymous });

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      isAnonymous: isAnonymous ?? false,
      authorId,
    },
    include: {
      author: {
        include: {
          role: true,
        },
      },
    },
  });

  return mapPostToResponse(post);
}

async function getPublicationFeed() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        include: {
          role: true,
        },
      },
    },
  });

  return posts.map(mapPostToResponse);
}

module.exports = {
  createPublication,
  getPublicationFeed,
};
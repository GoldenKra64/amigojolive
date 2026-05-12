const prisma = require("../../lib/prisma");

function mapPostToResponse(post) {
  const shouldHideAuthor = post.isAnonymous;

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    isAnonymous: post.isAnonymous,
    status: post.status,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    attachments: post.attachments,
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
    where: {
      status: "PUBLISHED",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        include: {
          role: true,
        },
      },
      attachments: true,
    },
  });

  return posts.map(mapPostToResponse);
}

async function updatePublication(id, userId, data) {
  const existing = await prisma.post.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error("Publicación no encontrada");
    error.statusCode = 404;
    throw error;
  }

  if (existing.authorId !== userId) {
    const error = new Error("No tienes permiso para modificar esta publicación");
    error.statusCode = 403;
    throw error;
  }

  if (existing.deletedAt) {
    const error = new Error("La publicación ha sido eliminada");
    error.statusCode = 400;
    throw error;
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.content !== undefined) updateData.content = data.content.trim();
  if (data.isAnonymous !== undefined) updateData.isAnonymous = data.isAnonymous;
  if (data.status !== undefined) updateData.status = data.status;

  const post = await prisma.post.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        include: {
          role: true,
        },
      },
      attachments: true,
    },
  });

  return mapPostToResponse(post);
}

async function deletePublication(id, userId) {
  const existing = await prisma.post.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error("Publicación no encontrada");
    error.statusCode = 404;
    throw error;
  }

  if (existing.authorId !== userId) {
    const error = new Error("No tienes permiso para eliminar esta publicación");
    error.statusCode = 403;
    throw error;
  }

  if (existing.deletedAt) {
    const error = new Error("La publicación ya ha sido eliminada");
    error.statusCode = 400;
    throw error;
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return { id: post.id, deletedAt: post.deletedAt };
}

module.exports = {
  createPublication,
  getPublicationFeed,
  updatePublication,
  deletePublication,
};

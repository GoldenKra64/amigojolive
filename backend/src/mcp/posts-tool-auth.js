function canUserModifyPostTags(post, ctx) {
  if (!ctx?.userId) {
    return { allowed: false, statusCode: 401, message: "Se requiere contexto de usuario autenticado" };
  }
  if (!post || post.deletedAt) {
    return { allowed: false, statusCode: 404, message: "Publicación no encontrada" };
  }
  const isAdmin = ctx.role === "admin";
  if (post.authorId !== ctx.userId && !isAdmin) {
    return {
      allowed: false,
      statusCode: 403,
      message: "No tienes permiso para modificar las etiquetas de esta publicación",
    };
  }
  return { allowed: true };
}

module.exports = {
  canUserModifyPostTags,
};

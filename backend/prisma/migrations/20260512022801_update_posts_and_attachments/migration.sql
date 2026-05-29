-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('IMAGE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PUBLISHED', 'ARCHIVED', 'HIDDEN');

-- AlterTable
ALTER TABLE "publicaciones" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'PUBLISHED';

-- CreateTable
CREATE TABLE "adjuntos_publicacion" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adjuntos_publicacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "adjuntos_publicacion" ADD CONSTRAINT "adjuntos_publicacion_postId_fkey" FOREIGN KEY ("postId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

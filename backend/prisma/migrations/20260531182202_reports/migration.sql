-- CreateTable
CREATE TABLE "reportes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reportes_userId_postId_key" ON "reportes"("userId", "postId");

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "publicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

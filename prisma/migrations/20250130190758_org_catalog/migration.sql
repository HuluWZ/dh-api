-- CreateTable
CREATE TABLE "Catalog" (
    "id" SERIAL NOT NULL,
    "org_id" INTEGER NOT NULL,
    "image_video_link" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Catalog_pkey" PRIMARY KEY ("id")
);

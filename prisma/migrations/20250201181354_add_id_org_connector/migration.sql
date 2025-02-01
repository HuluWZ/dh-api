-- AlterTable
ALTER TABLE "OrgConnecter" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "OrgConnecter_pkey" PRIMARY KEY ("id");

-- CreateEnum
CREATE TYPE "ProfileVisibilityType" AS ENUM ('Everybody', 'Nobody', 'MyContacts');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeenVisibility" "ProfileVisibilityType" NOT NULL DEFAULT 'Everybody',
ADD COLUMN     "phoneVisibility" "ProfileVisibilityType" NOT NULL DEFAULT 'MyContacts';

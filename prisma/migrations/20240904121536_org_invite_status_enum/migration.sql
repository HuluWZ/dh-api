/*
  Warnings:

  - The values [Accepted] on the enum `OrgInviteStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrgInviteStatus_new" AS ENUM ('Pending', 'Approved', 'Rejected');
ALTER TABLE "OrgInvite" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "OrgInvite" ALTER COLUMN "status" TYPE "OrgInviteStatus_new" USING ("status"::text::"OrgInviteStatus_new");
ALTER TYPE "OrgInviteStatus" RENAME TO "OrgInviteStatus_old";
ALTER TYPE "OrgInviteStatus_new" RENAME TO "OrgInviteStatus";
DROP TYPE "OrgInviteStatus_old";
ALTER TABLE "OrgInvite" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;

/*
  Warnings:

  - Added the required column `matterId` to the `Custodian` table without a default value. This is not possible if the table is not empty.

*/
-- First, let's add a temporary column with a default value
ALTER TABLE "Custodian" ADD COLUMN "matterId_temp" INTEGER DEFAULT 1;

-- Update existing custodians to point to the first available matter
UPDATE "Custodian" SET "matterId_temp" = (SELECT MIN(id) FROM "Matter" LIMIT 1) WHERE "matterId_temp" IS NULL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Custodian" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "department" TEXT,
    "title" TEXT,
    "streetAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "organizationId" INTEGER NOT NULL,
    "matterId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Custodian_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Custodian_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Custodian" ("city", "createdAt", "department", "email", "id", "name", "organizationId", "state", "streetAddress", "title", "updatedAt", "zipCode", "matterId") SELECT "city", "createdAt", "department", "email", "id", "name", "organizationId", "state", "streetAddress", "title", "updatedAt", "zipCode", "matterId_temp" FROM "Custodian";
DROP TABLE "Custodian";
ALTER TABLE "new_Custodian" RENAME TO "Custodian";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

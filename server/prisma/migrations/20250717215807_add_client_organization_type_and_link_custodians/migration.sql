/*
  Warnings:

  - You are about to drop the column `email` on the `Custodian` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `Custodian` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Custodian" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "title" TEXT,
    "organizationId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Custodian_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Custodian" ("createdAt", "department", "id", "name", "title", "updatedAt") SELECT "createdAt", "department", "id", "name", "title", "updatedAt" FROM "Custodian";
DROP TABLE "Custodian";
ALTER TABLE "new_Custodian" RENAME TO "Custodian";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

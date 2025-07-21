/*
  Warnings:

  - You are about to drop the column `custodianId` on the `Collection` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CollectionCustodian" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collectionId" INTEGER NOT NULL,
    "custodianId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollectionCustodian_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionCustodian_custodianId_fkey" FOREIGN KEY ("custodianId") REFERENCES "Custodian" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Collection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'DISCUSSING',
    "type" TEXT NOT NULL,
    "platform" TEXT,
    "scheduledDate" DATETIME,
    "completedDate" DATETIME,
    "notes" TEXT,
    "matterId" INTEGER NOT NULL,
    "organizationId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Collection_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Collection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Collection" ("completedDate", "createdAt", "id", "matterId", "notes", "organizationId", "platform", "scheduledDate", "status", "type", "updatedAt") SELECT "completedDate", "createdAt", "id", "matterId", "notes", "organizationId", "platform", "scheduledDate", "status", "type", "updatedAt" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CollectionCustodian_collectionId_custodianId_key" ON "CollectionCustodian"("collectionId", "custodianId");

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Matter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matterName" TEXT NOT NULL,
    "matterNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COLLECTION',
    "clientId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Matter_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Matter" ("clientId", "createdAt", "id", "matterName", "matterNumber", "updatedAt") SELECT "clientId", "createdAt", "id", "matterName", "matterNumber", "updatedAt" FROM "Matter";
DROP TABLE "Matter";
ALTER TABLE "new_Matter" RENAME TO "Matter";
CREATE UNIQUE INDEX "Matter_matterNumber_key" ON "Matter"("matterNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

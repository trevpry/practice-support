-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientName" TEXT NOT NULL,
    "clientNumber" TEXT NOT NULL,
    "attorneyId" INTEGER,
    "paralegalId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Client_attorneyId_fkey" FOREIGN KEY ("attorneyId") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Client_paralegalId_fkey" FOREIGN KEY ("paralegalId") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("clientName", "clientNumber", "createdAt", "id", "updatedAt") SELECT "clientName", "clientNumber", "createdAt", "id", "updatedAt" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_clientNumber_key" ON "Client"("clientNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

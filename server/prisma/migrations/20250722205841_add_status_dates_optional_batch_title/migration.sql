-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContractReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reviewDocumentCount" INTEGER NOT NULL,
    "matterId" INTEGER NOT NULL,
    "vendorOrganizationId" INTEGER NOT NULL,
    "reviewManagerId" INTEGER,
    "workspaceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Discussing',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "batchTitle" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContractReview_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractReview_vendorOrganizationId_fkey" FOREIGN KEY ("vendorOrganizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractReview_reviewManagerId_fkey" FOREIGN KEY ("reviewManagerId") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContractReview_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ContractReview" ("batchTitle", "createdAt", "id", "matterId", "reviewDocumentCount", "reviewManagerId", "updatedAt", "vendorOrganizationId", "workspaceId") SELECT "batchTitle", "createdAt", "id", "matterId", "reviewDocumentCount", "reviewManagerId", "updatedAt", "vendorOrganizationId", "workspaceId" FROM "ContractReview";
DROP TABLE "ContractReview";
ALTER TABLE "new_ContractReview" RENAME TO "ContractReview";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

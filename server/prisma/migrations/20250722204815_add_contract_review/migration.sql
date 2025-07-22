-- CreateTable
CREATE TABLE "ContractReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchTitle" TEXT NOT NULL,
    "reviewDocumentCount" INTEGER NOT NULL,
    "matterId" INTEGER NOT NULL,
    "vendorOrganizationId" INTEGER NOT NULL,
    "reviewManagerId" INTEGER NOT NULL,
    "workspaceId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContractReview_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractReview_vendorOrganizationId_fkey" FOREIGN KEY ("vendorOrganizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractReview_reviewManagerId_fkey" FOREIGN KEY ("reviewManagerId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContractReview_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Estimate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "totalCost" REAL NOT NULL,
    "matterId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "contractReviewId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Estimate_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Estimate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Estimate_contractReviewId_fkey" FOREIGN KEY ("contractReviewId") REFERENCES "ContractReview" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Estimate" ("createdAt", "description", "id", "matterId", "organizationId", "totalCost", "updatedAt") SELECT "createdAt", "description", "id", "matterId", "organizationId", "totalCost", "updatedAt" FROM "Estimate";
DROP TABLE "Estimate";
ALTER TABLE "new_Estimate" RENAME TO "Estimate";
CREATE TABLE "new_Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceDate" DATETIME NOT NULL,
    "invoiceAmount" REAL NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "matterId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "estimateId" INTEGER,
    "vendorAgreementId" INTEGER,
    "contractReviewId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_vendorAgreementId_fkey" FOREIGN KEY ("vendorAgreementId") REFERENCES "VendorAgreement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_contractReviewId_fkey" FOREIGN KEY ("contractReviewId") REFERENCES "ContractReview" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("approved", "createdAt", "estimateId", "id", "invoiceAmount", "invoiceDate", "matterId", "organizationId", "status", "updatedAt", "vendorAgreementId") SELECT "approved", "createdAt", "estimateId", "id", "invoiceAmount", "invoiceDate", "matterId", "organizationId", "status", "updatedAt", "vendorAgreementId" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE TABLE "new_VendorAgreement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agreementText" TEXT NOT NULL,
    "signedBy" TEXT NOT NULL,
    "matterId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "estimateId" INTEGER,
    "contractReviewId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VendorAgreement_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VendorAgreement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VendorAgreement_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VendorAgreement_contractReviewId_fkey" FOREIGN KEY ("contractReviewId") REFERENCES "ContractReview" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_VendorAgreement" ("agreementText", "createdAt", "estimateId", "id", "matterId", "organizationId", "signedBy", "updatedAt") SELECT "agreementText", "createdAt", "estimateId", "id", "matterId", "organizationId", "signedBy", "updatedAt" FROM "VendorAgreement";
DROP TABLE "VendorAgreement";
ALTER TABLE "new_VendorAgreement" RENAME TO "VendorAgreement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "MatterPerson" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matterId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "role" TEXT,
    CONSTRAINT "MatterPerson_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatterPerson_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MatterPerson_matterId_personId_key" ON "MatterPerson"("matterId", "personId");

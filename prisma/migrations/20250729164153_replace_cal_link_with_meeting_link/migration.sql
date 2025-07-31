/*
  Warnings:

  - You are about to drop the column `calLink` on the `FreelancerProfile` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FreelancerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hourlyRate" REAL NOT NULL,
    "skills" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "portfolio" TEXT,
    "availability" TEXT,
    "meetingLink" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FreelancerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FreelancerProfile" ("availability", "createdAt", "description", "experience", "hourlyRate", "id", "isActive", "portfolio", "skills", "title", "updatedAt", "userId") SELECT "availability", "createdAt", "description", "experience", "hourlyRate", "id", "isActive", "portfolio", "skills", "title", "updatedAt", "userId" FROM "FreelancerProfile";
DROP TABLE "FreelancerProfile";
ALTER TABLE "new_FreelancerProfile" RENAME TO "FreelancerProfile";
CREATE UNIQUE INDEX "FreelancerProfile_userId_key" ON "FreelancerProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

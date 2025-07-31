-- CreateTable
CREATE TABLE "FreelancerDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "feedback" TEXT,
    "projectDetails" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FreelancerDecision_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FreelancerDecision_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerDecision_clientId_freelancerId_key" ON "FreelancerDecision"("clientId", "freelancerId");

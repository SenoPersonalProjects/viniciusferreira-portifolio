-- CreateTable
CREATE TABLE "DossierContent" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "stack" TEXT[],
    "note" TEXT NOT NULL,
    "stamp" TEXT NOT NULL,
    "mainPhotoUrl" TEXT NOT NULL,
    "polaroidPhotoUrl" TEXT NOT NULL,
    "redactions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DossierContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DossierContent_locale_key" ON "DossierContent"("locale");

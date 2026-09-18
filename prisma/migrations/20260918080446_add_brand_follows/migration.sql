-- CreateTable
CREATE TABLE "BrandFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandFollow_userId_idx" ON "BrandFollow"("userId");

-- CreateIndex
CREATE INDEX "BrandFollow_brandId_idx" ON "BrandFollow"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandFollow_userId_brandId_key" ON "BrandFollow"("userId", "brandId");

-- AddForeignKey
ALTER TABLE "BrandFollow" ADD CONSTRAINT "BrandFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandFollow" ADD CONSTRAINT "BrandFollow_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

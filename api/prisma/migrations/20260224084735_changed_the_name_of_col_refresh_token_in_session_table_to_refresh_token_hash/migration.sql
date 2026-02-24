/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refreshTokenHash]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refreshTokenHash` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[Session] DROP CONSTRAINT [Session_refreshToken_key];

-- AlterTable
ALTER TABLE [dbo].[Session] DROP COLUMN [refreshToken];
ALTER TABLE [dbo].[Session] ADD [refreshTokenHash] NVARCHAR(1000) NOT NULL;

-- CreateIndex
ALTER TABLE [dbo].[Session] ADD CONSTRAINT [Session_refreshTokenHash_key] UNIQUE NONCLUSTERED ([refreshTokenHash]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

/*
  Warnings:

  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `refreshTokenHash` on the `Session` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- RedefineTables
BEGIN TRANSACTION;
ALTER TABLE [dbo].[Session] DROP CONSTRAINT [Session_refreshTokenHash_key];
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'Session'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_Session] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Session_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Session_pkey] PRIMARY KEY CLUSTERED ([id])
);
IF EXISTS(SELECT * FROM [dbo].[Session])
    EXEC('INSERT INTO [dbo].[_prisma_new_Session] ([createdAt],[expiresAt],[id],[userId]) SELECT [createdAt],[expiresAt],[id],[userId] FROM [dbo].[Session] WITH (holdlock tablockx)');
DROP TABLE [dbo].[Session];
EXEC SP_RENAME N'dbo._prisma_new_Session', N'Session';
COMMIT;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

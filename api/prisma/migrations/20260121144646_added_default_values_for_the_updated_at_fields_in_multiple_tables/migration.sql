BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Organization] ADD CONSTRAINT [Organization_updatedAt_df] DEFAULT CURRENT_TIMESTAMP FOR [updatedAt];

-- AlterTable
ALTER TABLE [dbo].[Project] ADD CONSTRAINT [Project_updatedAt_df] DEFAULT CURRENT_TIMESTAMP FOR [updatedAt];

-- AlterTable
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [Task_updatedAt_df] DEFAULT CURRENT_TIMESTAMP FOR [updatedAt];

-- AlterTable
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_updatedAt_df] DEFAULT CURRENT_TIMESTAMP FOR [updatedAt];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[ActivityLog] (
    [id] INT NOT NULL IDENTITY(1,1),
    [organizationId] INT NOT NULL,
    [entityType] NVARCHAR(1000) NOT NULL,
    [entityId] INT NOT NULL,
    [action] NVARCHAR(1000) NOT NULL,
    [metadata] NVARCHAR(1000),
    [performedBy] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ActivityLog_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ActivityLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Invite] (
    [id] INT NOT NULL IDENTITY(1,1),
    [organizationId] INT NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [acceptedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Invite_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Invite_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Invite_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateTable
CREATE TABLE [dbo].[Notification] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [message] NVARCHAR(1000) NOT NULL,
    [isRead] BIT NOT NULL CONSTRAINT [Notification_isRead_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notification_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Organization] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [ownerId] INT NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [Organization_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Organization_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Organization_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Organization_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[OrganizationMember] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [organizationId] INT NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [OrganizationMember_isActive_df] DEFAULT 1,
    [joinedAt] DATETIME2 NOT NULL CONSTRAINT [OrganizationMember_joinedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [OrganizationMember_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [OrganizationMember_userId_organizationId_key] UNIQUE NONCLUSTERED ([userId],[organizationId])
);

-- CreateTable
CREATE TABLE [dbo].[Project] (
    [id] INT NOT NULL IDENTITY(1,1),
    [organizationId] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [isArchived] BIT NOT NULL CONSTRAINT [Project_isArchived_df] DEFAULT 0,
    [isActive] BIT NOT NULL CONSTRAINT [Project_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Project_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Project_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Session] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [refreshToken] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Session_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Session_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Session_refreshToken_key] UNIQUE NONCLUSTERED ([refreshToken])
);

-- CreateTable
CREATE TABLE [dbo].[sysdiagrams] (
    [name] NVARCHAR(128) NOT NULL,
    [principal_id] INT NOT NULL,
    [diagram_id] INT NOT NULL IDENTITY(1,1),
    [version] INT,
    [definition] VARBINARY(max),
    CONSTRAINT [PK__sysdiagr__C2B05B61F47817FD] PRIMARY KEY CLUSTERED ([diagram_id]),
    CONSTRAINT [UK_principal_name] UNIQUE NONCLUSTERED ([principal_id],[name])
);

-- CreateTable
CREATE TABLE [dbo].[Task] (
    [id] INT NOT NULL IDENTITY(1,1),
    [projectId] INT NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Task_status_df] DEFAULT 'TODO',
    [priority] NVARCHAR(1000) NOT NULL CONSTRAINT [Task_priority_df] DEFAULT 'MEDIUM',
    [createdBy] INT NOT NULL,
    [dueDate] DATETIME2,
    [order] INT NOT NULL CONSTRAINT [Task_order_df] DEFAULT 0,
    [isActive] BIT NOT NULL CONSTRAINT [Task_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Task_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Task_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TaskAssignee] (
    [id] INT NOT NULL IDENTITY(1,1),
    [taskId] INT NOT NULL,
    [userId] INT NOT NULL,
    CONSTRAINT [TaskAssignee_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TaskAssignee_taskId_userId_key] UNIQUE NONCLUSTERED ([taskId],[userId])
);

-- CreateTable
CREATE TABLE [dbo].[TaskAttachment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [taskId] INT NOT NULL,
    [fileName] NVARCHAR(1000) NOT NULL,
    [fileUrl] NVARCHAR(1000) NOT NULL,
    [uploadedBy] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TaskAttachment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [TaskAttachment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TaskComment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [taskId] INT NOT NULL,
    [userId] INT NOT NULL,
    [content] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TaskComment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [TaskComment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [User_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ActivityLog_entityType_entityId_idx] ON [dbo].[ActivityLog]([entityType], [entityId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ActivityLog_organizationId_idx] ON [dbo].[ActivityLog]([organizationId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [OrganizationMember_organizationId_idx] ON [dbo].[OrganizationMember]([organizationId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [OrganizationMember_userId_idx] ON [dbo].[OrganizationMember]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Project_organizationId_idx] ON [dbo].[Project]([organizationId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Task_priority_idx] ON [dbo].[Task]([priority]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Task_projectId_idx] ON [dbo].[Task]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Task_projectId_order_idx] ON [dbo].[Task]([projectId], [order]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Task_status_idx] ON [dbo].[Task]([status]);

-- AddForeignKey
ALTER TABLE [dbo].[ActivityLog] ADD CONSTRAINT [ActivityLog_organizationId_fkey] FOREIGN KEY ([organizationId]) REFERENCES [dbo].[Organization]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ActivityLog] ADD CONSTRAINT [ActivityLog_performedBy_fkey] FOREIGN KEY ([performedBy]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Invite] ADD CONSTRAINT [Invite_organizationId_fkey] FOREIGN KEY ([organizationId]) REFERENCES [dbo].[Organization]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Organization] ADD CONSTRAINT [Organization_ownerId_fkey] FOREIGN KEY ([ownerId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[OrganizationMember] ADD CONSTRAINT [OrganizationMember_organizationId_fkey] FOREIGN KEY ([organizationId]) REFERENCES [dbo].[Organization]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[OrganizationMember] ADD CONSTRAINT [OrganizationMember_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Project] ADD CONSTRAINT [Project_organizationId_fkey] FOREIGN KEY ([organizationId]) REFERENCES [dbo].[Organization]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Session] ADD CONSTRAINT [Session_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [Task_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [Task_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[Project]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TaskAssignee] ADD CONSTRAINT [TaskAssignee_taskId_fkey] FOREIGN KEY ([taskId]) REFERENCES [dbo].[Task]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TaskAssignee] ADD CONSTRAINT [TaskAssignee_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TaskAttachment] ADD CONSTRAINT [TaskAttachment_taskId_fkey] FOREIGN KEY ([taskId]) REFERENCES [dbo].[Task]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TaskAttachment] ADD CONSTRAINT [TaskAttachment_uploadedBy_fkey] FOREIGN KEY ([uploadedBy]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TaskComment] ADD CONSTRAINT [TaskComment_taskId_fkey] FOREIGN KEY ([taskId]) REFERENCES [dbo].[Task]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TaskComment] ADD CONSTRAINT [TaskComment_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

-- CreateTable
CREATE TABLE `tenant` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `plan` VARCHAR(30) NOT NULL DEFAULT 'free',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(150) NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'member',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invite` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `host_user_id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(150) NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'member',
    `accepted_at` DATETIME(6) NULL,
    `invited_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `expires_at` DATETIME(6) NOT NULL DEFAULT (now() + interval 7 day),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stage` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `color` VARCHAR(191) NULL,
    `entity_type` VARCHAR(10) NOT NULL DEFAULT 'lead',
    `is_terminal` BOOLEAN NOT NULL DEFAULT false,
    `is_default` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `color` VARCHAR(7) NULL,
    `type` VARCHAR(10) NOT NULL DEFAULT 'lead',
    `is_default_status` BOOLEAN NOT NULL DEFAULT false,
    `is_closing_status` BOOLEAN NOT NULL DEFAULT false,
    `is_failed_status` BOOLEAN NOT NULL DEFAULT false,
    `is_system_status` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `location` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `organization_id` VARCHAR(36) NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NULL,
    `phone_number` VARCHAR(30) NULL,
    `email` VARCHAR(255) NULL,
    `gender` VARCHAR(20) NULL,
    `salutation` VARCHAR(20) NULL,
    `attached_document` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `customer_id` VARCHAR(36) NOT NULL,
    `source_user_id` VARCHAR(36) NULL,
    `assigned_user_id` VARCHAR(36) NULL,
    `stage_id` VARCHAR(36) NULL,
    `status_id` VARCHAR(36) NULL,
    `type` VARCHAR(50) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `converted` BOOLEAN NOT NULL DEFAULT false,
    `converted_date` DATETIME(6) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `location_id` VARCHAR(36) NULL,
    `sourceId` VARCHAR(36) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_item` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NULL,
    `lead_id` VARCHAR(36) NOT NULL,
    `item_id` VARCHAR(36) NOT NULL,
    `slot_id` VARCHAR(36) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deal` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `lead_id` VARCHAR(36) NULL,
    `assigned_user_id` VARCHAR(36) NULL,
    `stage_id` VARCHAR(36) NULL,
    `status_id` VARCHAR(36) NULL,
    `ref_code` VARCHAR(80) NULL,
    `deal_type` VARCHAR(50) NULL,
    `expected_amount` DECIMAL(14, 2) NULL,
    `amount` DECIMAL(14, 2) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `expected_closing_date` DATE NULL,
    `closing_date` DATE NULL,
    `lost_reason` VARCHAR(191) NULL,
    `lost_notes` VARCHAR(191) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `confirmed_at` DATETIME(6) NULL,
    `sourceId` VARCHAR(36) NULL,

    UNIQUE INDEX `deal_ref_code_key`(`ref_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_activity` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `lead_id` VARCHAR(36) NOT NULL,
    `customer_id` VARCHAR(36) NULL,
    `actor_id` VARCHAR(36) NULL,
    `activity_type` VARCHAR(30) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deal_activity` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `deal_id` VARCHAR(36) NOT NULL,
    `customer_id` VARCHAR(36) NULL,
    `actor_id` VARCHAR(36) NULL,
    `activity_type` VARCHAR(30) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `note` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NULL,
    `lead_activity_id` VARCHAR(36) NULL,
    `deal_activity_id` VARCHAR(36) NULL,
    `title` VARCHAR(200) NULL,
    `content` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NULL,
    `lead_activity_id` VARCHAR(36) NULL,
    `deal_activity_id` VARCHAR(36) NULL,
    `assigned_user_id` VARCHAR(36) NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` VARCHAR(191) NULL,
    `start_date` DATE NULL,
    `due_date` DATE NULL,
    `priority` VARCHAR(20) NOT NULL DEFAULT 'normal',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `call_log` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NULL,
    `lead_activity_id` VARCHAR(36) NULL,
    `deal_activity_id` VARCHAR(36) NULL,
    `title` VARCHAR(200) NULL,
    `description` VARCHAR(191) NULL,
    `start_date` DATETIME(6) NULL,
    `due_date` DATETIME(6) NULL,
    `calling_number` VARCHAR(30) NULL,
    `receiving_number` VARCHAR(30) NULL,
    `duration` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_category` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `parent_id` VARCHAR(36) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `category_id` VARCHAR(36) NULL,
    `name` VARCHAR(150) NOT NULL,
    `sku` VARCHAR(80) NULL,
    `unit` VARCHAR(30) NULL,
    `base_price` DECIMAL(14, 2) NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `color` VARCHAR(7) NULL,
    `attributes` JSON NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `item_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_slot` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `location_id` VARCHAR(36) NOT NULL,
    `parent_id` VARCHAR(36) NULL,
    `label` VARCHAR(50) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'available',
    `metadata` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grid_config` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NULL,
    `slot_id` VARCHAR(36) NOT NULL,
    `grid_row` INTEGER NOT NULL,
    `grid_col` INTEGER NOT NULL,
    `row_label` VARCHAR(20) NULL,
    `col_label` VARCHAR(20) NULL,

    UNIQUE INDEX `grid_config_slot_id_key`(`slot_id`),
    UNIQUE INDEX `grid_config_slot_id_grid_row_grid_col_key`(`slot_id`, `grid_row`, `grid_col`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entry` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NULL,
    `slot_id` VARCHAR(36) NOT NULL,
    `item_id` VARCHAR(36) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `reserved_quantity` INTEGER NOT NULL DEFAULT 0,
    `entry_type` VARCHAR(20) NOT NULL DEFAULT 'stock',
    `valid_from` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `valid_until` DATETIME(6) NULL,

    UNIQUE INDEX `entry_slot_id_item_id_key`(`slot_id`, `item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operation` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NULL,
    `operation_type` VARCHAR(30) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NULL,
    `entry_id` VARCHAR(36) NOT NULL,
    `deal_id` VARCHAR(36) NULL,
    `operation_id` VARCHAR(36) NULL,
    `location_id` VARCHAR(36) NOT NULL,
    `slot_id` VARCHAR(36) NOT NULL,
    `item_id` VARCHAR(36) NOT NULL,
    `quantity_delta` INTEGER NOT NULL,
    `quantity_before` INTEGER NOT NULL,
    `quantity_after` INTEGER NOT NULL,
    `from_slot_id` VARCHAR(36) NULL,
    `to_slot_id` VARCHAR(36) NULL,
    `unit_price` DECIMAL(14, 2) NULL,
    `snapshot_data` JSON NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `viewing` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `slot_id` VARCHAR(36) NULL,
    `lead_id` VARCHAR(36) NULL,
    `location_id` VARCHAR(36) NULL,
    `status_id` VARCHAR(36) NULL,
    `source_id` VARCHAR(36) NULL,
    `name` VARCHAR(150) NULL,
    `email` VARCHAR(255) NULL,
    `scheduled_at` DATETIME(6) NOT NULL,
    `actor_id` VARCHAR(36) NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attachment` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `lead_id` VARCHAR(36) NULL,
    `deal_id` VARCHAR(36) NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_url` VARCHAR(191) NOT NULL,
    `file_type` VARCHAR(191) NULL,
    `file_size` INTEGER NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `viewingId` VARCHAR(36) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `entity_id` VARCHAR(36) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `actor_id` VARCHAR(36) NULL,
    `action` VARCHAR(50) NOT NULL,
    `changes` JSON NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `audit_log_entity_id_entity_type_idx`(`entity_id`, `entity_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `source` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `type` VARCHAR(50) NOT NULL DEFAULT 'lead',
    `color` VARCHAR(7) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invite` ADD CONSTRAINT `invite_host_user_id_fkey` FOREIGN KEY (`host_user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invite` ADD CONSTRAINT `invite_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stage` ADD CONSTRAINT `stage_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status` ADD CONSTRAINT `status_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization` ADD CONSTRAINT `organization_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead` ADD CONSTRAINT `lead_assigned_user_id_fkey` FOREIGN KEY (`assigned_user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead` ADD CONSTRAINT `lead_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead` ADD CONSTRAINT `lead_source_user_id_fkey` FOREIGN KEY (`source_user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead` ADD CONSTRAINT `lead_stage_id_fkey` FOREIGN KEY (`stage_id`) REFERENCES `stage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead` ADD CONSTRAINT `lead_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `status`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead` ADD CONSTRAINT `lead_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead` ADD CONSTRAINT `lead_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead` ADD CONSTRAINT `lead_sourceId_fkey` FOREIGN KEY (`sourceId`) REFERENCES `source`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_item` ADD CONSTRAINT `lead_item_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_item` ADD CONSTRAINT `lead_item_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_item` ADD CONSTRAINT `lead_item_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `inventory_slot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_item` ADD CONSTRAINT `lead_item_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deal` ADD CONSTRAINT `deal_assigned_user_id_fkey` FOREIGN KEY (`assigned_user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deal` ADD CONSTRAINT `deal_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `lead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deal` ADD CONSTRAINT `deal_stage_id_fkey` FOREIGN KEY (`stage_id`) REFERENCES `stage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deal` ADD CONSTRAINT `deal_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `status`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deal` ADD CONSTRAINT `deal_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deal` ADD CONSTRAINT `deal_sourceId_fkey` FOREIGN KEY (`sourceId`) REFERENCES `source`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activity` ADD CONSTRAINT `lead_activity_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activity` ADD CONSTRAINT `lead_activity_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activity` ADD CONSTRAINT `lead_activity_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activity` ADD CONSTRAINT `lead_activity_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deal_activity` ADD CONSTRAINT `deal_activity_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deal_activity` ADD CONSTRAINT `deal_activity_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deal_activity` ADD CONSTRAINT `deal_activity_deal_id_fkey` FOREIGN KEY (`deal_id`) REFERENCES `deal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deal_activity` ADD CONSTRAINT `deal_activity_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `note` ADD CONSTRAINT `note_deal_activity_id_fkey` FOREIGN KEY (`deal_activity_id`) REFERENCES `deal_activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `note` ADD CONSTRAINT `note_lead_activity_id_fkey` FOREIGN KEY (`lead_activity_id`) REFERENCES `lead_activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `note` ADD CONSTRAINT `note_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_assigned_user_id_fkey` FOREIGN KEY (`assigned_user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_deal_activity_id_fkey` FOREIGN KEY (`deal_activity_id`) REFERENCES `deal_activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_lead_activity_id_fkey` FOREIGN KEY (`lead_activity_id`) REFERENCES `lead_activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_log` ADD CONSTRAINT `call_log_deal_activity_id_fkey` FOREIGN KEY (`deal_activity_id`) REFERENCES `deal_activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_log` ADD CONSTRAINT `call_log_lead_activity_id_fkey` FOREIGN KEY (`lead_activity_id`) REFERENCES `lead_activity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_log` ADD CONSTRAINT `call_log_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_category` ADD CONSTRAINT `item_category_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `item_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_category` ADD CONSTRAINT `item_category_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item` ADD CONSTRAINT `item_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `item_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item` ADD CONSTRAINT `item_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location` ADD CONSTRAINT `location_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_slot` ADD CONSTRAINT `inventory_slot_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_slot` ADD CONSTRAINT `inventory_slot_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `inventory_slot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_slot` ADD CONSTRAINT `inventory_slot_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grid_config` ADD CONSTRAINT `grid_config_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `inventory_slot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grid_config` ADD CONSTRAINT `grid_config_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `inventory_slot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operation` ADD CONSTRAINT `operation_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operation` ADD CONSTRAINT `operation_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record` ADD CONSTRAINT `record_deal_id_fkey` FOREIGN KEY (`deal_id`) REFERENCES `deal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record` ADD CONSTRAINT `record_entry_id_fkey` FOREIGN KEY (`entry_id`) REFERENCES `entry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record` ADD CONSTRAINT `record_from_slot_id_fkey` FOREIGN KEY (`from_slot_id`) REFERENCES `inventory_slot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record` ADD CONSTRAINT `record_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record` ADD CONSTRAINT `record_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record` ADD CONSTRAINT `record_operation_id_fkey` FOREIGN KEY (`operation_id`) REFERENCES `operation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record` ADD CONSTRAINT `record_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `inventory_slot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record` ADD CONSTRAINT `record_to_slot_id_fkey` FOREIGN KEY (`to_slot_id`) REFERENCES `inventory_slot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record` ADD CONSTRAINT `record_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `viewing` ADD CONSTRAINT `viewing_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `viewing` ADD CONSTRAINT `viewing_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `lead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `viewing` ADD CONSTRAINT `viewing_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `inventory_slot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `viewing` ADD CONSTRAINT `viewing_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `viewing` ADD CONSTRAINT `viewing_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `status`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `viewing` ADD CONSTRAINT `viewing_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `viewing` ADD CONSTRAINT `viewing_source_id_fkey` FOREIGN KEY (`source_id`) REFERENCES `source`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachment` ADD CONSTRAINT `attachment_deal_id_fkey` FOREIGN KEY (`deal_id`) REFERENCES `deal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachment` ADD CONSTRAINT `attachment_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `lead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachment` ADD CONSTRAINT `attachment_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachment` ADD CONSTRAINT `attachment_viewingId_fkey` FOREIGN KEY (`viewingId`) REFERENCES `viewing`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `source` ADD CONSTRAINT `source_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

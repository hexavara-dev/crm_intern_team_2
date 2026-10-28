-- Nullable guard columns allow many non-default rows (NULL) while unique
-- indexes enforce one active flag per tenant and entity/status type.
ALTER TABLE `stage`
    ADD COLUMN `terminal_guard` VARCHAR(10) NULL,
    ADD COLUMN `default_guard` VARCHAR(10) NULL;

UPDATE `stage`
SET
    `terminal_guard` = CASE WHEN `is_terminal` = TRUE THEN `entity_type` ELSE NULL END,
    `default_guard` = CASE WHEN `is_default` = TRUE THEN `entity_type` ELSE NULL END;

ALTER TABLE `stage`
    ADD CONSTRAINT `stage_terminal_guard_consistency`
        CHECK (
            (`is_terminal` = FALSE AND `terminal_guard` IS NULL)
            OR (`is_terminal` = TRUE AND `terminal_guard` = `entity_type`)
        ),
    ADD CONSTRAINT `stage_default_guard_consistency`
        CHECK (
            (`is_default` = FALSE AND `default_guard` IS NULL)
            OR (`is_default` = TRUE AND `default_guard` = `entity_type`)
        ),
    ADD UNIQUE INDEX `stage_tenant_id_terminal_guard_key` (`tenant_id`, `terminal_guard`),
    ADD UNIQUE INDEX `stage_tenant_id_default_guard_key` (`tenant_id`, `default_guard`);

ALTER TABLE `status`
    ADD COLUMN `default_guard` VARCHAR(10) NULL,
    ADD COLUMN `closing_guard` VARCHAR(10) NULL;

UPDATE `status`
SET
    `default_guard` = CASE WHEN `is_default_status` = TRUE THEN `type` ELSE NULL END,
    `closing_guard` = CASE WHEN `is_closing_status` = TRUE THEN `type` ELSE NULL END;

ALTER TABLE `status`
    ADD CONSTRAINT `status_default_guard_consistency`
        CHECK (
            (`is_default_status` = FALSE AND `default_guard` IS NULL)
            OR (`is_default_status` = TRUE AND `default_guard` = `type`)
        ),
    ADD CONSTRAINT `status_closing_guard_consistency`
        CHECK (
            (`is_closing_status` = FALSE AND `closing_guard` IS NULL)
            OR (`is_closing_status` = TRUE AND `closing_guard` = `type`)
        ),
    ADD UNIQUE INDEX `status_tenant_id_default_guard_key` (`tenant_id`, `default_guard`),
    ADD UNIQUE INDEX `status_tenant_id_closing_guard_key` (`tenant_id`, `closing_guard`);

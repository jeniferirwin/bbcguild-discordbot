-- CreateTable
CREATE TABLE `Member` (
    `id` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `member` VARCHAR(191) NOT NULL,
    `monthly_share` VARCHAR(191) NOT NULL,
    `header1` VARCHAR(191) NOT NULL,
    `header2` VARCHAR(191) NOT NULL,
    `header3` VARCHAR(191) NOT NULL,
    `header4` VARCHAR(191) NOT NULL,
    `header5` VARCHAR(191) NOT NULL,
    `value1` FLOAT NOT NULL,
    `value2` FLOAT NOT NULL,
    `value3` FLOAT NOT NULL,
    `value4` FLOAT NOT NULL,
    `value5` FLOAT NOT NULL,
    `total_gold` FLOAT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

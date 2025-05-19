-- CreateTable
CREATE TABLE `Member` (
    `id` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `member` VARCHAR(191) NOT NULL,
    `monthly_share` VARCHAR(191) NOT NULL,
    `sales_tax` DOUBLE NOT NULL,
    `purchase_tax` DOUBLE NOT NULL,
    `raffle_tix` DOUBLE NOT NULL,
    `bank_misc` DOUBLE NOT NULL,
    `auctions` DOUBLE NOT NULL,
    `total_gold` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

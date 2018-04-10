-- MySQL dump 10.13  Distrib 5.7.21, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: cryptx
-- ------------------------------------------------------
-- Server version	5.7.21-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Account`
--

DROP TABLE IF EXISTS `Account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Account` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `auth_id` int(11) DEFAULT NULL,
  `exch_id` bigint(20) DEFAULT NULL,
  `exch_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `AccountType`
--

DROP TABLE IF EXISTS `AccountType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AccountType` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ApprovalType`
--

DROP TABLE IF EXISTS `ApprovalType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ApprovalType` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `BaseCoin`
--

DROP TABLE IF EXISTS `BaseCoin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BaseCoin` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `CurrencyName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `BlacklistedTokenInfo`
--

DROP TABLE IF EXISTS `BlacklistedTokenInfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BlacklistedTokenInfo` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `blacklist_status` bit(1) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `Valid_From` datetime DEFAULT NULL,
  `Valid_To` datetime DEFAULT NULL,
  `token_Id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_16f5h5hbe09rx6hbgg6imog5d` (`token_Id`),
  CONSTRAINT `FK_16f5h5hbe09rx6hbgg6imog5d` FOREIGN KEY (`token_Id`) REFERENCES `Tokens` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CRYPTX_PROFILE`
--

DROP TABLE IF EXISTS `CRYPTX_PROFILE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CRYPTX_PROFILE` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `TYPE` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CRYPTX_USER`
--

DROP TABLE IF EXISTS `CRYPTX_USER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CRYPTX_USER` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `EMAIL` varchar(255) NOT NULL,
  `FIRST_NAME` varchar(255) NOT NULL,
  `LAST_NAME` varchar(255) NOT NULL,
  `PASSWORD` varchar(255) NOT NULL,
  `RESET_TOKEN` varchar(255) DEFAULT NULL,
  `SSO_ID` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_9rhq97orgfgywwxu9pw7arb0j` (`SSO_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CRYPTX_USER_USER_PROFILE`
--

DROP TABLE IF EXISTS `CRYPTX_USER_USER_PROFILE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CRYPTX_USER_USER_PROFILE` (
  `USER_ID` int(11) NOT NULL,
  `USER_PROFILE_ID` int(11) NOT NULL,
  PRIMARY KEY (`USER_ID`,`USER_PROFILE_ID`),
  KEY `FK_axdi3c7wd38c9chyn63rxl4hv` (`USER_PROFILE_ID`),
  CONSTRAINT `FK_6qdb3uelb4hlsc5w5glneojik` FOREIGN KEY (`USER_ID`) REFERENCES `CRYPTX_USER` (`id`),
  CONSTRAINT `FK_axdi3c7wd38c9chyn63rxl4hv` FOREIGN KEY (`USER_PROFILE_ID`) REFERENCES `CRYPTX_PROFILE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CryptxData`
--

DROP TABLE IF EXISTS `CryptxData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CryptxData` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Market_Cap` decimal(19,2) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `price` decimal(20,10) DEFAULT NULL,
  `Available_Supply` decimal(19,2) DEFAULT NULL,
  `Symbol` varchar(255) DEFAULT NULL,
  `Volume` decimal(25,6) DEFAULT NULL,
  `TokenId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_mumpqmq6i950mqepg6pqpcq9v` (`TokenId`),
  CONSTRAINT `FK_mumpqmq6i950mqepg6pqpcq9v` FOREIGN KEY (`TokenId`) REFERENCES `Token` (`tid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Daily_Price_Ticker`
--

DROP TABLE IF EXISTS `Daily_Price_Ticker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Daily_Price_Ticker` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ask` decimal(25,10) DEFAULT NULL,
  `bid` decimal(25,10) DEFAULT NULL,
  `exchange` varchar(255) DEFAULT NULL,
  `high_trade` decimal(25,10) DEFAULT NULL,
  `last_trade` decimal(25,10) DEFAULT NULL,
  `low_trade` decimal(25,10) DEFAULT NULL,
  `market` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `current_volume` decimal(25,10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1036 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Deposit`
--

DROP TABLE IF EXISTS `Deposit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Deposit` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Amount` decimal(25,10) DEFAULT NULL,
  `BaseCoin` varchar(255) DEFAULT NULL,
  `ExchangeAccountID` varchar(255) DEFAULT NULL,
  `InvRunID` int(11) DEFAULT NULL,
  `RecipeRunID` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Exchange`
--

DROP TABLE IF EXISTS `Exchange`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Exchange` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Code` varchar(255) DEFAULT NULL,
  `exch_id` int(11) DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ExchangeMarket`
--

DROP TABLE IF EXISTS `ExchangeMarket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ExchangeMarket` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Amount` decimal(25,10) DEFAULT NULL,
  `Ask` decimal(25,10) DEFAULT NULL,
  `Base_Type` varchar(255) DEFAULT NULL,
  `Exchange_Name` varchar(255) DEFAULT NULL,
  `Flag` varchar(255) DEFAULT NULL,
  `Market` varchar(255) DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Symbol` varchar(255) DEFAULT NULL,
  `Token_Type` varchar(255) DEFAULT NULL,
  `MarketCap_USD` decimal(30,2) DEFAULT NULL,
  `Volume24_USD` decimal(25,2) DEFAULT NULL,
  `Updated_Date` datetime DEFAULT NULL,
  `Quantity` decimal(25,10) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ExchangeOrder`
--

DROP TABLE IF EXISTS `ExchangeOrder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ExchangeOrder` (
  `OrderId` bigint(20) NOT NULL,
  `BidAmount` decimal(20,4) DEFAULT NULL,
  `ExchangeCode` varchar(255) DEFAULT NULL,
  `OrderTime` bigint(20) DEFAULT NULL,
  `Quantity` decimal(20,5) DEFAULT NULL,
  `Status` varchar(255) DEFAULT NULL,
  `Timestamp` datetime DEFAULT NULL,
  `TradePair` varchar(255) DEFAULT NULL,
  `tradingOrder_Id` int(11) DEFAULT NULL,
  PRIMARY KEY (`OrderId`),
  KEY `FK_bdww39gg8c98d4aaisi39hslg` (`tradingOrder_Id`),
  CONSTRAINT `FK_bdww39gg8c98d4aaisi39hslg` FOREIGN KEY (`tradingOrder_Id`) REFERENCES `TradingOrders` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `FeeType`
--

DROP TABLE IF EXISTS `FeeType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FeeType` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `InvWorkflowState`
--

DROP TABLE IF EXISTS `InvWorkflowState`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `InvWorkflowState` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `InvestmentApprovals`
--

DROP TABLE IF EXISTS `InvestmentApprovals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `InvestmentApprovals` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `DateTime` datetime DEFAULT NULL,
  `Rationale` varchar(255) DEFAULT NULL,
  `approvalTypeId` int(11) DEFAULT NULL,
  `invRunID` int(11) DEFAULT NULL,
  `orderRunId` int(11) DEFAULT NULL,
  `recipeRunID` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_2uw415oulaud7kcwepu5yllo5` (`approvalTypeId`),
  KEY `FK_7j2bnkdmkowxjn341aefoc3p4` (`invRunID`),
  KEY `FK_eut82rka7u1hcn7vh7ubwll6g` (`orderRunId`),
  KEY `FK_81g51jishoctujmskbugx467e` (`recipeRunID`),
  KEY `FK_n0q0x0nokfc9kaxstluvlyroh` (`userId`),
  CONSTRAINT `FK_2uw415oulaud7kcwepu5yllo5` FOREIGN KEY (`approvalTypeId`) REFERENCES `ApprovalType` (`Id`),
  CONSTRAINT `FK_7j2bnkdmkowxjn341aefoc3p4` FOREIGN KEY (`invRunID`) REFERENCES `InvestmentRun` (`Id`),
  CONSTRAINT `FK_81g51jishoctujmskbugx467e` FOREIGN KEY (`recipeRunID`) REFERENCES `RecipeRun` (`Id`),
  CONSTRAINT `FK_eut82rka7u1hcn7vh7ubwll6g` FOREIGN KEY (`orderRunId`) REFERENCES `OrderRun` (`Id`),
  CONSTRAINT `FK_n0q0x0nokfc9kaxstluvlyroh` FOREIGN KEY (`userId`) REFERENCES `CRYPTX_USER` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `InvestmentMode`
--

DROP TABLE IF EXISTS `InvestmentMode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `InvestmentMode` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `InvestmentRun`
--

DROP TABLE IF EXISTS `InvestmentRun`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `InvestmentRun` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Amount` decimal(19,2) DEFAULT NULL,
  `CompletedDateTime` datetime DEFAULT NULL,
  `Currency` varchar(255) DEFAULT NULL,
  `NumberOfShares` decimal(25,10) DEFAULT NULL,
  `StartedDateTime` datetime DEFAULT NULL,
  `InvWorkflowStateID` int(11) DEFAULT NULL,
  `InvestmentModeID` int(11) DEFAULT NULL,
  `StrategyTypeID` int(11) DEFAULT NULL,
  `LastUpdatedDateTime` datetime DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_fs4m2iln853uia8w6bi39abwr` (`InvWorkflowStateID`),
  KEY `FK_4oe52k28lyacrq9s9egxhefcs` (`InvestmentModeID`),
  KEY `FK_l0ac0jkyes6vig9l154tmy79p` (`StrategyTypeID`),
  KEY `FK_dw4ave1kpd4ol8vj54kvw1saf` (`userId`),
  CONSTRAINT `FK_4oe52k28lyacrq9s9egxhefcs` FOREIGN KEY (`InvestmentModeID`) REFERENCES `InvestmentMode` (`Id`),
  CONSTRAINT `FK_dw4ave1kpd4ol8vj54kvw1saf` FOREIGN KEY (`userId`) REFERENCES `CRYPTX_USER` (`id`),
  CONSTRAINT `FK_fs4m2iln853uia8w6bi39abwr` FOREIGN KEY (`InvWorkflowStateID`) REFERENCES `InvWorkflowState` (`Id`),
  CONSTRAINT `FK_l0ac0jkyes6vig9l154tmy79p` FOREIGN KEY (`StrategyTypeID`) REFERENCES `StrategyType` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OrderDetail`
--

DROP TABLE IF EXISTS `OrderDetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OrderDetail` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Amount` decimal(25,10) DEFAULT NULL,
  `CoinId` varchar(255) DEFAULT NULL,
  `ExchangeID` varchar(255) DEFAULT NULL,
  `Price` decimal(25,10) DEFAULT NULL,
  `BaseCoinID` bigint(20) DEFAULT NULL,
  `orderRunID` int(11) DEFAULT NULL,
  `orderStateId` int(11) DEFAULT NULL,
  `Quantity` decimal(25,10) DEFAULT NULL,
  `contribution` decimal(25,10) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_2i90c6rb70rny4s5sateecnjj` (`BaseCoinID`),
  KEY `FK_d49eirvxf3wcew08dwyhgc2mv` (`orderRunID`),
  KEY `FK_57i7j0c813piq3hj7mflj5680` (`orderStateId`),
  CONSTRAINT `FK_2i90c6rb70rny4s5sateecnjj` FOREIGN KEY (`BaseCoinID`) REFERENCES `BaseCoin` (`Id`),
  CONSTRAINT `FK_57i7j0c813piq3hj7mflj5680` FOREIGN KEY (`orderStateId`) REFERENCES `OrderState` (`Id`),
  CONSTRAINT `FK_d49eirvxf3wcew08dwyhgc2mv` FOREIGN KEY (`orderRunID`) REFERENCES `OrderRun` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OrderExecution`
--

DROP TABLE IF EXISTS `OrderExecution`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OrderExecution` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Amount` decimal(25,10) DEFAULT NULL,
  `exchangeTransactionID` bigint(20) DEFAULT NULL,
  `Price` decimal(25,10) DEFAULT NULL,
  `Rationale` varchar(255) DEFAULT NULL,
  `orderDetailId` int(11) DEFAULT NULL,
  `orderStateId` int(11) DEFAULT NULL,
  `orderTypeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_5ghiphn7e0sgpqsw8ilspfgad` (`orderDetailId`),
  KEY `FK_2y8ow495im005n0kbbrxakud8` (`orderStateId`),
  KEY `FK_7xsy7gl2pd4ob9rei43twc6nh` (`orderTypeId`),
  CONSTRAINT `FK_2y8ow495im005n0kbbrxakud8` FOREIGN KEY (`orderStateId`) REFERENCES `OrderState` (`Id`),
  CONSTRAINT `FK_5ghiphn7e0sgpqsw8ilspfgad` FOREIGN KEY (`orderDetailId`) REFERENCES `OrderDetail` (`Id`),
  CONSTRAINT `FK_7xsy7gl2pd4ob9rei43twc6nh` FOREIGN KEY (`orderTypeId`) REFERENCES `OrderType` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OrderExecutionConfiguration`
--

DROP TABLE IF EXISTS `OrderExecutionConfiguration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OrderExecutionConfiguration` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `BaseCoin` varchar(255) DEFAULT NULL,
  `Exchange` varchar(255) DEFAULT NULL,
  `Lot` decimal(25,10) DEFAULT NULL,
  `TimeInterval` int(11) DEFAULT NULL,
  `orderTypeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_jyjqishwa4kxbn81jt149tfcm` (`orderTypeId`),
  CONSTRAINT `FK_jyjqishwa4kxbn81jt149tfcm` FOREIGN KEY (`orderTypeId`) REFERENCES `OrderType` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OrderRun`
--

DROP TABLE IF EXISTS `OrderRun`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OrderRun` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `DateTimeGenerated` datetime DEFAULT NULL,
  `investmentModeID` int(11) DEFAULT NULL,
  `invRunID` int(11) DEFAULT NULL,
  `recipeRunID` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `orderSideId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_efh76s1ck218y7b223ihp5v0d` (`investmentModeID`),
  KEY `FK_cnxuso2bwk1is81ceq8fjqh6w` (`invRunID`),
  KEY `FK_4uag8a9ux5bjf6wk7uwpd3208` (`recipeRunID`),
  KEY `FK_iy7dt59mks0bnxvfarvhhe6mx` (`userId`),
  KEY `FK_2jyixmu8ve2fa1di07pew6rnr` (`orderSideId`),
  CONSTRAINT `FK_2jyixmu8ve2fa1di07pew6rnr` FOREIGN KEY (`orderSideId`) REFERENCES `OrderSide` (`Id`),
  CONSTRAINT `FK_4uag8a9ux5bjf6wk7uwpd3208` FOREIGN KEY (`recipeRunID`) REFERENCES `RecipeRun` (`Id`),
  CONSTRAINT `FK_cnxuso2bwk1is81ceq8fjqh6w` FOREIGN KEY (`invRunID`) REFERENCES `InvestmentRun` (`Id`),
  CONSTRAINT `FK_efh76s1ck218y7b223ihp5v0d` FOREIGN KEY (`investmentModeID`) REFERENCES `InvestmentMode` (`Id`),
  CONSTRAINT `FK_iy7dt59mks0bnxvfarvhhe6mx` FOREIGN KEY (`userId`) REFERENCES `CRYPTX_USER` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OrderSide`
--

DROP TABLE IF EXISTS `OrderSide`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OrderSide` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OrderState`
--

DROP TABLE IF EXISTS `OrderState`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OrderState` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OrderType`
--

DROP TABLE IF EXISTS `OrderType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OrderType` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PERSISTENT_LOGINS`
--

DROP TABLE IF EXISTS `PERSISTENT_LOGINS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PERSISTENT_LOGINS` (
  `series` varchar(255) NOT NULL,
  `last_used` datetime DEFAULT NULL,
  `TOKEN` varchar(255) NOT NULL,
  `USERNAME` varchar(255) NOT NULL,
  PRIMARY KEY (`series`),
  UNIQUE KEY `UK_3gq9wkitbp2ave684iu50mhn7` (`TOKEN`),
  UNIQUE KEY `UK_a6c251uovnx2cp2c3vv2dentk` (`USERNAME`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `RecipeDetail`
--

DROP TABLE IF EXISTS `RecipeDetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RecipeDetail` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `CoinName` varchar(255) DEFAULT NULL,
  `contribution` decimal(25,10) DEFAULT NULL,
  `ExchangeName` varchar(255) DEFAULT NULL,
  `Price` decimal(25,10) DEFAULT NULL,
  `BaseCoinID` bigint(20) DEFAULT NULL,
  `RecipeRunID` int(11) DEFAULT NULL,
  `Quantity` decimal(25,10) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_pf7jvmjq3v3trr614b1ask0y7` (`BaseCoinID`),
  KEY `FK_mi3af116u42vs7oc8jq3y4c82` (`RecipeRunID`),
  CONSTRAINT `FK_mi3af116u42vs7oc8jq3y4c82` FOREIGN KEY (`RecipeRunID`) REFERENCES `RecipeRun` (`Id`),
  CONSTRAINT `FK_pf7jvmjq3v3trr614b1ask0y7` FOREIGN KEY (`BaseCoinID`) REFERENCES `BaseCoin` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `RecipeRun`
--

DROP TABLE IF EXISTS `RecipeRun`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RecipeRun` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `DateTime` datetime DEFAULT NULL,
  `InvestmentModeID` int(11) DEFAULT NULL,
  `invRunID` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_6d82x7mdcbp4102o567iwc2es` (`InvestmentModeID`),
  KEY `FK_61s6wd6wfgnvogurkowvq3q6m` (`invRunID`),
  KEY `FK_aa0iidu69hno7qfpva0t6hsdq` (`userId`),
  CONSTRAINT `FK_61s6wd6wfgnvogurkowvq3q6m` FOREIGN KEY (`invRunID`) REFERENCES `InvestmentRun` (`Id`),
  CONSTRAINT `FK_6d82x7mdcbp4102o567iwc2es` FOREIGN KEY (`InvestmentModeID`) REFERENCES `InvestmentMode` (`Id`),
  CONSTRAINT `FK_aa0iidu69hno7qfpva0t6hsdq` FOREIGN KEY (`userId`) REFERENCES `CRYPTX_USER` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `StrategyType`
--

DROP TABLE IF EXISTS `StrategyType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `StrategyType` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Token`
--

DROP TABLE IF EXISTS `Token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Token` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `Blacklist` bit(1) DEFAULT NULL,
  `PreferredExchange` varchar(255) DEFAULT NULL,
  `TokenName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TokenIssuance`
--

DROP TABLE IF EXISTS `TokenIssuance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TokenIssuance` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `date` datetime DEFAULT NULL,
  `TotalTokens` decimal(19,2) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TokenMarketData`
--

DROP TABLE IF EXISTS `TokenMarketData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TokenMarketData` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Updated_Date` datetime DEFAULT NULL,
  `Execute_Date` datetime DEFAULT NULL,
  `Invest_Amount` decimal(19,2) DEFAULT NULL,
  `MarketCap_USD` decimal(30,2) DEFAULT NULL,
  `TokenType` varchar(255) DEFAULT NULL,
  `Tradable` varchar(255) DEFAULT NULL,
  `Volume24_USD` decimal(25,2) DEFAULT NULL,
  `tid` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_9otsi0a37ms6n622w6ujkk773` (`tid`),
  CONSTRAINT `FK_9otsi0a37ms6n622w6ujkk773` FOREIGN KEY (`tid`) REFERENCES `Tokens` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Tokens`
--

DROP TABLE IF EXISTS `Tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Tokens` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `comments` varchar(255) DEFAULT NULL,
  `blacklist` bit(1) DEFAULT NULL,
  `symbol` varchar(255) DEFAULT NULL,
  `token_name` varchar(255) DEFAULT NULL,
  `Valid_From` date DEFAULT NULL,
  `Valid_To` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TradingOrders`
--

DROP TABLE IF EXISTS `TradingOrders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TradingOrders` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Amount` decimal(19,2) DEFAULT NULL,
  `Approved` bit(1) DEFAULT NULL,
  `Exchange` varchar(255) DEFAULT NULL,
  `Execute` bit(1) DEFAULT NULL,
  `orderDate` date DEFAULT NULL,
  `Rate` decimal(19,2) DEFAULT NULL,
  `TokenId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Wallet`
--

DROP TABLE IF EXISTS `Wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Wallet` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Amount` decimal(20,4) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Withdraw`
--

DROP TABLE IF EXISTS `Withdraw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Withdraw` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Active` bit(1) DEFAULT NULL,
  `WithdrawAddress` text,
  `WithdrawAmount` decimal(19,2) DEFAULT NULL,
  `tokenId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_5e7622wuc79x4onf6hhkuj17i` (`tokenId`),
  CONSTRAINT `FK_5e7622wuc79x4onf6hhkuj17i` FOREIGN KEY (`tokenId`) REFERENCES `Token` (`tid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-04-10 12:57:00

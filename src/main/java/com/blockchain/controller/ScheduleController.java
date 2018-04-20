package com.blockchain.controller;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;

import com.blockchain.services.AdminServices;
import com.blockchain.services.DumpServices;
import com.blockchain.services.ExchangeServices;

@org.springframework.scheduling.annotation.EnableScheduling
public class ScheduleController {
	@org.springframework.beans.factory.annotation.Autowired
	DumpServices dumpServices;
	@org.springframework.beans.factory.annotation.Autowired
	AdminServices adminServices;
	@Autowired
	ExchangeServices exchangeServices;

	private static final Logger logger = Logger.getLogger(HomeController.class);

	@Scheduled(cron = "0 0 */1 * * *")
	public void nonApprovedReminderInvokation() {
		logger.debug("nonApprovedReminderInvokation method execution start ... ");
		dumpServices.buyCoins();

		logger.debug("loop of nonApprovedReminderInvokation completed  and method execution also complete... ");
	}

	/*@Scheduled(cron = "0 15 19 ? * WED")
	public void coinByInvokation() {
		logger.debug("coinByInvokation method execution start .................. ");
		String msg = dumpServices.readDataFromCionMarketApi();
		if (msg != null) {
			BigDecimal amount = dumpServices.walletAmount();
			if (amount.compareTo(BigDecimal.ZERO) > 0) {
				dumpServices.addTradingOrders(adminServices.getCoinList(),
						amount);
			}
			dumpServices.tokenIssue(dumpServices.walletAmount());
		}
		logger.debug("coinByInvokation method execution complete... ");
	}*/
	
	@Scheduled(cron = "0 0/1 * * * ?")
	public void updateCoinInfo() {
		dumpServices.updateOrderStatus();
	}
	

	
	@Scheduled(cron = "0 30 18 * * ?")
	public void dailyPriceTicker() {
		exchangeServices.getDailyTickerList();
	}
}

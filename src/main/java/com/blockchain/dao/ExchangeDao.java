package com.blockchain.dao;

import java.util.List;

import com.blockchain.model.Account;
import com.blockchain.model.Exchange;
import com.blockchain.model.ExchangeTradeOrder;
import com.blockchain.model.PriceTicker;
import com.blockchain.model.User;
import com.blockchain.model.Wallet;

public interface ExchangeDao {
	public void saveTradeOrder(ExchangeTradeOrder order);

	public void updateTradeOrder(ExchangeTradeOrder order);

	public List<ExchangeTradeOrder> updateTradeOrder();

	public List<ExchangeTradeOrder> getSuccessOrderList();

	public Wallet getWallet();

	public void updateWalletAmount(Wallet wallet);

	public List<ExchangeTradeOrder> getNonFilledOrders();
	
	public void saveTicker(PriceTicker priceTicker);
	
	public List<PriceTicker> getPriceTicker();
	
	public void saveExchange(Exchange exchange);

	public String getExchangeNamebyCode(String exchangeCode);

	public void saveAccount(Account account);
	
}

package com.blockchain.services;

import java.util.List;

import com.blockchain.dto.AddOrderResponseDTO;
import com.blockchain.dto.BalanceParam;
import com.blockchain.dto.BalancesDTO;
import com.blockchain.dto.ExchangeTradeOrderDTO;
import com.blockchain.dto.ExchangeTradePairDTO;
import com.blockchain.dto.MarketPairDTO;
import com.blockchain.dto.OrderParam;
import com.blockchain.dto.OrderRequest;
import com.blockchain.model.Account;
import com.blockchain.model.Exchange;
import com.blockchain.model.PriceTicker;

public interface ExchangeServices {
	public List<ExchangeTradePairDTO> getMinimumBidExchange(String tradePair);

	public ExchangeTradeOrderDTO buy(OrderRequest or);

	public List<ExchangeTradeOrderDTO> getSuccessOrderList();
	
	public void getDailyTickerList();

	public PriceTicker getTicker(String exchangeCode, String base, String counter);

	public List<Exchange> getAvailableExchangeList();

	public List<Account> getAvailableAccountList();
	
	public List<MarketPairDTO> getMarketpairList(String exchangeCode);
	
	public List<BalancesDTO> getAccountBalance(BalanceParam bp);
	
	public AddOrderResponseDTO addOrder(OrderParam op);


}

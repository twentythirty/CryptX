package com.blockchain.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.blockchain.dao.AdminDAO;
import com.blockchain.dao.ExchangeDao;
import com.blockchain.dto.AddOrderResponseDTO;
import com.blockchain.dto.BalanceParam;
import com.blockchain.dto.BalancesDTO;
import com.blockchain.dto.ExchangeTradeOrderDTO;
import com.blockchain.dto.ExchangeTradePairDTO;
import com.blockchain.dto.MarketPairDTO;
import com.blockchain.dto.OrderParam;
import com.blockchain.dto.OrderRequest;
import com.blockchain.mapper.ExchangeMapper;
import com.blockchain.model.Account;
import com.blockchain.model.Exchange;
import com.blockchain.model.ExchangeMarket;
import com.blockchain.model.ExchangeTradeOrder;
import com.blockchain.model.PriceTicker;
import com.fasterxml.jackson.databind.ObjectMapper;

@Transactional(rollbackFor = { Exception.class }, noRollbackFor = { Exception.class })
@Service("exchangeServices")
public class ExchangeServicesImpl implements ExchangeServices {

	@Autowired
	ExchangeDao exchangeDao;
	@Autowired
	AdminDAO adminDAO;

	public static final String API_URL = "http://localhost:9090/warlordService/api/";

	@Override
	public List<ExchangeTradePairDTO> getMinimumBidExchange(String tradePair) {
		try {
			RestTemplate template = new RestTemplate();
			// Read the data from the api and mapExchangeTradePairDTOList.java
			// into object
			ExchangeTradePairDTO result[] = template.getForObject(API_URL + "realtime/" + tradePair,
					ExchangeTradePairDTO[].class);
			List<ExchangeTradePairDTO> resultList = Arrays.asList(result);
			return resultList;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * @param exchangeTradePair
	 * @return
	 */
	/*
	 * private ExchangeTradePairDTO getMinBid(ExchangeTradePairDTOList
	 * exchangeTradePair) { return Collections.min(exchangeTradePair.getData(),
	 * new Comparator<ExchangeTradePairDTO>() {
	 * 
	 * @Override public int compare(ExchangeTradePairDTO newObject,
	 * ExchangeTradePairDTO oldObject) { return
	 * newObject.getBid().compareTo(oldObject.getBid()); } }); }
	 */
	@Override
	public ExchangeTradeOrderDTO buy(OrderRequest or) {
		RestTemplate template = new RestTemplate();
		String s = template.postForObject(API_URL + "buy", or, String.class);
		if (s.contains("error_code"))
			return null;
		try {
			ExchangeTradeOrderDTO order = new ObjectMapper().readValue(s, ExchangeTradeOrderDTO.class);
			return order;
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;

	}

	@Override
	public List<ExchangeTradeOrderDTO> getSuccessOrderList() {
		List<ExchangeTradeOrder> list = exchangeDao.getSuccessOrderList();
		List<ExchangeTradeOrderDTO> dtoList = new ArrayList<>();
		for (ExchangeTradeOrder order : list) {
			ExchangeTradeOrderDTO orderDto = new ExchangeTradeOrderDTO();
			new ExchangeMapper().modelToTradeOrderDTO(order, orderDto);
			dtoList.add(orderDto);
		}
		return dtoList;
	}

	@Override
	public void getDailyTickerList() {
		List<PriceTicker> tickerList = adminDAO.getPriceTicker();
		if (tickerList.isEmpty()) {
			try {
				RestTemplate template = new RestTemplate();
				PriceTicker result[] = template.getForObject(API_URL + "dailyPriceTicker", PriceTicker[].class);
				if (result.length > 0) {
					List<PriceTicker> resultList = Arrays.asList(result);
					for (PriceTicker ticker : resultList) {
						exchangeDao.saveTicker(ticker);
					}
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}
	
	@Override
	public List<Exchange> getAvailableExchangeList() {
		List<Exchange> exchangeList = adminDAO.getExchangeList();
		
		if(exchangeList.isEmpty()){
			try{
				RestTemplate template = new RestTemplate();
				Exchange result[] = template.getForObject(API_URL + "exchageData", Exchange[].class);
				if (result != null)
					if(result.length > 0) {
						exchangeList = Arrays.asList(result);
					for (Exchange exchange : exchangeList) {
						exchangeDao.saveExchange(exchange);
					}
				}
			}
			catch(Exception e){
				e.printStackTrace();
			}
		}
		return exchangeList;
	} 
	
	@Override
	public List<Account> getAvailableAccountList() {
		List<Account> accountList = adminDAO.getAccountList();
		
		if(accountList.isEmpty()){
			try{
				RestTemplate template = new RestTemplate();
				Account result[] = template.getForObject(API_URL + "accounts", Account[].class);
				if (result != null)
					if(result.length > 0) {
						accountList = Arrays.asList(result);
					for (Account account : accountList) {
						exchangeDao.saveAccount(account);
					}
				}
			}
			catch(Exception e){
				e.printStackTrace();
			}
		}
		
		
		return accountList;
	} 
	
	/*@Override
	public List<MarketPairDTO> getMarketPairListByExchangeCode(String exchange_code) {

		List<MarketPairDTO> marketPairList = new ArrayList<MarketPair>();
			try{
				RestTemplate template = new RestTemplate();
				MarketPairDTO result[] = template.getForObject(API_URL + "markets" + exchange_code , MarketPairDTO[].class);
				if (result != null)
					if(result.length > 0) {
						marketPairList = Arrays.asList(result);
					for (MarketPairDTO marketPair : marketPairList) {
						exchangeDao.saveAccount(marketPair);
					}
				}
			}
			catch(Exception e){
				e.printStackTrace();
			}
		}
		
		
		return accountList;
	} */
	
	
	@Override
	public PriceTicker getTicker(String exchangeCode, String base, String counter ) {
		try {
			RestTemplate template = new RestTemplate();
			// Read the data from the api and map PriceTicker.java
			// into object
			
			PriceTicker[] result = template.getForObject(API_URL + "/ticker/"+exchangeCode+"/"+base+"/"+counter,
					PriceTicker[].class);
			if(result!=null && result.length>0)
			return result[0];
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	@Override
	public List<MarketPairDTO> getMarketpairList(String exchangeCode) {
		
		try {
			RestTemplate template = new RestTemplate();
			// Read the data from the api and mapExchangeTradePairDTOList.java
			// into object
			MarketPairDTO result[] = template.getForObject(API_URL + "markets/" + exchangeCode,
					MarketPairDTO[].class);
			List<MarketPairDTO> resultList = Arrays.asList(result);
			return resultList;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
		
	}

	@Override
	public List<BalancesDTO> getAccountBalance(BalanceParam bp) {
		RestTemplate template = new RestTemplate();
		BalancesDTO[] s = template.postForObject(API_URL + "balances", bp, BalancesDTO[].class);
		
		try {
			List<BalancesDTO> resultList = Arrays.asList(s);
			return resultList;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
		
	}

	@Override
	public AddOrderResponseDTO addOrder(OrderParam op) {
		RestTemplate template = new RestTemplate();
		AddOrderResponseDTO s = template.postForObject(API_URL + "addOrder", op, AddOrderResponseDTO.class);
		return s;
		
	}
}

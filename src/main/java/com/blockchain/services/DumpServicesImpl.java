package com.blockchain.services;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.MathContext;
import java.math.RoundingMode;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.CipherException;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.WalletUtils;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.Contract;

import com.blockchain.contract.CryptxToken;
import com.blockchain.dao.DumpDAO;
import com.blockchain.dao.ExchangeDao;
import com.blockchain.dao.UserDao;
import com.blockchain.dto.AddOrderResponseDTO;
import com.blockchain.dto.BalanceParam;
import com.blockchain.dto.BalancesDTO;
import com.blockchain.dto.BitCoinDataDTO;
import com.blockchain.dto.CurrentPortfolioDTO;
import com.blockchain.dto.ExchangeTradeOrderDTO;
import com.blockchain.dto.ExchangeTradePairDTO;
import com.blockchain.dto.Invest;
import com.blockchain.dto.InvestmentApprovalsDTO;
import com.blockchain.dto.MarketPairDTO;
import com.blockchain.dto.OrderApprovalsDTO;
import com.blockchain.dto.OrderExecutionConfigDTO;
import com.blockchain.dto.OrderParam;
import com.blockchain.dto.OrderRequest;
import com.blockchain.dto.RecipeInvapp_RecipeDetailDTO;
import com.blockchain.dto.RecipeRunInvApprovalDTO;
import com.blockchain.dto.TokenDTO;
import com.blockchain.dto.TokenIssuanceDTO;
import com.blockchain.dto.TradingOrderDTO;
import com.blockchain.dto.UserDTO;
import com.blockchain.dto.WithdrawDTO;
import com.blockchain.mapper.ExchangeMapper;
import com.blockchain.model.Account;
import com.blockchain.model.BitCoinData;
import com.blockchain.model.BlacklistedTokenInfo;
import com.blockchain.model.CoinIgyToken;
import com.blockchain.model.Deposit;
import com.blockchain.model.ExchangeMarket;
import com.blockchain.model.ExchangeTradeOrder;
import com.blockchain.model.InvestmentApprovals;
import com.blockchain.model.InvestmentRun;
import com.blockchain.model.OrderDetail;
import com.blockchain.model.OrderExecution;
import com.blockchain.model.OrderExecutionConfiguration;
import com.blockchain.model.OrderRun;
import com.blockchain.model.PriceTicker;
import com.blockchain.model.RecipeDetail;
import com.blockchain.model.RecipeRun;
import com.blockchain.model.TokenIssuance;
import com.blockchain.model.TokenMarketData;
import com.blockchain.model.TradingOrder;
import com.blockchain.model.User;
import com.blockchain.model.UserProfile;
import com.blockchain.model.Wallet;
import com.blockchain.model.Withdraw;
import com.blockchain.utils.DateUtils;
import com.blockchain.utils.JsonUtils;
import com.blockchain.utils.MathUtils;

@Transactional(rollbackFor = { Exception.class }, noRollbackFor = { Exception.class })
@Service("dumpServices")
public class DumpServicesImpl implements DumpServices {
	@Autowired
	DumpDAO dumpDAO;
	@Autowired
	private PasswordEncoder passwordEncoder;
	@Autowired
	private UserDao dao;
	@Autowired
	ExchangeDao exchangeDao;
	@Autowired
	ExchangeServices exchangeServices;
	private static Logger logger = Logger.getLogger(DumpServicesImpl.class);
	
	BigDecimal totalBTC = new BigDecimal(0.0);
	BigDecimal totalETH = new BigDecimal(0.0);
	BigDecimal buPrice = new BigDecimal(0.0);
	BigDecimal euPrice = new BigDecimal(0.0);
	
	BigDecimal totalBTCToBuy = new BigDecimal(0.0);
	BigDecimal totalETHToBuy = new BigDecimal(0.0);
	
	public Map<String, Object> readDataFromCionMarketApi(int invRunId) {

		BigDecimal lci_invest_amount = new BigDecimal(0.0);
		BigDecimal mci_invest_amount = new BigDecimal(0.0);
		Map <String , Object> map = new LinkedHashMap<>();
		InvestmentRun investRun = new InvestmentRun();
		exchangeServices.getAvailableExchangeList();
		exchangeServices.getAvailableAccountList();
		investRun = dumpDAO.getInvestmentRunbyId(invRunId);
		
		if (investRun.getStrategyType().getName().equals("LCI")) {
			lci_invest_amount = investRun.getAmount();
		} else {
			mci_invest_amount = investRun.getAmount();
		}

		String token_symbol = null;
		String token_name = null;
		BigDecimal total_mkt_cap = new BigDecimal(0.0);
		BigDecimal token_cap = new BigDecimal(0.0);
		BigDecimal token_cap_24 = new BigDecimal(0.0);

		List<TokenMarketData> tmd_list = new ArrayList<TokenMarketData>();

		try {
			JSONArray jsonArray = JsonUtils.readJsonFromUrl("https://api.coinmarketcap.com/v1/ticker/");
			System.out.println("============in readDataFromCionMarketApi====after reading data from coinmarketcap======= ");
			for (int i = 0; i < jsonArray.length(); i++) {
				TokenMarketData tmd = new TokenMarketData();
				JSONObject ob = jsonArray.getJSONObject(i);
				try {
					token_cap = ob.getBigDecimal("market_cap_usd");
					tmd.setMarketCapUSD(token_cap);
				} catch (JSONException | NullPointerException | NumberFormatException e) {
					logger.error(
							"Exception Generate from catch block  methodName : rereadDataFromCionMarketApi Catch Block (market_cap_usd) for coin "
									+ ob.getString("name"),
							e);
				}

				try {
					token_cap_24 = ob.getBigDecimal("24h_volume_usd");
					tmd.setVolume24USD(token_cap_24);
				} catch (JSONException | NullPointerException | NumberFormatException e) {
					logger.error(
							"Exception Generate from catch block  methodName : rereadDataFromCionMarketApi Catch Block (24h_volume_usd) for coin "
									+ ob.getString("name"),
							e);
				}

				try {
					long last_updated = ob.getLong("last_updated");
					tmd.setDate(new Timestamp(last_updated * 1000L));
				} catch (JSONException | NumberFormatException e) {
					logger.error(
							"Exception Generate from catch block  methodName : rereadDataFromCionMarketApi Catch Block (last_updated) for coin "
									+ ob.getString("name"),
							e);
				}
				tmd.setExecuteDate(new Timestamp(System.currentTimeMillis()));
				CoinIgyToken token = dumpDAO.getToken(ob.getString("symbol"));
				if (token != null) {
					tmd.setCoinIgyToken(token);
				} else {
					CoinIgyToken newToken = new CoinIgyToken();
					newToken.setSymbol(ob.getString("symbol"));
					newToken.setTokenName(ob.getString("name"));
					newToken.setBlackList(false);
					CoinIgyToken nTOken = dumpDAO.saveToken(newToken);
					tmd.setCoinIgyToken(nTOken);
				}

				// Skip market cap of blacklisted token
				if (!isBlackList(ob.getString("symbol"))) {
					tmd_list.add(tmd);
					total_mkt_cap = total_mkt_cap.add(token_cap);
				}
			}

			int uid = getCurrentUser().getUid();
			int recRunId = 0;
			RecipeRun recipe = new RecipeRun();
			
			recipe.setInvestmentRun(investRun);
			recipe.setInvestmentMode(investRun.getInvestmentMode());
			recipe.setDateTime(new Timestamp(System.currentTimeMillis()));
			recipe.setUser(dao.findById(uid));
			recRunId = dumpDAO.saveRecipeRun(recipe);
			investRun.setLastUpdatedDateTime(new Timestamp(System.currentTimeMillis()));

			InvestmentApprovals invApprov = new InvestmentApprovals();
			
			List<RecipeRun> reciperunList = dumpDAO.getRecipeRunbyInvRunId(investRun);
			for(RecipeRun recipeRun:reciperunList){
				invApprov.setInvestmentRun(investRun);
				invApprov.setRecipeRun(recipeRun);
				invApprov.setDateTime(new Timestamp(System.currentTimeMillis()));
				invApprov.setUser(dao.findById(uid));
				dumpDAO.saveInvestmentApprovals(invApprov);
			}
			   
			investRun.setLastUpdatedDateTime(new Timestamp(System.currentTimeMillis()));
			
			map.put("i_run_id", investRun.getId());
			map.put("rec_run_id",recRunId);
			map.put("invRun", investRun);
			
			List<TokenMarketData> all_coins = new ArrayList<TokenMarketData>();
			List<TokenMarketData> lciList = new ArrayList<TokenMarketData>();
			List<TokenMarketData> mciList = new ArrayList<TokenMarketData>();
			BigDecimal market_cap_90 = total_mkt_cap.multiply(new BigDecimal(0.9));
			BigDecimal coin_cap = new BigDecimal(0.0);
			BigDecimal cap = new BigDecimal(0.0);

			for (TokenMarketData tmdList : tmd_list) {
				coin_cap = tmdList.getMarketCapUSD();
				cap = cap.add(coin_cap);

				if (market_cap_90.compareTo(cap) >= 0) {
					lciList.add(tmdList);
				}
				all_coins.add(tmdList);
			}
			int numLCIList = lciList.size();
			BigDecimal lci_invest_amount_perCoin = new BigDecimal(0.0);
			BigDecimal mci_invest_amount_perCoin = new BigDecimal(0.0);

			if (numLCIList > 20) {
				if (investRun.getStrategyType().getName().equals("LCI")) {
					lciList = lciList.stream().limit(20).collect(Collectors.toList());
					lci_invest_amount_perCoin = lci_invest_amount.divide(new BigDecimal(20), 2, RoundingMode.HALF_UP);
					map.put("list",lciList);
				} else {
					mciList = all_coins.subList(20, 70);
					mci_invest_amount_perCoin = mci_invest_amount.divide(new BigDecimal(50),2, RoundingMode.HALF_UP);
					map.put("list",mciList);
				}
			} else {
				if (investRun.getStrategyType().getName().equals("LCI")) {
					lci_invest_amount_perCoin = lci_invest_amount.divide(new BigDecimal(numLCIList), 2,
							RoundingMode.HALF_UP);
					map.put("list",lciList);
				} else {
					mciList = all_coins.subList(numLCIList, numLCIList + 50);
					mci_invest_amount_perCoin = mci_invest_amount.divide(new BigDecimal(50), 2,
							RoundingMode.HALF_UP);
					map.put("list",mciList);
				}
			}

			if (investRun.getStrategyType().getName().equals("LCI")) {
				for (TokenMarketData lci : lciList) {
					lci.setTokenType("LCI");
					lci.setInvestAmount(lci_invest_amount_perCoin);
					tmd_list.add(lci);
					System.out.println(lci.getMarketCapUSD());
					// dumpDAO.storeData(lci);
				}
			} else {
				for (TokenMarketData mci : mciList) {
					mci.setTokenType("MCI");
					mci.setInvestAmount(mci_invest_amount_perCoin);
					tmd_list.add(mci);
					 //dumpDAO.storeData(mci);
				}
			}
			
			List<ExchangeMarket> emList= new ArrayList<ExchangeMarket>();
			List<TokenMarketData> tmList= new ArrayList<TokenMarketData>();
			
			if (investRun.getStrategyType().getName().equals("LCI")){
				emList = buyRecipe(lciList);
				tmList = lciList;
			}
			else{
				emList = buyRecipe(mciList);
				tmList = mciList;
			}
			
			for(TokenMarketData tm: tmList){
				  for(ExchangeMarket em: emList){
					if(em.getSymbol().equals(tm.getCoinIgyToken().getSymbol())){
						tm.setTradable("Yes");
						break;
					}
					else{
						tm.setTradable("No");
					}
				  }
				}
			dumpDAO.saveTokenMarketData(tmList);
			map.put("list",tmList);
			int finalCoinListSize = emList.size();
			BigDecimal invest_amount_perCoin = new BigDecimal(0.0);
			if (investRun.getStrategyType().getName().equals("LCI")){
				invest_amount_perCoin = lci_invest_amount.divide(new BigDecimal(finalCoinListSize), 2,RoundingMode.HALF_UP);
			}
			else{
				invest_amount_perCoin = mci_invest_amount.divide(new BigDecimal(finalCoinListSize), 2,RoundingMode.HALF_UP);
			}
			
			PriceTicker buTicker = exchangeServices.getTicker("BITF", "BTC", "USD");
			buPrice = buTicker.getAsk();
			
			PriceTicker euTicker = exchangeServices.getTicker("BITF", "ETH", "USD");
			euPrice = euTicker.getAsk();
			
			for(ExchangeMarket exMkt : emList){
				exMkt.setAmount(invest_amount_perCoin);
				
				if(exMkt.getBaseType().equals("BTC") && !exMkt.getSymbol().equals("BTC")){
					totalBTC = totalBTC.add(exMkt.getAmount());
					BigDecimal btcQty_perCoin = invest_amount_perCoin.divide(buPrice, 4,  RoundingMode.HALF_UP);
					BigDecimal qty_perCoin = btcQty_perCoin.divide(exMkt.getAsk(), 4,  RoundingMode.HALF_UP);
					exMkt.setQuantity(qty_perCoin);
				}
				else if(exMkt.getBaseType().equals("ETH") && !exMkt.getSymbol().equals("ETH")){
					totalETH = totalETH.add(exMkt.getAmount());
					BigDecimal ethQty_perCoin = invest_amount_perCoin.divide(euPrice, 4,  RoundingMode.HALF_UP);
					BigDecimal qty_perCoin = ethQty_perCoin.divide(exMkt.getAsk(), 4,  RoundingMode.HALF_UP);
					exMkt.setQuantity(qty_perCoin);
				}
				else if(exMkt.getSymbol().equals("BTC")){
					totalBTC = totalBTC.add(exMkt.getAmount());
					BigDecimal btcQty = invest_amount_perCoin.divide(buPrice, 4,  RoundingMode.HALF_UP);
					exMkt.setQuantity(btcQty);
				}
				else if(exMkt.getSymbol().equals("ETH")){
					totalETH = totalETH.add(exMkt.getAmount());
					BigDecimal ethQty = invest_amount_perCoin.divide(euPrice, 4,  RoundingMode.HALF_UP);
					exMkt.setQuantity(ethQty);
				}
					
			}
			
			dumpDAO.saveMarketExchange(emList);
			
			for(ExchangeMarket exMkt : emList)
			{
			  RecipeDetail recDetail = new RecipeDetail();
			  List<RecipeRun> recipeRunList = dumpDAO.getRecipeRunbyInvRunId(investRun);
			  for(RecipeRun recipeRun:recipeRunList){
			  recDetail.setRecipeRun(recipeRun); 
			  recDetail.setCoinName(exMkt.getName());
			  recDetail.setBaseCoin(dumpDAO.getBaseCoinbyName(exMkt.getBaseType()));
			  recDetail.setExchangeName(exMkt.getExchangeName());
			  recDetail.setPrice(exMkt.getAsk());
			  recDetail.setQuantity(exMkt.getQuantity());
			  recDetail.setContribution((exMkt.getAmount().divide(investRun.getAmount(),4, RoundingMode.HALF_UP)).multiply(new BigDecimal(100)));
			  dumpDAO.saveRecipeDetail(recDetail);
			  
			  Deposit avl_deposit = dumpDAO.getDepositbyParams(recRunId, invRunId, exMkt.getExchangeName(), exMkt.getBaseType());
			  
					if (avl_deposit==null) {
						Deposit deposit = new Deposit();
						deposit.setInvRunID(invRunId);
						deposit.setRecipeRunID(recRunId);
						deposit.setBaseCoinID(exMkt.getBaseType());
						if (exMkt.getBaseType().equals("BTC") && !exMkt.getSymbol().equals("BTC") && !exMkt.getSymbol().equals("ETH")) {
							deposit.setAmount(exMkt.getAmount().divide(buPrice, 4, RoundingMode.HALF_UP));
						} else if (exMkt.getBaseType().equals("ETH") && !exMkt.getSymbol().equals("BTC") && !exMkt.getSymbol().equals("ETH")){
							deposit.setAmount(exMkt.getAmount().divide(euPrice, 4, RoundingMode.HALF_UP));
						}
						deposit.setExchangeAccountID(exMkt.getExchangeName());
						dumpDAO.saveDeposit(deposit);
					}
					else{
						if (exMkt.getBaseType().equals("BTC")) {
							avl_deposit.setAmount(exMkt.getAmount().divide(buPrice, 4, RoundingMode.HALF_UP).add(avl_deposit.getAmount()));
						} else {
							avl_deposit.setAmount(exMkt.getAmount().divide(euPrice, 4, RoundingMode.HALF_UP).add(avl_deposit.getAmount()));
						}
						dumpDAO.updateDeposit(avl_deposit);
					}
				}
			}
			 totalBTCToBuy = totalBTC.divide(buPrice, 4,  RoundingMode.HALF_UP);
			 totalETHToBuy = totalETH.divide(euPrice, 4, RoundingMode.HALF_UP);
			 
			 System.out.println("=============totalBTCToBuy=============="+totalBTCToBuy);
			 System.out.println("=============totalETHToBuy=============="+totalETHToBuy);
			return map;
		} catch (Exception e) {
			logger.error("Exception Generate from outside try block of readDataFromCionMarketApi", e);
		}
		return new LinkedHashMap<>();
	}
	
	@Override
	public List<ExchangeMarket> buyRecipe(List<TokenMarketData> tokenMarketList) {

		//List<TokenMarketData> tokenMarketList = getTokenMarketList();
		List<PriceTicker> priceTickerList = exchangeDao.getPriceTicker();
		
		BigDecimal btcInvestAmount = new BigDecimal(0.0);
		BigDecimal ethInvestAmount = new BigDecimal(0.0);

		List<ExchangeMarket> exchageMarketList = new ArrayList<ExchangeMarket>();
		ExchangeMarket btcEM = new ExchangeMarket();
		ExchangeMarket ethEM = new ExchangeMarket();

		String tokenCoinIGY;
		String tokenTicker;
		BigDecimal investAmount;

		for (TokenMarketData tmd : tokenMarketList) {

			tokenCoinIGY = tmd.getCoinIgyToken().getSymbol();
			if (tokenCoinIGY.equals("BTC")) {
				btcInvestAmount = tmd.getInvestAmount();
				btcEM.setAmount(btcInvestAmount);
				btcEM.setTokenType(tmd.getTokenType());
				btcEM.setSymbol(tmd.getCoinIgyToken().getSymbol());
				btcEM.setName(tmd.getCoinIgyToken().getTokenName());
				btcEM.setBaseType("BTC");
				btcEM.setFlag("BTC Coin");
				btcEM.setMarketCapUSD(tmd.getMarketCapUSD());
				btcEM.setVolume24USD(tmd.getVolume24USD());
				btcEM.setDate(tmd.getDate());
				//totalBTC = totalBTC.add(btcInvestAmount);
			} else if (tokenCoinIGY.equals("ETH")) {
				ethInvestAmount = tmd.getInvestAmount();
				ethEM.setAmount(ethInvestAmount);
				ethEM.setTokenType(tmd.getTokenType());
				ethEM.setSymbol(tmd.getCoinIgyToken().getSymbol());
				ethEM.setName(tmd.getCoinIgyToken().getTokenName());
				ethEM.setBaseType("ETH");
				ethEM.setFlag("ETH Coin");
				ethEM.setMarketCapUSD(tmd.getMarketCapUSD());
				ethEM.setVolume24USD(tmd.getVolume24USD());
				ethEM.setDate(tmd.getDate());
				//totalETH = totalETH.add(ethInvestAmount);
			}

			for (PriceTicker pt : priceTickerList) {
				tokenTicker = (pt.getMarket().split("/"))[0];
				if (tokenCoinIGY.equals(tokenTicker) && !tokenCoinIGY.equals("BTC") && !tokenCoinIGY.equals("ETH")) {
					ExchangeMarket em = new ExchangeMarket();
					em.setExchangeName(pt.getExchange());
					em.setMarketName(pt.getMarket());
					em.setAsk(exchangeServices
							.getTicker(pt.getExchange(), pt.getMarket().split("/")[1], pt.getMarket().split("/")[0])
							.getAsk());
					em.setAmount(tmd.getInvestAmount());
					em.setSymbol(tmd.getCoinIgyToken().getSymbol());
					em.setName(tmd.getCoinIgyToken().getTokenName());
					em.setTokenType(tmd.getTokenType());
					em.setMarketCapUSD(tmd.getMarketCapUSD());
					em.setVolume24USD(tmd.getVolume24USD());
					em.setDate(tmd.getDate());

					if ((pt.getMarket().split("/"))[1].equals("BTC")) {
						em.setBaseType("BTC");
						em.setFlag("BTC Coin");
					} else {
						em.setBaseType("ETH");
						em.setFlag("ETH Coin");
					}
					exchageMarketList.add(em);
				}
			}
		}
		Map<String, ExchangeMarket> filteredExchageMarketMap = new HashMap<String, ExchangeMarket>();

		BigDecimal convAsk1 = new BigDecimal(0.0);
		BigDecimal convAsk2 = new BigDecimal(0.0);

		PriceTicker ebTicker = exchangeServices.getTicker("PLNX", "ETH", "BTC");
		System.out.println("==========ticker=======" + ebTicker);

		BigDecimal ebPrice = ebTicker.getAsk();

		PriceTicker buTicker = exchangeServices.getTicker("BITF", "BTC", "USD");
		buPrice = buTicker.getAsk();
		btcEM.setAsk(buPrice);
		btcEM.setExchangeName("BITF");
		btcEM.setMarketName("BTC/USD");

		PriceTicker euTicker = exchangeServices.getTicker("BITF", "ETH", "USD");
		euPrice = euTicker.getAsk();
		ethEM.setAsk(euPrice);
		ethEM.setExchangeName("BITF");
		ethEM.setMarketName("ETH/USD");
		
		List<ExchangeMarket> uniqueMarketNameExchageMarketList = new ArrayList<ExchangeMarket>();
		ExchangeMarket tempEM =null;
		
		for (int i = 0; i < exchageMarketList.size(); i++) {
			String marketName1 = exchageMarketList.get(i).getMarketName();
			BigDecimal ask1 = exchageMarketList.get(i).getAsk();
			
			if(!uniqueMarketNameExchageMarketList.isEmpty())
			{
			   for(ExchangeMarket exMkt : uniqueMarketNameExchageMarketList )
			   {
				   if(!(exMkt.getMarketName()).equals(tempEM.getMarketName())){
					   tempEM = exchageMarketList.get(i);
				   }
			   }
			}
			else{
			      tempEM = exchageMarketList.get(i);
			}
			
			for (int j = i + 1; j < exchageMarketList.size(); j++) {
				BigDecimal ask2 = exchageMarketList.get(j).getAsk();
				String marketName2 = exchageMarketList.get(j).getMarketName();
				if(marketName1.equals(marketName2)){
					if ((tempEM.getAsk()).compareTo(ask2) <= 0) {
						tempEM = exchageMarketList.get(i);
					}
					else{
						tempEM = exchageMarketList.get(j);
					}
				}
			}
			uniqueMarketNameExchageMarketList.add(tempEM);
		}

		for (int i = 0; i < uniqueMarketNameExchageMarketList.size(); i++) {
			String marketName1 = uniqueMarketNameExchageMarketList.get(i).getMarketName();
			BigDecimal ask1 = uniqueMarketNameExchageMarketList.get(i).getAsk();

			for (int j = i + 1; j < uniqueMarketNameExchageMarketList.size(); j++) {
				BigDecimal ask2 = uniqueMarketNameExchageMarketList.get(j).getAsk();
				String marketName2 = uniqueMarketNameExchageMarketList.get(j).getMarketName();
				if (marketName1.split("/")[0].equals(marketName2.split("/")[0])) {
								
					 if (marketName1.split("/")[1].equals("BTC") && marketName2.split("/")[1].equals("ETH")) {
						convAsk2 = ask2.multiply(ebPrice);
						if (ask1.compareTo(convAsk2) <= 0) {
							filteredExchageMarketMap.put(marketName1.split("/")[0], uniqueMarketNameExchageMarketList.get(i));
						} else {
							filteredExchageMarketMap.put(marketName1.split("/")[0], uniqueMarketNameExchageMarketList.get(j));
						}
					}
					else if (marketName1.split("/")[1].equals("ETH") && marketName2.split("/")[1].equals("BTC")) {
						convAsk1 = ask1.multiply(ebPrice);
						if (convAsk1.compareTo(ask2) <= 0) {
							filteredExchageMarketMap.put(marketName1.split("/")[0], uniqueMarketNameExchageMarketList.get(i));
						} else {
							filteredExchageMarketMap.put(marketName1.split("/")[0], uniqueMarketNameExchageMarketList.get(j));
						}
					} 
				}
			}
		}
		List<ExchangeMarket> filteredExchageMarketList = new ArrayList<ExchangeMarket>(
				filteredExchageMarketMap.values());
		
		if (btcEM.getSymbol() != null) {
			filteredExchageMarketList.add(btcEM);
		}
		if (ethEM.getSymbol() != null) {
			filteredExchageMarketList.add(ethEM);
		}
		return filteredExchageMarketList;
	}
	
	public InvestmentRun newInvestmentRun(Invest invest)
	{
		invest.setStartedDate(new Timestamp(System.currentTimeMillis()));
		String strgyType = invest.getStrategyType();
		BigDecimal amount = new BigDecimal(0.0);
		amount = invest.getAmount();
		int uid = getCurrentUser().getUid();
		List<InvestmentRun> invRunList = dumpDAO.getInvestmentRunbyUser(uid);
		if(!invRunList.isEmpty())
		{
			for(InvestmentRun ir: invRunList){
				if(((ir.getStrategyType().getName().equals(strgyType)) && (ir.getAmount().compareTo(amount)==0)))
				{
					return null;
				}
			}
		}
		
		InvestmentRun investRun = new InvestmentRun();
		investRun.setUser(dao.findById(uid));
		investRun.setStartedDateTime(invest.getStartedDate());
		investRun.setLastUpdatedDateTime(invest.getStartedDate());
		investRun.setAmount(invest.getAmount());
		investRun.setNumberOfShares(invest.getNumberOfShares());
		investRun.setCurrency(invest.getCurrency());
		investRun.setInvWorkflowState(dumpDAO.getInvWorkflowStatebyName("Initiated")); 
		investRun.setStrategyType(dumpDAO.getStrategyTypebyName(invest.getStrategyType()));
		investRun.setInvestmentMode(dumpDAO.getInvestmentModebyName(invest.getInvestmentMode()));
		int id = dumpDAO.saveInvestmentRun(investRun);
		
		return investRun;
	}
	
	public Map<String, Object> newRecipeRun(int invRunId)
	{
		Map <String , Object> map = new LinkedHashMap<>();
		map = readDataFromCionMarketApi(invRunId);
		return map;
	}

	public void approveRecipe(InvestmentApprovalsDTO investmentApprovalsDTO) {
		
		RecipeRun recipeRun = dumpDAO.getRecipeRunbyId(investmentApprovalsDTO.getRecipeRunId());
		InvestmentRun invRun = dumpDAO.getInvestmentRunbyId(recipeRun.getInvestmentRun().getId());
		invRun.setInvWorkflowState(dumpDAO.getInvWorkflowStatebyName("RecipeApproved"));
		invRun.setLastUpdatedDateTime(new Timestamp(System.currentTimeMillis()));
		dumpDAO.updateInvestmentRun(invRun);
		
		InvestmentApprovals invApprov = dumpDAO.getInvestmentApprovalsbyRecipeRunId(investmentApprovalsDTO.getRecipeRunId());
		invApprov.setApprovalType(dumpDAO.getApprovalTypebyName("RecipeApproved"));
	    invApprov.setRationale(investmentApprovalsDTO.getRationale());	
	    invApprov.setDateTime(new Timestamp(System.currentTimeMillis()));
		dumpDAO.updateInvestmentApprovals(invApprov);
	}

	public void rejectRecipe(InvestmentApprovalsDTO investmentApprovalsDTO) {
		
		
		RecipeRun recipeRun = dumpDAO.getRecipeRunbyId(investmentApprovalsDTO.getRecipeRunId());
		InvestmentRun invRun = dumpDAO.getInvestmentRunbyId(recipeRun.getInvestmentRun().getId());
		invRun.setInvWorkflowState(dumpDAO.getInvWorkflowStatebyName("Rejected"));
		invRun.setLastUpdatedDateTime(new Timestamp(System.currentTimeMillis()));
		invRun.setCompletedDateTime(new Timestamp(System.currentTimeMillis()));
		dumpDAO.updateInvestmentRun(invRun);
		
		InvestmentApprovals invApprov = dumpDAO.getInvestmentApprovalsbyRecipeRunId(investmentApprovalsDTO.getRecipeRunId());
		invApprov.setApprovalType(dumpDAO.getApprovalTypebyName("RecipeRejected"));
		invApprov.setRationale(investmentApprovalsDTO.getRationale());
		invApprov.setDateTime(new Timestamp(System.currentTimeMillis()));
		dumpDAO.updateInvestmentApprovals(invApprov);
		
	}
	
	public Map<String, Object> createOrder(int recipeRunId)
	{
		Map <String , Object> map = new LinkedHashMap<>();
		try{
		System.out.println("========createOrder Calling]================="+recipeRunId);
		OrderRun orderRun = new OrderRun();
		List<RecipeDetail> recipeDetailList = new ArrayList<RecipeDetail>(); 
		
		RecipeRun recipeRun = dumpDAO.getRecipeRunbyId(recipeRunId);
		orderRun.setRecipeRun(recipeRun);
		orderRun.setInvestmentRun(recipeRun.getInvestmentRun());
		orderRun.setInvestmentMode(recipeRun.getInvestmentMode());
		orderRun.setUser(recipeRun.getUser());
		orderRun.setDateTimeGenerated(new Timestamp(System.currentTimeMillis()));
		orderRun.setOrderSide(dumpDAO.getOrderSidebyName("Buy"));
		int orderRunId = dumpDAO.saveOrderRun(orderRun);
		
		dumpDAO.getInvestmentApprovalsbyRecipeRunId(recipeRunId).setOrderRun(orderRun);
		/*recipeRun.getInvestmentRun().setInvWorkflowState(dumpDAO.getInvWorkflowStatebyName("OrdersGenerated"));*/
	  
	    map.put("orderRunData", orderRun);
	    
	    recipeDetailList = dumpDAO.getRecipeDetailbyRecipeRunId(recipeRun);
	    List<OrderDetail> orderDetailList = new ArrayList<OrderDetail>();
	    for(RecipeDetail recDetail : recipeDetailList){
	    	OrderDetail orderDetail = new OrderDetail();
	    	orderDetail.setOrderRun(orderRun);
	    	orderDetail.setBaseCoin(recDetail.getBaseCoin());
	    	orderDetail.setCoinTokenId(recDetail.getCoinName());
	    	orderDetail.setExch_code(recDetail.getExchangeName());
	    	orderDetail.setPrice(recDetail.getPrice());
	    	orderDetail.setQuantity(recDetail.getQuantity());
	    	BigDecimal total_amount = recipeRun.getInvestmentRun().getAmount();
	    	BigDecimal contribution = recDetail.getContribution();
	    	orderDetail.setContribution(contribution);
	    	orderDetail.setAmount((total_amount.multiply(contribution)).divide(new BigDecimal(100.0), 4, RoundingMode.HALF_UP));
	    	orderDetail.setOrderState(dumpDAO.getOrderStatebyName("Generated"));
	    	dumpDAO.saveOrderDetail(orderDetail);
	    	orderDetailList.add(orderDetail);
	    }
	    
	    InvestmentRun invRun = dumpDAO.getInvestmentRunbyId(recipeRun.getInvestmentRun().getId());
		invRun.setInvWorkflowState(dumpDAO.getInvWorkflowStatebyName("OrdersGenerated"));
		invRun.setLastUpdatedDateTime(new Timestamp(System.currentTimeMillis()));
		dumpDAO.updateInvestmentRun(invRun);
		
	    map.put("orderDetailListData", orderDetailList);
	    return map;
	}
	    catch (Exception e) {
			logger.error("Exception Generate from outside try block of readDataFromCionMarketApi", e);
	    }
	    return new LinkedHashMap<>();
	}
	
	public Map<String, Object> approveOrder(OrderApprovalsDTO orderApprovalsDTO){
		System.out.println("=====approveOrder Calling=====");
		Map <String , Object> map = new LinkedHashMap<>();
		List<OrderExecution> orderExecutionList = new ArrayList<OrderExecution>();
		int orderRunId = orderApprovalsDTO.getOrderRunId();
		OrderRun orderRun = dumpDAO.getOrderRunbyId(orderRunId);
		List<OrderDetail> orderDetailList = dumpDAO.getOrderDetailbyOrderRunId(orderRun);
		List<Account> accountList = dumpDAO.getAccountList();
		List<ExchangeTradePairDTO> filteredExchangeTradePairList = new ArrayList<ExchangeTradePairDTO>();
		
		
		for(OrderDetail orderDetail : orderDetailList){ 
			OrderExecution orderExecution = new OrderExecution();
			String baseCoin=orderDetail.getBaseCoin().getCurrencyName();
			String counterCoin=dumpDAO.getTokenbyName(orderDetail.getCoinTokenId()).getSymbol();
			if(!orderDetail.getCoinTokenId().equals("Bitcoin") && !orderDetail.getCoinTokenId().equals("Ethereum")){
			orderExecution.setOrderDetail(orderDetail);
			orderExecution.setOrderType(dumpDAO.getOrderTypebyName("Limit"));
			
			List<ExchangeTradePairDTO> exchangeTradePairList=exchangeServices.getMinimumBidExchange(counterCoin+"/"+baseCoin);
			
			for(ExchangeTradePairDTO exchangeTradePair:exchangeTradePairList){
				 for(Account account: accountList){
					 String exch_code = dumpDAO.getExchangebyName(account.getExch_name()).getExch_code();
					 if(exch_code.equals(exchangeTradePair.getExchange())){
						 filteredExchangeTradePairList.add(exchangeTradePair);
					 }
				 }
			}
		}
	    ExchangeTradePairDTO exchangeTradePairDTO = filteredExchangeTradePairList.get(0);	
	    orderExecution.setPrice(exchangeTradePairDTO.getAsk());
	   
	    //BigDecimal investment_amount = orderRun.getInvestmentRun().getAmount();
	    
	    PriceTicker buTicker = exchangeServices.getTicker("BITF", "BTC", "USD");
		buPrice = buTicker.getAsk();
		
		PriceTicker euTicker = exchangeServices.getTicker("BITF", "ETH", "USD");
		euPrice = euTicker.getAsk();
		BigDecimal baseQty_perCoin=null;
		BigDecimal qty_perCoin=null;
		if(orderDetail.getBaseCoin().getCurrencyName().equals("BTC") && !orderDetail.getCoinTokenId().equals("Bitcoin")){
	    	baseQty_perCoin = orderDetail.getAmount().divide(buPrice, 8,  RoundingMode.HALF_UP);
			qty_perCoin = baseQty_perCoin.divide(exchangeTradePairDTO.getAsk(), 8,  RoundingMode.HALF_UP);
			orderExecution.setAmount(qty_perCoin);
			
	    } else if(orderDetail.getBaseCoin().getCurrencyName().equals("ETH") && !orderDetail.getCoinTokenId().equals("Ethereum")){
	    	baseQty_perCoin = orderDetail.getAmount().divide(euPrice, 8,  RoundingMode.HALF_UP);
			 qty_perCoin = baseQty_perCoin.divide(exchangeTradePairDTO.getAsk(), 8,  RoundingMode.HALF_UP);
			orderExecution.setAmount(qty_perCoin);
	    }
	    
	    List<MarketPairDTO> marketList=exchangeServices.getMarketpairList(exchangeTradePairDTO.getExchange());
	    
	    long mrkt_id=0L;
	    long exchng_id=0L;
	    for(MarketPairDTO mpd: marketList)
	    {
	    	if(mpd.getMkt_name().equals(counterCoin+"/"+baseCoin))
	    	{
	    		mrkt_id=mpd.getMkt_id();
	    		exchng_id=mpd.getExch_id();
	    		break;
	    	}
	    }
	    if(dumpDAO.getAccountByExchange(exchng_id)!=null)
	    { 	
	    	System.out.println("AAAAAAAAAAAAA --   "+dumpDAO.getAccountByExchange(exchng_id).getAuth_id());
	   int authId= dumpDAO.getAccountByExchange(exchng_id).getAuth_id();
	   BalanceParam bp=new BalanceParam();
	   bp.setAuth_ids(String.valueOf(authId));
	   bp.setShow_nils(0);
	   List<BalancesDTO> balanceList=exchangeServices.getAccountBalance(bp);
	   BigDecimal balance_available=new BigDecimal(0.0);
	   BigDecimal  noOfOrders=null;
	   for(BalancesDTO bd : balanceList)
	   {
		   if(orderDetail.getBaseCoin().getCurrencyName().equals(bd.getBalance_curr_code()))
		   {
			   balance_available=bd.getBalance_amount_avail();
			   break;
		   }
	   }
	   
	   if(balance_available.compareTo(baseQty_perCoin)>=0)
	   {
		   orderExecution.setRationale(" ");
		   if(orderDetail.getBaseCoin().getCurrencyName().equals("BTC")){
			          noOfOrders=baseQty_perCoin.divide(new BigDecimal(0.05), 8,  RoundingMode.UP);
		   }
		   else{
			   noOfOrders=baseQty_perCoin.divide(new BigDecimal(0.3), 8,  RoundingMode.UP);
		   }
		   
		   OrderParam op=new OrderParam();
		   op.setAuth_id(authId);
		   op.setExch_id(exchng_id);
		   op.setLimit_price(exchangeTradePairDTO.getAsk());
		   op.setMkt_id(mrkt_id);
		   op.setOrder_type_id(1);
		   op.setPrice_type_id(3);
		   op.setOrder_quantity(qty_perCoin.divide(noOfOrders, 8, RoundingMode.HALF_UP));
		   for(int i=0;i<=noOfOrders.intValue();i++)
		   {
			   AddOrderResponseDTO adr=exchangeServices.addOrder(op);
			   if(adr != null){
			   BigInteger internalOrderId = adr.getData().get(0).getInternal_order_id();
			   
			   if(internalOrderId!=null){
				   orderExecution.setExchangeTransactionID(internalOrderId.longValue());
			   }
			   String notificationStyle = null;
			   notificationStyle = adr.getNotifications().get(0).getNotification_style();
			   if(notificationStyle != null && notificationStyle.equals("success")){
				   orderExecution.setOrderState(dumpDAO.getOrdetStatebyName("Placed"));
			   }
			   else{
				   orderExecution.setOrderState(dumpDAO.getOrdetStatebyName("Generated"));
			   }
			   dumpDAO.saveOrderExecutionRecord(orderExecution);
			   orderExecutionList.add(orderExecution);
		     }
		   }
	   }
	   else{
		   orderExecution.setRationale("Insufficient Balance");
		   orderExecution.setOrderState(dumpDAO.getOrdetStatebyName("Generated"));
		   dumpDAO.saveOrderExecutionRecord(orderExecution);
		   orderExecutionList.add(orderExecution);
	   }
	   
	}
	   System.out.println("<<<<<<<<<< fdsfffsff");
  }
		map.put("list", orderExecutionList);
		return map;
}
	
	public Map<String, Object> getInvestmentWorkflowDetail(int invId)
	{
		Map <String , Object> invWorkfloDetailMap = new LinkedHashMap<String , Object>();
		
		InvestmentRun inv = dumpDAO.getInvestmentRunbyId(invId);
		List<RecipeRun> recipeRunList = dumpDAO.getRecipeRunbyInvRunId(inv); 
		List<RecipeDetail> recipeDetailList = new ArrayList<RecipeDetail>(); 
		List<List<RecipeDetail>> recipeDetailListAll = new ArrayList<List<RecipeDetail>>();
		InvestmentApprovals invApprov = new InvestmentApprovals();
		List<InvestmentApprovals> invApprovList =new ArrayList<InvestmentApprovals>();
		
		List<RecipeRunInvApprovalDTO> recipeRunInvApprovalDTOList =new ArrayList<RecipeRunInvApprovalDTO>();
		List<RecipeInvapp_RecipeDetailDTO> recipeInvapp_RecipeDetailDTOList =new ArrayList<RecipeInvapp_RecipeDetailDTO>();
		
		for(RecipeRun recipeRun : recipeRunList ){
			recipeDetailList = dumpDAO.getRecipeDetailbyRecipeRunId(recipeRun);
			recipeDetailListAll.add(recipeDetailList);
			
			invApprov = dumpDAO.getInvestmentApprovalsbyRecipeRunId(recipeRun.getId());
			invApprovList.add(invApprov);
			
			RecipeRunInvApprovalDTO recipeRunInvApprovalDTO = new  RecipeRunInvApprovalDTO();
			recipeRunInvApprovalDTO.setInvestmentRun(inv);
			recipeRunInvApprovalDTO.setRecipeRun(recipeRun);
			recipeRunInvApprovalDTO.setInvApprovals(invApprov);
			recipeRunInvApprovalDTOList.add(recipeRunInvApprovalDTO);
			
			RecipeInvapp_RecipeDetailDTO recipeInvapp_RecipeDetailDTO = new RecipeInvapp_RecipeDetailDTO();
			recipeInvapp_RecipeDetailDTO.setRecipeDetailList(recipeDetailList);
			recipeInvapp_RecipeDetailDTO.setRecipeRunInvApprovalDTO(recipeRunInvApprovalDTO);
			recipeInvapp_RecipeDetailDTOList.add(recipeInvapp_RecipeDetailDTO);
		}
		
		int uid = getCurrentUser().getUid();
		User user = dumpDAO.getUserById(uid);
		
		invWorkfloDetailMap.put("investmentRun",inv);
		invWorkfloDetailMap.put("recipeRunList",recipeRunList);
		invWorkfloDetailMap.put("recipeDetailListAll",recipeDetailListAll);
		invWorkfloDetailMap.put("invApprovList",invApprovList);
		invWorkfloDetailMap.put("user",user);
		invWorkfloDetailMap.put("recipeRunInvApprovalDTOList",recipeRunInvApprovalDTOList);
		invWorkfloDetailMap.put("detailId",recipeInvapp_RecipeDetailDTOList);
		
		return invWorkfloDetailMap;
	}
	
	public void saveOrderExecutionConfig(OrderExecutionConfigDTO orderExecutionConfigDTO){
		
		OrderExecutionConfiguration orderExecutionConfiguration = new OrderExecutionConfiguration();
		orderExecutionConfiguration.setBaseCoin(orderExecutionConfigDTO.getBaseCoin());
		orderExecutionConfiguration.setExch_code(orderExecutionConfigDTO.getExch_code());
		orderExecutionConfiguration.setOrderType(orderExecutionConfigDTO.getOrderType());
		orderExecutionConfiguration.setLot(orderExecutionConfigDTO.getLot());
		orderExecutionConfiguration.setTimeInterval(orderExecutionConfigDTO.getTimeInterval());
		dumpDAO.saveOrderExecutionConfiguration(orderExecutionConfiguration);
	}

	public boolean isBlackList(String token) {
		CoinIgyToken to = dumpDAO.getBlackListByTokenSymbol(token);
		if (to != null) {
			return to.isBlackList();
		}
		return false;
	}

	public List<String> getCoinsName() {
		logger.debug("getCoinsName method execution start and successfully return the coin names ");
		return dumpDAO.getCoinNames();
	}

	public List<BitCoinDataDTO> getBitCoinDataList() {
		logger.debug("getBitCoinDataList method execution start");
		List<BitCoinData> bitCoinList = dumpDAO.getBitCoinDataList();
		List<BitCoinDataDTO> bitCoinDTOList = new ArrayList<>();
		logger.debug("inside for loop of getBitCoinDataList");
		for (BitCoinData coin : bitCoinList) {
			BitCoinDataDTO dtoCoin = new BitCoinDataDTO();
			dtoCoin.setCap(coin.getCap());
			dtoCoin.setDate(coin.getDate());
			dtoCoin.setId(coin.getId());
			dtoCoin.setToken(coin.getToken());
			dtoCoin.setPrice(coin.getPrice());
			dtoCoin.setSymbol(coin.getSymbol());
			dtoCoin.setSupply(coin.getSupply());
			dtoCoin.setVolume(coin.getVolume());
			bitCoinDTOList.add(dtoCoin);
		}
		logger.debug("for loop of getBitCoinDataList completed and method exection successfully completed");
		return new ArrayList<BitCoinDataDTO>(new LinkedHashSet<BitCoinDataDTO>(bitCoinDTOList));
	}

	public String addTradingOrders(List<BitCoinDataDTO> ordersList, BigDecimal walletAmount) {
		List<TradingOrderDTO> weeklyOrderList = getNonApprovedOrder();
		logger.debug("addTradingOrders method execution start from buy the coins");
		if (weeklyOrderList.isEmpty()) {
			for (BitCoinDataDTO order : ordersList) {
				TradingOrder tradingOrder2 = dumpDAO.getTradingOrderByToken(order.getId());
				BigDecimal amount = walletAmount.multiply(order.getAllocation()).divide(BigDecimal.valueOf(100.0D));

				if (tradingOrder2 != null) {
					tradingOrder2.setAmount(amount);
					tradingOrder2.setRate(order.getPrice());
					tradingOrder2.setApproved(false);
					tradingOrder2.setExecute(false);
					tradingOrder2.setExchange("Poloniex");
					tradingOrder2.setOrderDate(new java.sql.Date(System.currentTimeMillis()));

					dumpDAO.updateTradingOrder(tradingOrder2);
				} else {
					TradingOrder tradingOrder = new TradingOrder();
					tradingOrder.setAmount(amount);
					tradingOrder.setRate(order.getPrice());
					tradingOrder.setApproved(false);
					tradingOrder.setExecute(false);
					tradingOrder.setExchange("Poloniex");
					tradingOrder.setOrderDate(new java.sql.Date(System.currentTimeMillis()));
					tradingOrder.setTokenId(order.getId());
					dumpDAO.addTradingOrder(tradingOrder);
				}

			}
			return "done";
		} else {
			return null;
		}
	}

	@Override
	public List<TradingOrderDTO> getApprovedOrderListForThisWeek(Date fromDate, Date toDate) {

		List<TradingOrder> approvedOrderList = dumpDAO.getApprovedOrderListForThisWeek(fromDate, toDate);
		List<TradingOrderDTO> approvedOrderListDTO = new ArrayList<TradingOrderDTO>();
		for (TradingOrder order : approvedOrderList) {
			TradingOrderDTO tradingOrder = new TradingOrderDTO();
			tradingOrder.setAmount(order.getAmount());
			tradingOrder.setApproved(order.getApproved());
			tradingOrder.setExecute(order.getExecute());
			tradingOrder.setId(order.getId());
			tradingOrder.setRate(order.getRate());
			approvedOrderListDTO.add(tradingOrder);
		}
		return approvedOrderListDTO;
	}

	@Override
	public List<BitCoinData> getFilterListByDates() {
		return dumpDAO.getFilterListByDates(DateUtils.getMinDate(), DateUtils.getMaxDate());
	}

	public void buyCoins() {
		logger.debug("buy of dumpservices");
		java.sql.Date fromDate = DateUtils.getMinDate();
		java.sql.Date toDate = DateUtils.getMaxDate();
		List<TradingOrder> tradingOrderList = dumpDAO.getTradingOrderListForBuy(fromDate, toDate);
		for (TradingOrder order : tradingOrderList) {
			BitCoinData bitcoin = dumpDAO.getBitCoinDataByTokenId(order.getTokenId());
			List<BigDecimal> listOfAmount = MathUtils.breakByNumber(order.getAmount(), BigDecimal.valueOf(100));
			List<ExchangeTradePairDTO> tradePair = exchangeServices.getMinimumBidExchange(bitcoin.getSymbol() + "/USD");

			if (tradePair != null && (!tradePair.isEmpty())) {

				populateTradePair(order, listOfAmount, tradePair.get(0));
				order.setExecute(true);
				order.setExchange(tradePair.get(0).getExchange());
				dumpDAO.updateTradingOrder(order);
			}
		}
	}

	/**
	 * @param order
	 * @param listOfAmount
	 * @param tradePair
	 */
	private void populateTradePair(TradingOrder order, List<BigDecimal> listOfAmount, ExchangeTradePairDTO tradePair) {
		for (BigDecimal amt : listOfAmount) {
			BigDecimal quantity = amt.divide(tradePair.getBid(), 4, java.math.RoundingMode.HALF_UP);
			BigDecimal walletAmount = walletAmount();
			Wallet wallet = exchangeDao.getWallet();
			if (walletAmount.compareTo(BigDecimal.ZERO) == 0) {
				break;
			} else if (walletAmount.compareTo(amt) > 0) {
				wallet.setAmount(walletAmount.subtract(amt));
				exchangeDao.updateWalletAmount(wallet);
				OrderRequest or = new OrderRequest();
				or.setLimitPrice(tradePair.getAsk());
				or.setExchangeCode(tradePair.getExchange());
				or.setOrderType("limit");
				or.setQuantity(quantity);
				or.setTradePair(tradePair.getMarket());
				ExchangeTradeOrderDTO result = exchangeServices.buy(or);

				if (result != null) {
					result.setOrderTime(System.currentTimeMillis());
					result.setStatus(result.getStatus());
					result.setBid(tradePair.getBid());
					ExchangeTradeOrder tradeOrder = new ExchangeTradeOrder();
					new ExchangeMapper().tradeOrderDtoToModel(result, tradeOrder);
					tradeOrder.setTradingOrder(order);
					exchangeDao.saveTradeOrder(tradeOrder);
				}
			}
		}
	}

	public BitCoinDataDTO getCoinBySymbol(String symbol) {
		logger.debug("getCoinBySymbol method execution start....");
		BitCoinData coin = dumpDAO.getCoinBySymbol(symbol);
		BitCoinDataDTO dtoCoin = new BitCoinDataDTO();
		dtoCoin.setCap(coin.getCap());
		dtoCoin.setDate(coin.getDate());
		dtoCoin.setId(coin.getId());
		dtoCoin.setToken(coin.getToken());
		dtoCoin.setPrice(coin.getPrice());
		dtoCoin.setSymbol(coin.getSymbol());
		dtoCoin.setSupply(coin.getSupply());
		dtoCoin.setVolume(coin.getVolume());
		logger.debug("getCoinBySymbol method return values successfully and complete the execution....");
		return dtoCoin;
	}

	public void updateTradingOrder(TradingOrder order) {
		dumpDAO.updateTradingOrder(order);
	}

	public void approvedTradingOrder(TradingOrder order) {
		logger.debug("approvedTradingOrder method execution start and return the values successfully....");
		dumpDAO.approvedTradingOrder(order);
	}

	public List<TradingOrderDTO> getNonApprovedOrder() {
		logger.debug("getNonApprovedOrder method execution start ....");
		List<TradingOrderDTO> tradingOrderList = new ArrayList<>();
		List<TradingOrder> tradingList = dumpDAO.getNonApprovedOrder(DateUtils.getMinDate(), DateUtils.getMaxDate());
		for (TradingOrder order : tradingList) {
			TradingOrderDTO tradingDTO = new TradingOrderDTO();
			tradingDTO.setId(order.getId());
			tradingDTO.setAmount(order.getAmount());
			tradingDTO.setApproved(order.getApproved());
			tradingDTO.setExchange(order.getExchange());
			tradingDTO.setExecute(order.getExecute());
			tradingDTO.setRate(order.getRate());
			tradingDTO.setTokenName(dumpDAO.getTokenById(order.getTokenId()).getTokenName());
			tradingOrderList.add(tradingDTO);
		}
		logger.debug("for loop of getNonApprovedOrder complete totally and also complete method execution");
		return tradingOrderList;
	}

	public TradingOrder getOrderById(int id) {
		logger.debug("getOrderById method execution start and reurn the values successfully....");
		return dumpDAO.getOrderById(id);
	}

	public List<TradingOrderDTO> getApprovedButNotExecuteOrders() {
		logger.debug("getApprovedButNotExecuteOrders method execution start ....");
		List<TradingOrderDTO> orderDtoList = new ArrayList<>();
		List<TradingOrder> orderDaoList = dumpDAO.getApprovedButNotExecuteOrders();
		for (TradingOrder order : orderDaoList) {
			TradingOrderDTO orderDto = new TradingOrderDTO();
			orderDto.setAmount(order.getAmount());
			orderDto.setApproved(order.getApproved());
			orderDto.setExchange(order.getExchange());
			orderDto.setExecute(order.getExecute());
			orderDto.setRate(order.getRate());
			orderDto.setTokenName(dumpDAO.getTokenById(order.getTokenId()).getTokenName());
			orderDtoList.add(orderDto);
		}
		logger.debug("for loop of getNonApprovedOrder complete totally and also complete method execution");
		return orderDtoList;
	}

	public List<TokenDTO> getTokens() {
		logger.debug("getTokens method execution start and reurn the values successfully....");
		List<CoinIgyToken> tokenList = dumpDAO.getTokenList();

		List<TokenDTO> tokenListDTO = new ArrayList<>();
		for (CoinIgyToken token : tokenList) {
			TokenDTO tokenDTO = new TokenDTO();
			tokenDTO.setTokenId(token.getId());
			tokenDTO.setTokenName(token.getTokenName());
			String isBlackList = (token.isBlackList()) ? "Yes" : "No";
			tokenDTO.setBlacklist(isBlackList);
			tokenDTO.setComments(token.getComments());
			tokenListDTO.add(tokenDTO);
		}
		return tokenListDTO;
	}

	public CoinIgyToken getTokenById(long id) {
		logger.debug("getTokenById method execution start and reurn the values successfully....");
		return dumpDAO.getTokenById(id);
	}

	public void updateToken(TokenDTO tokenDTO) {

		logger.debug("storeData BlacklistedTokenInfo method execution start ....");
		CoinIgyToken token = null;
		token = dumpDAO.getTokenById(tokenDTO.getTokenId());
		boolean isBlackList = tokenDTO.getBlacklist().equalsIgnoreCase("Yes");
		token.setBlackList(isBlackList);
		token.setComments(tokenDTO.getComments());
		BlacklistedTokenInfo tokenInfo = new BlacklistedTokenInfo();
		tokenInfo.setComments(tokenDTO.getComments());
		tokenInfo.setBlacklistStatus(isBlackList);
		tokenInfo.setCtoken(token);
		// tokenInfo.setValidTo(new Timestamp(System.currentTimeMillis()));
		BlacklistedTokenInfo blto = dumpDAO.getblackListedTokenByIdAndStatus(token, !isBlackList);

		if (blto == null) {
			BlacklistedTokenInfo blackList = new BlacklistedTokenInfo();
			blackList.setBlacklistStatus(false);
			blackList.setComments(tokenDTO.getComments());
			blackList.setValidTo(new Timestamp(System.currentTimeMillis()));
			blackList.setCtoken(token);
			BlacklistedTokenInfo blackList2 = new BlacklistedTokenInfo();
			blackList2.setBlacklistStatus(true);
			blackList2.setComments(tokenDTO.getComments());
			blackList2.setValidFrom(new Timestamp(System.currentTimeMillis()));
			blackList2.setCtoken(token);
			dumpDAO.saveBlackListTokenInfo(blackList);
			dumpDAO.saveBlackListTokenInfo(blackList2);
		} else {
			blto.setValidTo(new Timestamp(System.currentTimeMillis()));
			blto.setComments(tokenDTO.getComments());

			BlacklistedTokenInfo blackList2 = new BlacklistedTokenInfo();
			blackList2.setBlacklistStatus(isBlackList);
			blackList2.setComments(tokenDTO.getComments());
			blackList2.setValidFrom(new Timestamp(System.currentTimeMillis()));
			blackList2.setCtoken(token);
			dumpDAO.saveBlackListTokenInfo(blackList2);
			dumpDAO.updateBlackListTokenInfo(blto);
		}

		logger.debug("updateToken method execution successfully completed ....");
		dumpDAO.updateToken(token);
	}

	public void tokenIssue(BigDecimal amount) {
		Web3j web3j = Web3j.build(new HttpService());
		Credentials credentials = null;
		BigInteger issuedTokens = null;
		File folder = null;
		BigDecimal nav = getNAVValue(new Timestamp(new java.util.Date().getTime()));
		if (nav.compareTo(BigDecimal.ZERO) == 0) {
			nav = BigDecimal.valueOf(10L);
		}

		try {
			folder = new ClassPathResource("wallet").getFile();
		} catch (IOException e) {
			logger.error("exception in ClassPathResource catch  :", e);
		}
		try {
			credentials = WalletUtils.loadCredentials("CryptxTokenWallet2017", folder.getPath() + "/wallet_cred");
		} catch (CipherException | IOException | NullPointerException e) {
			logger.error("Exception inside credentials : ", e);
		}
		CryptxToken cryptx = CryptxToken.load("0x7d246f77b5a10f17d4ccbf0e9752486cf8553b38", web3j, credentials,
				Contract.GAS_PRICE, Contract.GAS_LIMIT);

		try {
			BigInteger beforeTotalSupply = BigInteger.valueOf(0L);
			try {
				beforeTotalSupply = (cryptx.totalSupply().get()).getValue();
			} catch (NullPointerException e) {
				logger.error("Exception inside totalSupply catch : ", e);
			}
			System.out.println("current Nav is " + nav);
			System.out.println("before totalSupply is " + beforeTotalSupply);
			Future<TransactionReceipt> setNavTrans = cryptx.setNetAssetValue(new Uint256(nav.toBigInteger()));
			TransactionReceipt transReceipt = setNavTrans.get();
			System.out.println("Hash code for Set Nav is " + transReceipt.getTransactionHash());
			Future<TransactionReceipt> issueTokens = cryptx.mintTokensForAmount(new Uint256(amount.toBigInteger()));
			TransactionReceipt issueTokenTrans = issueTokens.get();
			String issueTokenHash = issueTokenTrans.getTransactionHash();
			System.out.println("Hash code for issue Token is " + issueTokenHash);
			web3j.ethGetTransactionReceipt(issueTokenHash);
			BigInteger afterTotalSupply = BigInteger.valueOf(0L);
			try {
				afterTotalSupply = (cryptx.totalSupply().get()).getValue();
			} catch (NullPointerException e) {
				logger.error("Exception inside totalSupply catch : ", e);
			}
			System.out.println("After issue token supply is " + afterTotalSupply);
			issuedTokens = afterTotalSupply.subtract(beforeTotalSupply);
			System.out.println("Issue tokens is " + issuedTokens);
			if (issuedTokens != null) {
				TokenIssuance tokenIssuance = new TokenIssuance();
				tokenIssuance.setDate(new Timestamp(new java.util.Date().getTime()));
				tokenIssuance.setTotalTokens(new BigDecimal(issuedTokens));
				tokenIssuedDateStore(tokenIssuance);
			}

			logger.debug("Issued Tokes is ############ " + issuedTokens);
		} catch (Exception e) {
			System.out.println("Exception inside issue tokens " + e);
			logger.error("Exception to calling mintTokensForAmount the issue tokens ", e);
		}
	}

	public void tokenIssuedDateStore(TokenIssuance tokenIssuence) {
		dumpDAO.issueTokens(tokenIssuence);
	}

	public List<TokenIssuanceDTO> getIssueTokenList() {
		logger.debug("getIssueTokenList method execution start ....");
		List<TokenIssuance> issueTokenList = dumpDAO.getIssueTokenListList();
		List<TokenIssuanceDTO> issueTokenDTOList = new ArrayList<>();

		for (TokenIssuance token : issueTokenList) {
			TokenIssuanceDTO tokenDTO = new TokenIssuanceDTO();
			tokenDTO.setIssuedTime(token.getDate());
			tokenDTO.setIssuedToken(token.getTotalTokens());
			BigDecimal nav = getNAVValue(token.getDate());
			if (nav.compareTo(BigDecimal.ZERO) == 0) {
				tokenDTO.setNav(BigDecimal.valueOf(10));
			} else {
				tokenDTO.setNav(nav);
			}
			issueTokenDTOList.add(tokenDTO);
		}
		logger.debug("for loop of getIssueTokenList complete totally and also complete method execution");
		return issueTokenDTOList;
	}

	public List<CurrentPortfolioDTO> getCurrentPortfolioList() {
		logger.debug("getCurrentPortfolioList method execution start ....");
		List<CurrentPortfolioDTO> portfolioList = new ArrayList<>();
		List<Integer> tokenIdList = dumpDAO.getTokenIdListOfTradingOrder();
		for (Integer tokenId : tokenIdList) {
			List<TradingOrder> tradingOrderList = dumpDAO.getTradingOrdetListbyTokenId(tokenId.intValue());
			BigDecimal totalAmount = new BigDecimal("0");
			BigDecimal boughtAmount = new BigDecimal("0");
			int id = 0;
			for (TradingOrder order : tradingOrderList) {
				if (order.getExecute()) {
					boughtAmount = boughtAmount.add(order.getAmount());
				}
				id = order.getTokenId();
				totalAmount = totalAmount.add(order.getAmount());
			}
			CurrentPortfolioDTO portfolio = new CurrentPortfolioDTO();
			// Token token = dumpDAO.getTokenById(id);
			portfolio.setBoughtAmount(boughtAmount);
			portfolio.setTotalAmount(totalAmount);
			// portfolio.setCoinName(token.getTokenName());
			portfolioList.add(portfolio);
		}
		return portfolioList;
	}

	public BigDecimal getNAVValue(Timestamp fromdateTimeTamp) {
		logger.debug("getNAVValue method execution start ....");

		java.sql.Date fromDate = new java.sql.Date(fromdateTimeTamp.getTime());

		BigDecimal currentMarketOfThePortfolio = dumpDAO.currentMarketOfThePortfolio(fromdateTimeTamp,
				DateUtils.getMinDate(), DateUtils.getMaxDate());
		BigDecimal tokenIssuence = dumpDAO.getTokenIssuence(fromDate);
		if (tokenIssuence == null || currentMarketOfThePortfolio == null) {
			logger.debug("inside if of getNAVValue and complete method execution and also return value");
			return BigDecimal.valueOf(0);
		}
		logger.debug("inside else of getNAVValue and complete method execution and also return value");
		return currentMarketOfThePortfolio.divide(tokenIssuence, MathContext.DECIMAL128);
	}

	public void addAddress(String withdrawAddress, String symbol) {
		logger.debug("addAddress method execution start ....");
		BitCoinData bitcoin = dumpDAO.getCoinBySymbol(symbol);
		Withdraw withdraw = new Withdraw();
		withdraw.setActive(false);
		withdraw.setToken(bitcoin.getToken());
		withdraw.setWithdrawAddress(withdrawAddress);
		withdraw.setWithdrawAmount(new BigDecimal(0));
		logger.debug("addAddress method execution successfully completed ....");
		dumpDAO.addAddress(withdraw);
	}

	public WithdrawDTO checkDuplicateAddress(String withdrawAddress) {
		logger.debug("checkDuplicateAddress method execution start ....");
		Withdraw withdraw = dumpDAO.checkDuplicateAddress(withdrawAddress);
		WithdrawDTO withdrawDTO = null;
		if (withdraw != null) {
			logger.debug("inside if of checkDuplicateAddress method....");
			withdrawDTO = new WithdrawDTO();
			withdrawDTO.setActive(withdraw.isActive());
			withdrawDTO.setId(withdraw.getId());
			withdrawDTO.setTokenId(withdraw.getToken().getTid());
			withdrawDTO.setWithdrawAddress(withdraw.getWithdrawAddress());
			logger.debug("if of checkDuplicateAddress execution completed....");
		}
		logger.debug("checkDuplicateAddress method execution completed....");
		return withdrawDTO;
	}

	public List<WithdrawDTO> getWithdrawList() {
		logger.debug("getWithdrawList method execution start ....");
		List<Withdraw> withdrawList = dumpDAO.getWithdrawList();
		List<WithdrawDTO> withdrawDTOList = new ArrayList();
		for (Withdraw item : withdrawList) {
			WithdrawDTO dto = new WithdrawDTO();
			dto.setActive(item.isActive());
			dto.setId(item.getId());
			dto.setTokenId(item.getToken().getTid());
			dto.setWithdrawAddress(item.getWithdrawAddress());
			withdrawDTOList.add(dto);
		}
		logger.debug("for loop of getWithdrawList complete totally and also complete method execution");
		return withdrawDTOList;
	}

	public List<WithdrawDTO> getWithdrawListByTokenId(int tokenId) {
		logger.debug("getWithdrawListByTokenId method execution start ....");
		List<Withdraw> withdrawList = dumpDAO.getWithdrawListByTokenId(tokenId);
		List<WithdrawDTO> withdrawDTOList = new ArrayList();
		for (Withdraw item : withdrawList) {
			WithdrawDTO withdraw = new WithdrawDTO();
			withdraw.setActive(item.isActive());
			withdraw.setId(item.getId());
			withdraw.setTokenId(item.getToken().getTid());
			withdraw.setWithdrawAddress(item.getWithdrawAddress());
			withdrawDTOList.add(withdraw);
		}
		logger.debug("for loop of getWithdrawList complete totally and also complete method execution");
		return withdrawDTOList;
	}

	public void updateWithdrawAddress(String symbol, String address) {
		logger.debug("updateWithdrawAddress method execution start ....");
		BitCoinData bitcoin = dumpDAO.getCoinBySymbol(symbol);
		dumpDAO.updateWithdrawAddress(address, bitcoin.getToken().getTid());
		logger.debug("updateWithdrawAddress method execution completed....");
	}

	public BigDecimal walletAmount() {
		Wallet wallet = exchangeDao.getWallet();
		if (wallet != null) {
			return wallet.getAmount();
		}
		return BigDecimal.valueOf(0);
	}

	public UserDTO getUserByEmail(String email) {
		com.blockchain.model.User user = dumpDAO.getUserByEmail(email);
		UserDTO userDTO = null;
		if (user != null) {
			userDTO = new UserDTO();
			userDTO.setUid(user.getId().intValue());
			userDTO.setFirstName(user.getFirstName());
			userDTO.setLastName(user.getLastName());
			userDTO.setEmail(user.getEmail());
			Set<UserProfile> userProfile = user.getUserProfiles();
			boolean isAdmin = false;
			for (UserProfile userP : userProfile) {
				if (userP.getType().equalsIgnoreCase("ADMIN"))
					isAdmin = true;
			}
			userDTO.setAdminRole(isAdmin);
			userDTO.setPassword(user.getPassword());
		}
		return userDTO;
	}

	public List<UserDTO> getUserList() {
		List<com.blockchain.model.User> userList = dumpDAO.getUserList();
		List<UserDTO> userDTOList = new ArrayList<>();
		for (com.blockchain.model.User user : userList) {
			UserDTO userDTO = new UserDTO();
			userDTO.setUid(user.getId().intValue());
			userDTO.setFirstName(user.getFirstName());
			userDTO.setLastName(user.getLastName());
			userDTO.setEmail(user.getEmail());
			Set<UserProfile> userProfile = user.getUserProfiles();
			boolean isAdmin = false;
			for (UserProfile userP : userProfile) {
				if (userP.getType().equalsIgnoreCase("ADMIN"))
					isAdmin = true;
			}
			userDTO.setAdminRole(isAdmin);
			userDTO.setPassword(user.getPassword());
			userDTOList.add(userDTO);
		}
		return userDTOList;
	}

	public UserDTO getUserById(int id) {
		com.blockchain.model.User user = dumpDAO.getUserById(id);
		UserDTO userDTO = null;
		if (user != null) {
			userDTO = new UserDTO();
			userDTO.setUid(user.getId().intValue());
			userDTO.setFirstName(user.getFirstName());
			userDTO.setLastName(user.getLastName());
			userDTO.setEmail(user.getEmail());
			Set<UserProfile> userProfile = user.getUserProfiles();
			boolean isAdmin = false;
			for (UserProfile userP : userProfile) {
				if (userP.getType().equalsIgnoreCase("ADMIN"))
					isAdmin = true;
			}
			userDTO.setAdminRole(isAdmin);
			userDTO.setPassword(user.getPassword());
		}
		return userDTO;
	}

	public void updateUserInformation(UserDTO userDTO) {
		com.blockchain.model.User user = dumpDAO.getUserById(userDTO.getUid());
		if (user != null) {
			user.setFirstName(userDTO.getFirstName().trim());
			user.setLastName(userDTO.getLastName().trim());
			user.setEmail(userDTO.getEmail().trim());
			user.setSsoId(userDTO.getEmail());
			Set<UserProfile> userProfile = user.getUserProfiles();
			for (UserProfile userPro : userProfile) {
				if (userDTO.isAdminRole()) {
					userPro.setType("ADMIN");
				} else if (!userDTO.isAdminRole()) {
					userPro.setType("USER");
				}
			}
			user.setUserProfiles(userProfile);
			if (userDTO.getPassword() != null) {
				String encodePassword = passwordEncoder.encode(userDTO.getPassword());
				user.setPassword(encodePassword);
			}
			dumpDAO.updateUserInformation(user);
		}
	}

	@Override
	public void updateUser(User user) {
		dao.update(user);
	}

	public void deleteUser(int uid) {
		com.blockchain.model.User user = dumpDAO.getUserById(uid);
		Set<UserProfile> profiles = user.getUserProfiles();
		dumpDAO.deleteUser(user);
		for (UserProfile profile : profiles) {
			dumpDAO.deleteProfile(profile);
		}
	}

	public void addUser(UserDTO userDTO) {
	}

	public UserDTO getCurrentUser() {
		UserDTO user = null;
		Object o = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		if ((o instanceof String)) {
			return null;
		}
		org.springframework.security.core.userdetails.User u = (org.springframework.security.core.userdetails.User) o;
		return getUserByEmail(u.getUsername());
	}

	public com.blockchain.model.User findById(int id) {
		return dao.findById(id);
	}

	public com.blockchain.model.User findBySSO(String sso) {
		return dao.findBySSO(sso);
	}

	public void saveUser(UserDTO userDTO) {
		com.blockchain.model.User user = new com.blockchain.model.User();
		user.setFirstName(userDTO.getFirstName());
		user.setEmail(userDTO.getEmail());
		user.setLastName(userDTO.getLastName());
		user.setSsoId(userDTO.getEmail());
		HashSet<UserProfile> userpro = new HashSet<>();
		UserProfile userp = new UserProfile();
		if (userDTO.isAdminRole()) {
			userp.setType("ADMIN");
		} else if (!userDTO.isAdminRole()) {
			userp.setType("USER");
		}
		userpro.add(userp);
		user.setUserProfiles(userpro);

		user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
		dao.save(user);
	}

	public void updateUser(UserDTO userDTO) {
		com.blockchain.model.User entity = dao.findById(userDTO.getUid());
		if (entity != null) {
			entity.setSsoId(userDTO.getEmail());
			entity.setFirstName(userDTO.getFirstName());
			entity.setLastName(userDTO.getLastName());
			entity.setEmail(userDTO.getEmail());
			Set<UserProfile> userProfile = entity.getUserProfiles();
			for (UserProfile userPro : userProfile) {
				if (userDTO.isAdminRole()) {
					userPro.setType("ADMIN");
				} else if (!userDTO.isAdminRole()) {
					userPro.setType("USER");
				}
			}
			entity.setUserProfiles(userProfile);
		}
	}

	@Override
	public User findUserByResetToken(String resetToken) {
		return dumpDAO.findUserByResetToken(resetToken);
	}

	public void deleteUserBySSO(String sso) {
		dao.deleteBySSO(sso);
	}

	public List<com.blockchain.model.User> findAllUsers() {
		return dao.findAllUsers();
	}

	public boolean isUserSSOUnique(Integer id, String sso) {
		com.blockchain.model.User user = findBySSO(sso);
		return (user == null) || ((id != null) && (user.getId() == id));
	}

	public void updateOrderStatus() {
		List<ExchangeTradeOrder> exchangeTradeOrders = exchangeDao.updateTradeOrder();

		List<ExchangeTradeOrder> nonFilledOrders = exchangeDao.getNonFilledOrders();

		RestTemplate restTemplate = new RestTemplate();

		for (ExchangeTradeOrder order : nonFilledOrders) {

			order.setStatus("cancel");
			exchangeDao.updateTradeOrder(order);
			Wallet wallet = exchangeDao.getWallet();
			BigDecimal updateAmount = wallet.getAmount().add(order.getBidAmount().multiply(order.getQuantity()))
					.setScale(4, RoundingMode.HALF_UP);
			wallet.setAmount(updateAmount);
			exchangeDao.updateWalletAmount(wallet);
		}

		for (ExchangeTradeOrder order : exchangeTradeOrders) {
			ExchangeTradeOrderDTO orderDto = restTemplate.getForObject(
					"http://localhost:8090/warlordService/api/order/" + order.getOrderId(),
					ExchangeTradeOrderDTO.class);
			if (orderDto != null) {
				order.setStatus(orderDto.getStatus());
				try {
					order.setTimestamp(Timestamp.valueOf(orderDto.getTimestamp()));
				} catch (Exception e) {
					order.setTimestamp(new Timestamp(System.currentTimeMillis()));
				}

			}
			exchangeDao.updateTradeOrder(order);
		}
	}

	@Override
	public List<TokenMarketData> getTokenMarketList() {
		return dumpDAO.getTokenMarketList();
	}
	

	@Override
	public List<InvestmentRun> getInvestmentRunList() {
		return dumpDAO.getInvestmentRunList();
	}

	
}

package com.blockchain.dao;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;

import com.blockchain.model.Account;
import com.blockchain.model.ApprovalType;
import com.blockchain.model.BaseCoin;
import com.blockchain.model.BitCoinData;
import com.blockchain.model.BlacklistedTokenInfo;
import com.blockchain.model.CoinIgyToken;
import com.blockchain.model.Deposit;
import com.blockchain.model.Exchange;
import com.blockchain.model.ExchangeMarket;
import com.blockchain.model.InvWorkflowState;
import com.blockchain.model.InvestmentApprovals;
import com.blockchain.model.InvestmentMode;
import com.blockchain.model.InvestmentRun;
import com.blockchain.model.OrderDetail;
import com.blockchain.model.OrderExecution;
import com.blockchain.model.OrderExecutionConfiguration;
import com.blockchain.model.OrderRun;
import com.blockchain.model.OrderSide;
import com.blockchain.model.OrderState;
import com.blockchain.model.OrderType;
import com.blockchain.model.RecipeDetail;
import com.blockchain.model.RecipeRun;
import com.blockchain.model.StrategyType;
import com.blockchain.model.TokenIssuance;
import com.blockchain.model.TokenMarketData;
import com.blockchain.model.TradingOrder;
import com.blockchain.model.User;
import com.blockchain.model.UserProfile;
import com.blockchain.model.Withdraw;

public interface DumpDAO {
	public List<BitCoinData> getBitCoinDataList();

	public List<String> getCoinNames();

	public BitCoinData getBitCoinDataByTokenId(int paramInt);

	public BitCoinData getCoinBySymbol(String paramString);

	public void storeData(BitCoinData paramBitCoinData);

	public List<BitCoinData> getFilterListByDates(Date paramDate1, Date paramDate2);

	public void addTradingOrder(TradingOrder paramTradingOrder);

	public void approvedTradingOrder(TradingOrder paramTradingOrder);

	public List<TradingOrder> getNonApprovedOrder(Date paramDate1, Date paramDate2);

	public TradingOrder getOrderById(int paramInt);

	public List<TradingOrder> getApprovedButNotExecuteOrders();

	public List<TradingOrder> getTradingOrderListForBuy(Date paramDate1, Date paramDate2);

	public List<TradingOrder> getTradingOrdetListbyTokenId(int paramInt);

	public List<Integer> getTokenIdListOfTradingOrder();

	public void updateTradingOrder(TradingOrder paramTradingOrder);

	public TokenIssuance getLastTokenIssue();

	public BigDecimal getTotalAmountOfEachCoinOrder(int paramInt);

	public List<CoinIgyToken> getTokenList();

	public CoinIgyToken getToken(String paramString);

	public CoinIgyToken saveToken(CoinIgyToken paramToken);

	public CoinIgyToken getTokenById(long paramInt);

	public void updateToken(CoinIgyToken paramToken);

	public void issueTokens(TokenIssuance paramTokenIssuance);

	public List<TokenIssuance> getIssueTokenListList();

	public BigDecimal currentMarketOfThePortfolio(Timestamp fromDate, Date paramDate2, Date paramDate3);

	public BigDecimal getTokenIssuence(Date paramDate);

	public void addAddress(Withdraw paramWithdraw);

	public Withdraw checkDuplicateAddress(String paramString);

	public List<Withdraw> getWithdrawList();

	public List<Withdraw> getWithdrawListByTokenId(int paramInt);

	public void updateWithdrawAddress(String paramString, int paramInt);

	public User getUserByEmail(String paramString);

	public List<User> getUserList();

	public User getUserById(int paramInt);

	public void updateUserInformation(User paramUser);

	public void deleteUser(User paramUser);

	public void addUser(User paramUser);

	public User findUserByResetToken(String resetToken);

	public void deleteProfile(UserProfile paramUserProfile);

	public TradingOrder getTradingOrderByToken(int id);

	public List<TradingOrder> getApprovedOrderListForThisWeek(Date fromDate, Date toDate);

	public void saveTokenMarketData(List<TokenMarketData> tokenMarketDataList);

	public CoinIgyToken getBlackListByTokenName(String tokenName);
	
	public CoinIgyToken getBlackListByTokenSymbol(String tokenSymbol);
	
	public List<TokenMarketData> getTokenMarketList();
	
    public void storeData(BlacklistedTokenInfo blackToken);
	
	public BlacklistedTokenInfo getblackListedTokenByIdAndStatus(CoinIgyToken token, boolean blacklistStatus);

	public void updateBlackListTokenInfo(BlacklistedTokenInfo blto);

	public void saveBlackListTokenInfo(BlacklistedTokenInfo tokenInfo);

	public BlacklistedTokenInfo getblackListedTokenByIdAndStatus(CoinIgyToken token);
	
	public void saveMarketExchange(List<ExchangeMarket> mktExch);

	InvestmentMode getInvestmentModebyName(String mode);

	InvWorkflowState getInvWorkflowStatebyName(String flowName);

	StrategyType getStrategyTypebyName(String flowName);
	
	public int saveInvestmentRun(InvestmentRun invRun);

	public InvestmentRun getInvestmentRunbyId(int id);
	
	public int saveRecipeRun(RecipeRun recRun);

	public List<RecipeRun> getRecipeRunbyInvRunId(InvestmentRun investmentRun);

	public ApprovalType getApprovalTypebyName(String name);
	
	public void saveInvestmentApprovals(InvestmentApprovals invApprove);

	public BaseCoin getBaseCoinbyName(String name);

	public void saveRecipeDetail(RecipeDetail recDetail);

	public void updateInvestmentRun(InvestmentRun invRun);

	public InvestmentApprovals getInvestmentApprovalsbyInvRunId(InvestmentRun invRun);

	public void updateInvestmentApprovals(InvestmentApprovals invApprov);
	
	public List<InvestmentRun> getInvestmentRunList();

	public List<RecipeDetail> getRecipeDetailbyRecipeRunId(RecipeRun recipeRun);

	public InvestmentApprovals getInvestmentApprovalsbyRecipeRunId(int recipeRunId);

	public RecipeRun getRecipeRunbyId(int id);

	public List<InvestmentRun> getInvestmentRunbyUser(int uid);

	public void saveDeposit(Deposit deposit);

	public int saveOrderRun(OrderRun orderRun);

	public void saveOrderDetail(OrderDetail orderDetail);

	//public InvestmentRun getInvestmentRunbyRecipeRunId(int recipeRunId);
	public void saveOrderExecutionConfiguration(OrderExecutionConfiguration orderExecutionConfiguration);

	public Deposit getDepositbyParams(int recipeRunId, int investRunId, String exch_name, String baseCoin);

	public void updateDeposit(Deposit deposit);
	
	public OrderSide getOrderSidebyName(String orderSideName);
	
	public OrderState getOrderStatebyName(String orderStateName);
	
	public List<OrderDetail> getOrderDetailbyOrderRunId(OrderRun orderRun);
	public OrderRun getOrderRunbyId(int orderRunId);
	public CoinIgyToken getTokenbyName(String tokenName);

	public List<Account> getAccountList();

	public Exchange getExchangebyName(String exch_name);

	public OrderType getOrderTypebyName(String orderTypeName);

	public Account getAccountByExchange(long exchng_id);

	public void saveOrderExecutionRecord(OrderExecution orderExecution);

	public OrderState getOrdetStatebyName(String orderStateName);


}
 
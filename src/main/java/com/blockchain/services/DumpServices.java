package com.blockchain.services;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import com.blockchain.dto.BitCoinDataDTO;
import com.blockchain.dto.CurrentPortfolioDTO;
import com.blockchain.dto.Invest;
import com.blockchain.dto.InvestmentApprovalsDTO;
import com.blockchain.dto.OrderApprovalsDTO;
import com.blockchain.dto.OrderExecutionConfigDTO;
import com.blockchain.dto.TokenDTO;
import com.blockchain.dto.TokenIssuanceDTO;
import com.blockchain.dto.TradingOrderDTO;
import com.blockchain.dto.UserDTO;
import com.blockchain.dto.WithdrawDTO;
import com.blockchain.model.BitCoinData;
import com.blockchain.model.CoinIgyToken;
import com.blockchain.model.ExchangeMarket;
import com.blockchain.model.InvestmentRun;
import com.blockchain.model.OrderDetail;
import com.blockchain.model.TokenIssuance;
import com.blockchain.model.TokenMarketData;
import com.blockchain.model.TradingOrder;
import com.blockchain.model.User;

public interface DumpServices {
	public Map<String, Object> readDataFromCionMarketApi(int invRunId);

	public List<String> getCoinsName();

	public List<BitCoinDataDTO> getBitCoinDataList();

	public BitCoinDataDTO getCoinBySymbol(String paramString);

	public List<CurrentPortfolioDTO> getCurrentPortfolioList();

	public String addTradingOrders(List<BitCoinDataDTO> paramList,
			BigDecimal walletAmount);

	public void approvedTradingOrder(TradingOrder paramTradingOrder);

	public List<TradingOrderDTO> getNonApprovedOrder();

	public TradingOrder getOrderById(int paramInt);

	public List<TradingOrderDTO> getApprovedButNotExecuteOrders();

	public void buyCoins();

	public void tokenIssuedDateStore(TokenIssuance paramTokenIssuance);

	public BigDecimal getNAVValue(Timestamp paramTimestamp);

	public List<TokenDTO> getTokens();

	public CoinIgyToken getTokenById(long paramInt);

	public void updateToken(TokenDTO paramTokenDTO);

	public void tokenIssue(BigDecimal paramBigInteger);

	public List<TokenIssuanceDTO> getIssueTokenList();

	public void addAddress(String paramString1, String paramString2);

	public WithdrawDTO checkDuplicateAddress(String paramString);

	public List<WithdrawDTO> getWithdrawList();

	public List<WithdrawDTO> getWithdrawListByTokenId(int paramInt);

	public void updateWithdrawAddress(String paramString1, String paramString2);

	public void updateTradingOrder(TradingOrder paramTradingOrder);

	public BigDecimal walletAmount();

	public UserDTO getUserByEmail(String paramString);

	public List<UserDTO> getUserList();

	public UserDTO getUserById(int paramInt);

	public void updateUserInformation(UserDTO paramUserDTO);

	public void deleteUser(int paramInt);

	public void addUser(UserDTO paramUserDTO);

	public UserDTO getCurrentUser();

	public User findById(int paramInt);

	public User findBySSO(String paramString);

	public void saveUser(UserDTO paramUserDTO);

	public void updateUser(UserDTO paramUserDTO);

	public void deleteUserBySSO(String paramString);
	
	void updateUser(User user);

	public List<User> findAllUsers();

	public boolean isUserSSOUnique(Integer paramInteger, String paramString);

	public void updateOrderStatus();

	public User findUserByResetToken(String resetToken);
	
	public List<TradingOrderDTO> getApprovedOrderListForThisWeek(Date fromDate,
			Date toDate);

	public List<BitCoinData> getFilterListByDates();
	
	public List<TokenMarketData> getTokenMarketList();

	public List<ExchangeMarket> buyRecipe(List<TokenMarketData> tokenMarketList);
	
	public void approveRecipe(InvestmentApprovalsDTO investmentApprovalsDTO);

	public List<InvestmentRun> getInvestmentRunList();
	
	public void rejectRecipe(InvestmentApprovalsDTO investmentApprovalsDTO);
	
	public Map<String, Object> getInvestmentWorkflowDetail(int invId);

	public Map<String, Object> createOrder(int recipeRunId);

	public Map<String, Object> newRecipeRun(int invRunId);
	
	public InvestmentRun newInvestmentRun(Invest invest);

	public void saveOrderExecutionConfig(OrderExecutionConfigDTO orderExecutionConfigDTO);

	public Map<String, Object> approveOrder(OrderApprovalsDTO orderApprovalsDTO);

}

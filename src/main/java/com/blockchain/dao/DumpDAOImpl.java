package com.blockchain.dao;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;

import org.hibernate.SessionFactory;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.springframework.transaction.annotation.Transactional;

import com.blockchain.model.Account;
import com.blockchain.model.ApprovalType;
import com.blockchain.model.BaseCoin;
import com.blockchain.model.BitCoinData;
import com.blockchain.model.BlacklistedTokenInfo;
import com.blockchain.model.CoinIgyToken;
import com.blockchain.model.Deposit;
import com.blockchain.model.Exchange;
import com.blockchain.model.ExchangeMarket;
import com.blockchain.model.ExchangeTradeOrder;
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

@Transactional(rollbackFor = { Exception.class }, noRollbackFor = { Exception.class })
@org.springframework.stereotype.Repository("dumpDAO")
public class DumpDAOImpl implements DumpDAO {
	@org.springframework.beans.factory.annotation.Autowired
	SessionFactory sessionFactory;

	public DumpDAOImpl() {
	}

	public void storeData(BitCoinData bitCoinData) {
		sessionFactory.getCurrentSession().save(bitCoinData);
	}

	@SuppressWarnings("unchecked")
	public List<BitCoinData> getFilterListByDates(Date fromDate, Date toDate) {
		return

		sessionFactory.getCurrentSession().createCriteria(BitCoinData.class)
				.add(Restrictions.between("date", fromDate, toDate)).setFirstResult(1).setMaxResults(4).list();
	}

	public List<String> getCoinNames() {
		return

		sessionFactory.getCurrentSession().createCriteria(BitCoinData.class)
				.setProjection(Projections.distinct(Projections.property("symbol"))).list();
	}

	public List<BitCoinData> getBitCoinDataList() {
		return sessionFactory.getCurrentSession().createCriteria(BitCoinData.class).list();
	}

	public BitCoinData getBitCoinDataByTokenId(int tokenId) {
		return

		(BitCoinData) sessionFactory.getCurrentSession().createCriteria(BitCoinData.class)
				.createCriteria("token", "tokenName").add(Restrictions.eq("tokenName.tid", Integer.valueOf(tokenId)))
				.list().get(0);
	}

	public BitCoinData getCoinBySymbol(String symbol) {
		return (BitCoinData) sessionFactory.getCurrentSession().createCriteria(BitCoinData.class).setMaxResults(1)
				.add(Restrictions.eq("symbol", symbol)).uniqueResult();
	}

	public void addTradingOrder(TradingOrder order) {
		sessionFactory.getCurrentSession().save(order);
	}

	public void approvedTradingOrder(TradingOrder order) {
		sessionFactory.getCurrentSession().update(order);
	}

	public List<TradingOrder> getNonApprovedOrder(Date fromDate, Date toDate) {
		return

		sessionFactory.getCurrentSession().createCriteria(TradingOrder.class)
				.add(Restrictions.eq("approved", Boolean.valueOf(false)))
				.add(Restrictions.between("orderDate", fromDate, toDate)).list();
	}

	public TradingOrder getOrderById(int id) {
		return (TradingOrder) sessionFactory.getCurrentSession().get(TradingOrder.class, Integer.valueOf(id));
	}

	public List<TradingOrder> getApprovedButNotExecuteOrders() {
		return

		sessionFactory.getCurrentSession().createCriteria(TradingOrder.class)
				.add(Restrictions.eq("approved", Boolean.valueOf(true)))
				.add(Restrictions.eq("execute", Boolean.valueOf(false))).list();
	}

	public List<TradingOrder> getTradingOrderListForBuy(Date fromDate, Date toDate) {
		return

		sessionFactory.getCurrentSession().createCriteria(TradingOrder.class)
				.add(Restrictions.eq("approved", Boolean.valueOf(true)))
				.add(Restrictions.eq("execute", Boolean.valueOf(false)))
				.add(Restrictions.between("orderDate", fromDate, toDate)).list();
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<TradingOrder> getApprovedOrderListForThisWeek(Date fromDate, Date toDate) {
		return sessionFactory.getCurrentSession().createCriteria(TradingOrder.class)
				.add(Restrictions.between("orderDate", fromDate, toDate)).list();
	}

	public void updateTradingOrder(TradingOrder order) {
		sessionFactory.getCurrentSession().update(order);
	}

	public List<Integer> getTokenIdListOfTradingOrder() {
		return

		sessionFactory.getCurrentSession().createCriteria(TradingOrder.class)
				.setProjection(Projections.distinct(Projections.property("tokenId"))).list();
	}

	public List<TradingOrder> getTradingOrdetListbyTokenId(int tokenId) {
		return

		sessionFactory.getCurrentSession().createCriteria(TradingOrder.class)
				.add(Restrictions.eq("tokenId", Integer.valueOf(tokenId))).list();
	}

	public List<CoinIgyToken> getTokenList() {
		return sessionFactory.getCurrentSession().createCriteria(CoinIgyToken.class).list();
	}

	public CoinIgyToken getTokenById(long id) {
		return (CoinIgyToken) sessionFactory.getCurrentSession().get(CoinIgyToken.class, id);
	}

	public void updateToken(CoinIgyToken token) {
		sessionFactory.getCurrentSession().update(token);
	}

	public CoinIgyToken getToken(String toakenSymbol) {
		return (CoinIgyToken) sessionFactory.getCurrentSession().createCriteria(CoinIgyToken.class)
				.add(Restrictions.eq("symbol", toakenSymbol)).setMaxResults(1).uniqueResult();
	}

	public CoinIgyToken saveToken(CoinIgyToken newToken) {
		long id = ((Long) sessionFactory.getCurrentSession().save(newToken)).longValue();
		return (CoinIgyToken) sessionFactory.getCurrentSession().get(CoinIgyToken.class, id);
	}
	
	public void saveOrderExecutionConfiguration(OrderExecutionConfiguration orderExecutionConfiguration){
		sessionFactory.getCurrentSession().save(orderExecutionConfiguration);
	}
	
	public OrderSide getOrderSidebyName(String orderSideName){
		return (OrderSide) sessionFactory.getCurrentSession().createCriteria(OrderSide.class)
				.add(Restrictions.eq("name", orderSideName)).setMaxResults(1).uniqueResult();
	}
	
	public OrderState getOrderStatebyName(String orderStateName){
		return (OrderState) sessionFactory.getCurrentSession().createCriteria(OrderState.class)
				.add(Restrictions.eq("name", orderStateName)).setMaxResults(1).uniqueResult();
	}

	public void issueTokens(TokenIssuance token) {
		sessionFactory.getCurrentSession().save(token);
	}

	public List<TokenIssuance> getIssueTokenListList() {
		return sessionFactory.getCurrentSession().createCriteria(TokenIssuance.class).list();
	}

	@SuppressWarnings("unchecked")
	public BigDecimal currentMarketOfThePortfolio(Timestamp fromDate, Date startDate, Date endDate) {
		List<ExchangeTradeOrder> exchangeList = sessionFactory.getCurrentSession()
				.createCriteria(ExchangeTradeOrder.class).add(Restrictions.eq("status", "Filled"))
				.add(Restrictions.le("timestamp", fromDate)).list();
		return sumOfAmount(exchangeList);
	}

	private BigDecimal sumOfAmount(List<ExchangeTradeOrder> exchangeList) {
		BigDecimal total = new BigDecimal(0);
		for (ExchangeTradeOrder order : exchangeList) {
			BigDecimal am = order.getQuantity().multiply(order.getTradingOrder().getRate());
			total = total.add(am);
		}
		return total;
	}

	public BigDecimal getTokenIssuence(Date fromDate) {
		return (BigDecimal) sessionFactory.getCurrentSession().createCriteria(TokenIssuance.class)
				.add(Restrictions.lt("date", fromDate)).setProjection(Projections.sum("totalTokens")).uniqueResult();
	}

	public BigDecimal getTotalAmountOfEachCoinOrder(int id) {
		return (BigDecimal) sessionFactory.getCurrentSession().createCriteria(TradingOrder.class)
				.setProjection(Projections.sum("amount")).add(Restrictions.eq("execute", Boolean.valueOf(true)))
				.add(Restrictions.eq("approved", Boolean.valueOf(true)))
				.add(Restrictions.eq("tokenId", Integer.valueOf(id))).uniqueResult();
	}

	public void addAddress(Withdraw withdraw) {
		sessionFactory.getCurrentSession().save(withdraw);
	}

	public Withdraw checkDuplicateAddress(String withdrawAddress) {
		return (Withdraw) sessionFactory.getCurrentSession().createCriteria(Withdraw.class)
				.add(Restrictions.eq("withdrawAddress", withdrawAddress)).uniqueResult();
	}

	public List<Withdraw> getWithdrawList() {
		return sessionFactory.getCurrentSession().createCriteria(Withdraw.class).list();
	}

	public List<Withdraw> getWithdrawListByTokenId(int tokenId) {
		return

		sessionFactory.getCurrentSession().createCriteria(Withdraw.class).createCriteria("token", "tokenName")
				.add(Restrictions.eq("tokenName.tid", Integer.valueOf(tokenId))).list();
	}

	public void updateWithdrawAddress(String address, int tokenId) {
		List<Withdraw> list = sessionFactory.getCurrentSession().createCriteria(Withdraw.class)
				.createCriteria("token", "tokenName").add(Restrictions.eq("tokenName.tid", Integer.valueOf(tokenId)))
				.list();
		for (Withdraw item : list) {
			item.setActive(false);
			sessionFactory.getCurrentSession().update(item);
		}
		Withdraw withdraw = (Withdraw) sessionFactory.getCurrentSession().createCriteria(Withdraw.class)
				.add(Restrictions.eq("withdrawAddress", address)).createCriteria("token", "tokenName")
				.add(Restrictions.eq("tokenName.tid", Integer.valueOf(tokenId))).uniqueResult();
		withdraw.setActive(true);
		sessionFactory.getCurrentSession().update(withdraw);
	}

	public TokenIssuance getLastTokenIssue() {
		return (TokenIssuance) sessionFactory.getCurrentSession().createCriteria(TokenIssuance.class)
				.addOrder(org.hibernate.criterion.Order.desc("date")).setMaxResults(1).uniqueResult();
	}

	public User getUserByEmail(String email) {
		return (User) sessionFactory.getCurrentSession().createCriteria(User.class).add(Restrictions.eq("email", email))
				.uniqueResult();
	}

	public List<User> getUserList() {
		return sessionFactory.getCurrentSession().createCriteria(User.class).list();
	}

	public User getUserById(int id) {
		return (User) sessionFactory.getCurrentSession().createCriteria(User.class)
				.add(Restrictions.eq("id", Integer.valueOf(id))).uniqueResult();
	}

	public void updateUserInformation(User user) {
		sessionFactory.getCurrentSession().update(user);
	}

	public void deleteUser(User user) {
		sessionFactory.getCurrentSession().delete(user);
	}

	public void deleteProfile(UserProfile profile) {
		sessionFactory.getCurrentSession().delete(profile);
	}

	public void addUser(User user) {
		sessionFactory.getCurrentSession().save(user);
	}

	@Override
	public User findUserByResetToken(String resetToken) {
		return (User) sessionFactory.getCurrentSession().createCriteria(User.class)
				.add(Restrictions.eq("resetToken", resetToken)).uniqueResult();
	}

	@Override
	public TradingOrder getTradingOrderByToken(int id) {

		return (TradingOrder) sessionFactory.getCurrentSession().createCriteria(TradingOrder.class)
				.add(Restrictions.eq("tokenId", id)).uniqueResult();
	}

	@Override
	public CoinIgyToken getBlackListByTokenName(String tokenName) {
		return (CoinIgyToken) sessionFactory.getCurrentSession().createCriteria(CoinIgyToken.class)
				.add(Restrictions.eq("tokenName", tokenName)).uniqueResult();
	}
	
	@Override
	public CoinIgyToken getBlackListByTokenSymbol(String tokenSymbol)
	{
		return (CoinIgyToken) sessionFactory.getCurrentSession().createCriteria(CoinIgyToken.class)
				.add(Restrictions.eq("symbol", tokenSymbol)).uniqueResult();
	}

	@Override
	public void saveTokenMarketData(List<TokenMarketData> tokenMarketDataList) {
		for(TokenMarketData tmd : tokenMarketDataList){
			sessionFactory.getCurrentSession().save(tmd);
		}
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public List<TokenMarketData> getTokenMarketList() {
		Timestamp time = (Timestamp)sessionFactory.getCurrentSession().createCriteria(TokenMarketData.class).setProjection(Projections.max("executeDate")).uniqueResult();
		time = new Timestamp((time.getTime()-60000));
		
		System.out.println("timestemp is "+time);
		return sessionFactory.getCurrentSession().createCriteria(TokenMarketData.class).add(Restrictions.gt("executeDate", time)).list();
	}
	
	
	@Override
	public void storeData(BlacklistedTokenInfo  blTokenInfo) {
		sessionFactory.getCurrentSession().save(blTokenInfo);
	}
	
	public BlacklistedTokenInfo getblackListedTokenByIdAndStatus(CoinIgyToken token, boolean blacklistStatus) {
		return (BlacklistedTokenInfo) sessionFactory.getCurrentSession().createCriteria(BlacklistedTokenInfo.class)
		.add(Restrictions.eq("ctoken", token))
		.add(Restrictions.eq("blacklistStatus", blacklistStatus))
		.addOrder(org.hibernate.criterion.Order.desc("validFrom")).setMaxResults(1).uniqueResult();
	}

	@Override
	public void updateBlackListTokenInfo(BlacklistedTokenInfo blto) {
		sessionFactory.getCurrentSession().update(blto);
		
	}

	@Override
	public void saveBlackListTokenInfo(BlacklistedTokenInfo tokenInfo) {
		sessionFactory.getCurrentSession().save(tokenInfo);
		
	}

	@Override
	public BlacklistedTokenInfo getblackListedTokenByIdAndStatus(CoinIgyToken token) {
		return (BlacklistedTokenInfo) sessionFactory.getCurrentSession().createCriteria(BlacklistedTokenInfo.class)
				.add(Restrictions.eq("ctoken", token))
				.addOrder(org.hibernate.criterion.Order.desc("id")).setMaxResults(1).uniqueResult();
	}

	public void saveMarketExchange(List<ExchangeMarket> mktExch)
	{
		for(ExchangeMarket me : mktExch){
		sessionFactory.getCurrentSession().save(me);
		}
	}
	
	@Override
	public InvestmentMode getInvestmentModebyName(String mode) {
		return (InvestmentMode) sessionFactory.getCurrentSession().createCriteria(InvestmentMode.class)
				.add(Restrictions.eq("name", mode)).uniqueResult();
	}
	
	@Override
	public InvWorkflowState getInvWorkflowStatebyName(String flowName) {
		return (InvWorkflowState) sessionFactory.getCurrentSession().createCriteria(InvWorkflowState.class)
				.add(Restrictions.eq("name", flowName)).uniqueResult();
	}
	
	@Override
	public StrategyType getStrategyTypebyName(String strgName) {
		return (StrategyType) sessionFactory.getCurrentSession().createCriteria(StrategyType.class)
				.add(Restrictions.eq("name", strgName)).uniqueResult();
	}
	
	public int saveInvestmentRun(InvestmentRun invRun)
	{
		return (Integer)sessionFactory.getCurrentSession().save(invRun);
	}
	
	@Override
	public void updateInvestmentRun(InvestmentRun invRun) {
		sessionFactory.getCurrentSession().update(invRun);
		
	}
	
	@Override
	public InvestmentRun getInvestmentRunbyId(int id) {
		return (InvestmentRun) sessionFactory.getCurrentSession().createCriteria(InvestmentRun.class)
				.add(Restrictions.eq("id", id)).uniqueResult();
	}
	/*
	@Override
	public InvestmentRun getInvestmentRunbyRecipeRunId(int recipeRunId) {
		return (InvestmentRun) sessionFactory.getCurrentSession().createCriteria(InvestmentRun.class)
				.add(Restrictions.eq("id", recipeRunId)).uniqueResult();
	}*/
	
	@Override
	public RecipeRun getRecipeRunbyId(int id) {
		return (RecipeRun) sessionFactory.getCurrentSession().createCriteria(RecipeRun.class)
				.add(Restrictions.eq("id", id)).uniqueResult();
	}
	
	@Override
	public int saveRecipeRun(RecipeRun recRun)
	{
		return (Integer) sessionFactory.getCurrentSession().save(recRun);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public List<RecipeRun> getRecipeRunbyInvRunId(InvestmentRun investmentRun) {
		return (List<RecipeRun>) sessionFactory.getCurrentSession().createCriteria(RecipeRun.class)
				.add(Restrictions.eq("investmentRun", investmentRun)).list();
	}

	@Override
	public ApprovalType getApprovalTypebyName(String name) {
		return (ApprovalType) sessionFactory.getCurrentSession().createCriteria(ApprovalType.class)
				.add(Restrictions.eq("name", name)).uniqueResult();
	}
	
	@Override
	public InvestmentApprovals getInvestmentApprovalsbyInvRunId(InvestmentRun invRun) {
		return (InvestmentApprovals) sessionFactory.getCurrentSession().createCriteria(InvestmentApprovals.class)
				.add(Restrictions.eq("investmentRun", invRun)).uniqueResult();
	}
	
	@Override
	public InvestmentApprovals getInvestmentApprovalsbyRecipeRunId(int recipeRunId) {
		return (InvestmentApprovals) sessionFactory.getCurrentSession().createCriteria(InvestmentApprovals.class)
				.add(Restrictions.eq("recipeRun.id", recipeRunId)).uniqueResult();
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public List<InvestmentRun> getInvestmentRunbyUser(int uid){
		return (List<InvestmentRun>) sessionFactory.getCurrentSession().createCriteria(InvestmentRun.class)
				.add(Restrictions.eq("user.id", uid)).list();
	}
	
	public void saveInvestmentApprovals(InvestmentApprovals invApprove)
	{
		sessionFactory.getCurrentSession().save(invApprove);
	}
	
	@Override
	public void updateInvestmentApprovals(InvestmentApprovals invApprov) {
		sessionFactory.getCurrentSession().update(invApprov);
		
	}
	
	@Override
	public BaseCoin getBaseCoinbyName(String name) {
		return (BaseCoin) sessionFactory.getCurrentSession().createCriteria(BaseCoin.class)
				.add(Restrictions.eq("currencyName", name)).uniqueResult();
	}
	
	@Override
	public void saveRecipeDetail(RecipeDetail recDetail)
	{
		sessionFactory.getCurrentSession().save(recDetail);
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<InvestmentRun> getInvestmentRunList() {
		return sessionFactory.getCurrentSession().createCriteria(InvestmentRun.class).list();
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public List<RecipeDetail> getRecipeDetailbyRecipeRunId(RecipeRun recipeRun){
		return (List<RecipeDetail>) sessionFactory.getCurrentSession().createCriteria(RecipeDetail.class)
				.add(Restrictions.eq("recipeRun", recipeRun)).list();
	}
	
	@Override
	public void saveDeposit(Deposit deposit)
	{
		sessionFactory.getCurrentSession().save(deposit);
	}
	
	@Override
	public int saveOrderRun(OrderRun orderRun){
		return (Integer) sessionFactory.getCurrentSession().save(orderRun);
	}
	
	@Override
	public void saveOrderDetail(OrderDetail orderDetail){
		 sessionFactory.getCurrentSession().save(orderDetail);
	}
	
	@Override
	public Deposit getDepositbyParams(int recipeRunID, int invRunID, String exchangeAccountID, String baseCoin){
		return (Deposit) sessionFactory.getCurrentSession().createCriteria(Deposit.class)
				.add(Restrictions.eq("recipeRunID", recipeRunID))
				.add(Restrictions.eq("invRunID", invRunID))
				.add(Restrictions.eq("exchangeAccountID", exchangeAccountID))
				.add(Restrictions.eq("baseCoin", baseCoin)).uniqueResult();
	}
	
	@Override
	public void updateDeposit(Deposit deposit) {
		sessionFactory.getCurrentSession().update(deposit);
		
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public List<OrderDetail> getOrderDetailbyOrderRunId(OrderRun orderRun){
		return (List<OrderDetail>) sessionFactory.getCurrentSession().createCriteria(OrderDetail.class)
				.add(Restrictions.eq("orderRun", orderRun)).list();
	}
	
	@Override
	public OrderRun getOrderRunbyId(int orderRunId){
		return (OrderRun) sessionFactory.getCurrentSession().createCriteria(OrderRun.class)
				.add(Restrictions.eq("id", orderRunId)).uniqueResult();
	}
	
	@Override
	public CoinIgyToken getTokenbyName(String tokenName){
		return (CoinIgyToken) sessionFactory.getCurrentSession().createCriteria(CoinIgyToken.class)
				.add(Restrictions.eq("tokenName", tokenName)).uniqueResult();
	}
	@SuppressWarnings("unchecked")
	@Override
	public List<Account> getAccountList() {
		return sessionFactory.getCurrentSession().createCriteria(Account.class).list();
	}

	@Override
	public Exchange getExchangebyName(String exch_name) {
		return (Exchange) sessionFactory.getCurrentSession().createCriteria(Exchange.class)
				.add(Restrictions.eq("exch_name", exch_name)).uniqueResult();
	}

	@Override
	public OrderType getOrderTypebyName(String orderTypeName) {
		return (OrderType) sessionFactory.getCurrentSession().createCriteria(OrderType.class)
				.add(Restrictions.eq("name", orderTypeName)).uniqueResult();
	}

	@Override
	public Account getAccountByExchange(long exchng_id) {
		return (Account) sessionFactory.getCurrentSession().createCriteria(Account.class)
				.add(Restrictions.eq("exch_id", exchng_id)).uniqueResult();
		
	}

	@Override
	public void saveOrderExecutionRecord(OrderExecution orderExecution) {
		
		sessionFactory.getCurrentSession().save(orderExecution);
	}
	@Override
	public OrderState getOrdetStatebyName(String orderStateName){
		return (OrderState) sessionFactory.getCurrentSession().createCriteria(OrderState.class)
				.add(Restrictions.eq("name", orderStateName)).uniqueResult();
	}
}

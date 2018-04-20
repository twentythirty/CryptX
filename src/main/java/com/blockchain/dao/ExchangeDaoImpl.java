package com.blockchain.dao;

import java.util.List;

import org.hibernate.SessionFactory;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.blockchain.model.Account;
import com.blockchain.model.BlacklistedTokenInfo;
import com.blockchain.model.CoinIgyToken;
import com.blockchain.model.Exchange;
import com.blockchain.model.ExchangeTradeOrder;
import com.blockchain.model.PriceTicker;
import com.blockchain.model.Wallet;

@Transactional(rollbackFor = { Exception.class }, noRollbackFor = { Exception.class })
@org.springframework.stereotype.Repository("exchangeDao")
public class ExchangeDaoImpl implements ExchangeDao {

	private static final String STATUS = "status";
	@Autowired
	SessionFactory sessionFactory;

	@Override
	public void saveTradeOrder(ExchangeTradeOrder order) {
		sessionFactory.getCurrentSession().save(order);
	}

	@Override
	public void updateTradeOrder(ExchangeTradeOrder order) {
		sessionFactory.getCurrentSession().update(order);
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ExchangeTradeOrder> updateTradeOrder() {
		return sessionFactory.getCurrentSession().createCriteria(ExchangeTradeOrder.class)
				.add(Restrictions.ne(STATUS, "filled")).add(Restrictions.ne(STATUS, "cancel"))
				.add(Restrictions.between("orderTime", System.currentTimeMillis() - 300000, System.currentTimeMillis()))
				.list();

	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ExchangeTradeOrder> getSuccessOrderList() {
		return sessionFactory.getCurrentSession().createCriteria(ExchangeTradeOrder.class)
				.add(Restrictions.eqOrIsNull(STATUS, "filled")).list();
	}

	@Override
	public Wallet getWallet() {
		return (Wallet) sessionFactory.getCurrentSession().createCriteria(Wallet.class).setMaxResults(1).uniqueResult();

	}

	@Override
	public void updateWalletAmount(Wallet wallet) {
		sessionFactory.getCurrentSession().update(wallet);

	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ExchangeTradeOrder> getNonFilledOrders() {
		return sessionFactory.getCurrentSession().createCriteria(ExchangeTradeOrder.class)
				.add(Restrictions.eq(STATUS, "pending"))
				.add(Restrictions.le("orderTime", System.currentTimeMillis() - 300000)).list();
	}
	@Override
	public void saveTicker(PriceTicker priceTicker) {
	sessionFactory.getCurrentSession().save(priceTicker);
		
	}
	@Override
	public List<PriceTicker> getPriceTicker() {
		return sessionFactory.getCurrentSession().createCriteria(PriceTicker.class).list();
	}
	
	public PriceTicker getPriceTickerByExchangeAndMarket(String exchangeName, String marketName){
		return (PriceTicker) sessionFactory.getCurrentSession().createCriteria(PriceTicker.class)
				.add(Restrictions.eq("exchange", exchangeName))
				.add(Restrictions.eq("market", marketName))
				.setMaxResults(1).uniqueResult();
	}

	@Override
	public void saveExchange(Exchange exchange) {
		sessionFactory.getCurrentSession().save(exchange);
	}
	@Override
	public void saveAccount(Account account){
		sessionFactory.getCurrentSession().save(account);
	}
	@Override 
  	public String getExchangeNamebyCode(String exchangeCode){
  	return  (String) sessionFactory.getCurrentSession().createCriteria(Exchange.class)
			.add(Restrictions.eq("exch_code", exchangeCode)).uniqueResult();
	}
}

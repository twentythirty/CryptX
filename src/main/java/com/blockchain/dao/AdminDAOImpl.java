package com.blockchain.dao;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.List;

import org.hibernate.SessionFactory;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.springframework.transaction.annotation.Transactional;

import com.blockchain.model.Account;
import com.blockchain.model.BitCoinData;
import com.blockchain.model.Exchange;
import com.blockchain.model.PriceTicker;
import com.blockchain.model.TokenMarketData;

@org.springframework.stereotype.Repository("adminDAO")
@Transactional(rollbackFor={Exception.class}, noRollbackFor={Exception.class})
public class AdminDAOImpl implements AdminDAO
{
  @org.springframework.beans.factory.annotation.Autowired
  SessionFactory sessionFactory;
  
  public AdminDAOImpl() {}
  
  public List<BitCoinData> getCoins(Date todate, Date fromdate)
  {
    BigDecimal bD = new BigDecimal(30000);
    BigDecimal caphigh = new BigDecimal(100000000000L);
    return sessionFactory.getCurrentSession().createCriteria(BitCoinData.class)
      .add(Restrictions.between("date", todate, fromdate))
      .add(Restrictions.gt("cap", caphigh))
      .add(Restrictions.gt("volume", bD)).setMaxResults(100)
      .list();
  }
  

  public List<BitCoinData> getCoins7(Date todate, Date fromdate, int maxResult)
  {
    BigDecimal bD = new BigDecimal(30000);
    BigDecimal capLow = new BigDecimal(10000000000L);
    BigDecimal caphigh = new BigDecimal(100000000000L);
    return sessionFactory.getCurrentSession().createCriteria(BitCoinData.class)
      .add(Restrictions.between("date", todate, fromdate))
      .add(Restrictions.gt("volume", bD))
      .add(Restrictions.between("cap", capLow, caphigh))
      .addOrder(Order.desc("cap")).setMaxResults(maxResult)
      .list();
  }
  

  public List<BitCoinData> getCoins6(Date todate, Date fromdate, int maxResult)
  {
    BigDecimal bD = new BigDecimal(30000);
    BigDecimal capLow = new BigDecimal(1000000000);
    BigDecimal caphigh = new BigDecimal(10000000000L);
    return sessionFactory.getCurrentSession().createCriteria(BitCoinData.class)
      .add(Restrictions.between("date", todate, fromdate))
      .add(Restrictions.gt("volume", bD))
      .add(Restrictions.between("cap", capLow, caphigh))
      .addOrder(Order.desc("cap")).setMaxResults(maxResult)
      .list();
  }
  

  public List<BitCoinData> getFourthRootList(Date todate, Date fromDate, int maxResult)
  {
    BigDecimal bD = new BigDecimal(30000);
    BigDecimal capLow = new BigDecimal(1000000000);
    return sessionFactory.getCurrentSession().createCriteria(BitCoinData.class)
      .add(Restrictions.between("date", todate, fromDate))
      .add(Restrictions.gt("volume", bD))
      .add(Restrictions.le("cap", capLow))
      .addOrder(Order.desc("cap")).setMaxResults(maxResult)
      .list();
  }
  @SuppressWarnings("unchecked")
@Override
	public List<PriceTicker> getPriceTicker() {
		return sessionFactory.getCurrentSession().createCriteria(PriceTicker.class).list();
	}
  
  @SuppressWarnings("unchecked")
@Override
	public List<TokenMarketData> getTokenData() {
	 return sessionFactory.getCurrentSession().createCriteria(TokenMarketData.class).list();
	}
  
  @SuppressWarnings("unchecked")
  @Override
  	public List<Exchange> getExchangeList() {
  		return sessionFactory.getCurrentSession().createCriteria(Exchange.class).list();
  	}

	@Override
	public List<Account> getAccountList() {
		return sessionFactory.getCurrentSession().createCriteria(Account.class).list();
}
}

package com.blockchain.services;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.blockchain.dao.AdminDAO;
import com.blockchain.dto.BitCoinDataDTO;
import com.blockchain.mapper.TokenMapper;
import com.blockchain.model.BitCoinData;
import com.blockchain.model.PriceTicker;
import com.blockchain.model.TokenMarketData;
import com.blockchain.utils.DateUtils;

@Transactional(rollbackFor={Exception.class}, noRollbackFor={Exception.class})
@org.springframework.stereotype.Service("adminServices")
public class AdminServicesImpl implements AdminServices
{
  @Autowired
  AdminDAO adminDAO;
  
  
  private static Logger logger = Logger.getLogger(AdminServicesImpl.class);
  
  public List<BitCoinDataDTO> getCoinList() { logger.debug("#### getCoinList method execution start....");
    List<BitCoinDataDTO> list8 = getCoinList8();
    int maxResult = 100 - list8.size();
    
    if (maxResult != 0) {
      List<BitCoinDataDTO> list7 = getCoinList7(maxResult);
      maxResult -= list7.size();
      list8.addAll(list7);
    }
    if (maxResult != 0) {
      List<BitCoinDataDTO> list6 = getCoinList6(maxResult);
      maxResult -= list6.size();
      list8.addAll(list6);
    }
    if (maxResult != 0) {
      List<BitCoinDataDTO> fourthRootList = getFourthRootCoinList(maxResult);
      list8.addAll(fourthRootList);
    }
    
    return list8;
  }
  
  public List<BitCoinDataDTO> getCoinList8() {
    logger.debug("#### getCoinList method execution start....");
    Date fromDate = DateUtils.getMinDate();
    Date toDate = DateUtils.getMaxDate();
    List<BitCoinData> csvList = adminDAO.getCoins(fromDate, toDate);
    List<BitCoinDataDTO> list = new ArrayList<>();
    
    for (BitCoinData coin : csvList) {
      logger.debug("inside for loop of getCoinList8 method.... ");
      BitCoinDataDTO d = new BitCoinDataDTO();
      getTokenMapperInstance().tokenMapping(d, coin);
      d.setAllocation(new BigDecimal("8.00"));
      BigDecimal weight = d.getCap().multiply(new BigDecimal(8)).divide(new BigDecimal(100));
      d.setWeight(weight);
      list.add(d);
      logger.debug("for loop  of getCoinList8 complete once");
    }
    logger.debug("for loop of getCoinList8 complete totally and also complete method execution");
    return list;
  }
  


  private List<BitCoinDataDTO> getCoinList7(int maxResult)
  {
    logger.debug("#### getCoinList7 method execution start....");
    Date fromDate = DateUtils.getMinDate();
    Date toDate = DateUtils.getMaxDate();
    List<BitCoinData> csvList = null;
    csvList = adminDAO.getCoins7(fromDate, toDate, maxResult);
    List<BitCoinDataDTO> list = new ArrayList<>();
    
    for (BitCoinData coin : csvList) {
      logger.debug("inside for loop of getCoinList7 method.... ");
      BitCoinDataDTO d = new BitCoinDataDTO();
      getTokenMapperInstance().tokenMapping(d, coin);
      d.setAllocation(new BigDecimal("7.00"));
      BigDecimal weight = d.getCap().multiply(new BigDecimal(7)).divide(new BigDecimal(100));
      d.setWeight(weight);
      list.add(d);
      logger.debug("for loop  of getCoinList7 complete once");
    }
    logger.debug("for loop of getCoinList7 complete totally and also complete method execution");
    return list;
  }
  
  private List<BitCoinDataDTO> getCoinList6(int maxResult)
  {
    logger.debug("#### getCoinList6 method execution start....");
    Date fromDate = DateUtils.getMinDate();
    Date toDate = DateUtils.getMaxDate();
    List<BitCoinData> csvList = adminDAO.getCoins6(fromDate, toDate, maxResult);
    List<BitCoinDataDTO> list = new ArrayList<>();
    
    for (BitCoinData coin : csvList) {
      logger.debug("inside for loop of getCoinList6 method.... ");
      BitCoinDataDTO d = new BitCoinDataDTO();
      getTokenMapperInstance().tokenMapping(d, coin);
      d.setAllocation(new BigDecimal("6.00"));
      BigDecimal weight = d.getCap().multiply(new BigDecimal(6)).divide(new BigDecimal(100));
      d.setWeight(weight);
      list.add(d);
      logger.debug("for loop of getCoinList6 complete once");
    }
    logger.debug("for loop of getCoinList6 complete totally and also complete method execution");
    return list;
  }
  
  private List<BitCoinDataDTO> getFourthRootCoinList(int maxResult) {
    logger.debug("#### getCoinList6 method execution start....");
    Date fromDate = DateUtils.getMinDate();
    Date toDate = DateUtils.getMaxDate();
    List<BitCoinData> csvList = adminDAO.getFourthRootList(fromDate, toDate, maxResult);
    List<BitCoinDataDTO> list = new ArrayList<>();
    BigDecimal totalWeight = new BigDecimal(0);
    for (BitCoinData coin : csvList) {
      logger.debug("inside for loop of getCoinList6 method.... ");
      BitCoinDataDTO d = new BitCoinDataDTO();
      getTokenMapperInstance().tokenMapping(d, coin);
      double b = Math.pow(coin.getCap().doubleValue(), 0.25D);
      BigDecimal weight = BigDecimal.valueOf(b);
      totalWeight = totalWeight.add(weight);
      d.setFourthroot(true);
      BigDecimal allocation = weight.divide(totalWeight, 2, java.math.RoundingMode.HALF_UP);
      d.setAllocation(allocation);
      
      d.setWeight(weight);
      list.add(d);
      logger.debug("for loop of getCoinList6 complete once");
    }
    logger.debug("for loop of getCoinList6 complete totally and also complete method execution");
    return list;
  }
  
  private TokenMapper getTokenMapperInstance() { return new TokenMapper(); }
  
  
  @Override
  public List<PriceTicker> getPriceTickerList(){
	  return adminDAO.getPriceTicker();
  }
@Override
	public List<TokenMarketData> getTokenMarketData() {
		return adminDAO.getTokenData();
	}  
  
  
  
  
}

package com.blockchain.dao;

import java.sql.Date;
import java.util.List;

import com.blockchain.model.BitCoinData;
import com.blockchain.model.Exchange;
import com.blockchain.model.PriceTicker;
import com.blockchain.model.TokenMarketData;
import com.blockchain.model.Account;

public abstract interface AdminDAO
{
  public abstract List<BitCoinData> getCoins(Date paramDate1, Date paramDate2);
  
  public abstract List<BitCoinData> getCoins7(Date paramDate1, Date paramDate2, int paramInt);
  
  public abstract List<BitCoinData> getCoins6(Date paramDate1, Date paramDate2, int paramInt);
  
  public abstract List<BitCoinData> getFourthRootList(Date paramDate1, Date paramDate2, int paramInt);
  
  public List<PriceTicker> getPriceTicker();
  
  public List<TokenMarketData> getTokenData();

  public List<Exchange> getExchangeList();

  public  List<Account> getAccountList();
}

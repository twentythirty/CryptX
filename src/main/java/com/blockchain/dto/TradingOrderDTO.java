package com.blockchain.dto;

import java.math.BigDecimal;


public class TradingOrderDTO
{
  private int id;
  private String tokenName;
  private String exchange;
  private BigDecimal rate;
  private BigDecimal amount;
  private boolean approved;
  private boolean execute;
  
  public TradingOrderDTO() {}
  
  public int getId()
  {
    return id;
  }
  
  public void setId(int id) { this.id = id; }
  
  public String getTokenName() {
    return tokenName;
  }
  
  public void setTokenName(String tokenName) { this.tokenName = tokenName; }
  
  public String getExchange() {
    return exchange;
  }
  
  public void setExchange(String exchange) { this.exchange = exchange; }
  
  public BigDecimal getRate() {
    return rate;
  }
  
  public void setRate(BigDecimal rate) { this.rate = rate; }
  
  public BigDecimal getAmount() {
    return amount;
  }
  
  public void setAmount(BigDecimal amount) { this.amount = amount; }
  
  public boolean getApproved() {
    return approved;
  }
  
  public void setApproved(boolean approved) { this.approved = approved; }
  
  public boolean getExecute() {
    return execute;
  }
  
  public void setExecute(boolean execute) { this.execute = execute; }
}

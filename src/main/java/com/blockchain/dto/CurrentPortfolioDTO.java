package com.blockchain.dto;

import java.math.BigDecimal;

public class CurrentPortfolioDTO {
  private String coinName;
  
  public CurrentPortfolioDTO() {}
  
  public String getCoinName() { return coinName; }
  
  public void setCoinName(String coinName) {
    this.coinName = coinName;
  }
  
  public BigDecimal getTotalAmount() { return totalAmount; }
  
  public void setTotalAmount(BigDecimal totalAmount) {
    this.totalAmount = totalAmount;
  }
  
  public BigDecimal getBoughtAmount() { return boughtAmount; }
  
  public void setBoughtAmount(BigDecimal boughtAmount) {
    this.boughtAmount = boughtAmount;
  }
  
  private BigDecimal totalAmount;
  private BigDecimal boughtAmount;
}

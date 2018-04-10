package com.blockchain.model;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@javax.persistence.Entity
@javax.persistence.Table(name="Withdraw")
public class Withdraw
{
  @javax.persistence.Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  @Column(name="Id")
  private int id;
  @Column(name="WithdrawAddress", columnDefinition="text")
  private String withdrawAddress;
  @Column(name="Active")
  private boolean active;
  @Column(name="WithdrawAmount")
  private BigDecimal withdrawAmount;
  @javax.persistence.OneToOne(cascade={javax.persistence.CascadeType.ALL})
  @javax.persistence.JoinColumn(name="tokenId")
  private Token token;
  
  public Withdraw() {}
  
  public int getId()
  {
    return id;
  }
  
  public void setId(int id) { this.id = id; }
  
  public String getWithdrawAddress() {
    return withdrawAddress;
  }
  
  public void setWithdrawAddress(String withdrawAddress) { this.withdrawAddress = withdrawAddress; }
  
  public boolean isActive() {
    return active;
  }
  
  public void setActive(boolean active) { this.active = active; }
  
  public BigDecimal getWithdrawAmount() {
    return withdrawAmount;
  }
  
  public void setWithdrawAmount(BigDecimal withdrawAmount) { this.withdrawAmount = withdrawAmount; }
  
  public Token getToken() {
    return token;
  }
  
  public void setToken(Token token) { this.token = token; }
}

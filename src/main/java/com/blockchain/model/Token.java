package com.blockchain.model;

import javax.persistence.Column;

@javax.persistence.Entity
@javax.persistence.Table(name="Token")
public class Token {
  @javax.persistence.Id
  @javax.persistence.GeneratedValue
  @Column(name="tid")
  private int tid;
  @Column(name="TokenName")
  private String tokenName;
  @Column(name="PreferredExchange")
  private String preferredExchange;
  @Column(name="Blacklist")
  private boolean blacklist;
  
  public Token() {}
  
  public boolean isBlacklist() { return blacklist; }
  
  public void setBlacklist(boolean blacklist) {
    this.blacklist = blacklist;
  }
  
  public int getTid() { return tid; }
  
  public void setTid(int tid) {
    this.tid = tid;
  }
  
  public String getTokenName() { return tokenName; }
  
  public void setTokenName(String tokenName) {
    this.tokenName = tokenName;
  }
  
  public String getPreferredExchange() { return preferredExchange; }
  
  public void setPreferredExchange(String preferredExchange) {
    this.preferredExchange = preferredExchange;
  }
}

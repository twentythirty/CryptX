package com.blockchain.dto;

import java.math.BigDecimal;
import java.sql.Date;

import javax.xml.bind.annotation.XmlRootElement;

import com.blockchain.model.Token;

@XmlRootElement
public class BitCoinDataDTO
{
  private int id;
  private String name;
  private BigDecimal volume;
  private BigDecimal supply;
  private BigDecimal price;
  private String symbol;
  private BigDecimal cap;
  private Date date;
  private boolean fourthroot = false;
  private BigDecimal allocation;
   
  public BigDecimal getWeight() { return weight; }
  
  public void setWeight(BigDecimal weight) {
    this.weight = weight;
  }
  
  public BigDecimal getAllocation() { return allocation; }
  
  public void setAllocation(BigDecimal allocation) {
    this.allocation = allocation;
  }
  
  public boolean isFourthroot() { return fourthroot; }
  
  public void setFourthroot(boolean fourthroot) {
    this.fourthroot = fourthroot;
  }
  
  public int getId() { return id; }
  
  public void setId(int id) {
    this.id = id;
  }
  
  public String getName() { return name; }
  

  public void setName(String name) { this.name = name; }
  private BigDecimal weight;
  
  public BigDecimal getVolume() { return volume; }
  
  private Token token;
  public void setVolume(BigDecimal volume) { this.volume = volume; }
  

  public BigDecimal getSupply() { return supply; }
  
  public void setSupply(BigDecimal supply) {
    this.supply = supply;
  }
  
  public BigDecimal getPrice() { return price; }
  
  public void setPrice(BigDecimal price) {
    this.price = price;
  }
  
  public String getSymbol() { return symbol; }
  
  public void setSymbol(String symbol) {
    this.symbol = symbol;
  }
  
  public BigDecimal getCap() { return cap; }
  
  public void setCap(BigDecimal cap) {
    this.cap = cap;
  }
  
  public Date getDate() { return date; }
  
  public void setDate(Date date) {
    this.date = date;
  }
  
  public Token getToken() { return token; }
  
  public void setToken(Token token) {
    this.token = token;
  }
  
  public boolean equals(Object obj) {
    BitCoinDataDTO bitcoin = (BitCoinDataDTO)obj;
    try {
      if (symbol.equals(symbol)) {
        return true;
      }
      return false;
    }
    catch (NullPointerException ex) {}
    return false;
  }
  
  public int hashCode()
  {
    return symbol.hashCode();
  }
}

package com.blockchain.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@javax.persistence.Table(name = "ExchangeMarket")
public class ExchangeMarket {
	
	@javax.persistence.Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "Id")
	private int id;
	
	@Column(name = "Exchange_Name")
	private String exchangeName;
	@Column(name = "Market")
	private String marketName;
	@Column(name = "Ask" , precision = 25, scale = 10)
	private BigDecimal ask;
	@Column(name = "Base_Type")
	private String baseType;
	@Column(name = "Amount" , precision = 25, scale = 10)
	private BigDecimal amount;
	@Column(name = "Quantity" , precision = 25, scale = 10)
	private BigDecimal quantity;
	public BigDecimal getQuantity() {
		return quantity;
	}
	public void setQuantity(BigDecimal quantity) {
		this.quantity = quantity;
	}
	@Column(name = "Symbol")
	private String symbol;
	@Column(name = "Flag")
	private String flag;
	@Column(name = "Name")
	private String name;
	@Column(name = "Token_Type")
	private String tokenType;
	
	@Column(name = "Volume24_USD", precision = 25, scale = 2)
	private BigDecimal volume24USD;
	
	@Column(name = "MarketCap_USD", precision = 30, scale = 2)
	private BigDecimal marketCapUSD;
	
	@Column(name = "Updated_Date")
	private Timestamp date;
	
	public BigDecimal getVolume24USD() {
		return volume24USD;
	}
	public void setVolume24USD(BigDecimal volume24usd) {
		volume24USD = volume24usd;
	}
	public BigDecimal getMarketCapUSD() {
		return marketCapUSD;
	}
	public void setMarketCapUSD(BigDecimal marketCapUSD) {
		this.marketCapUSD = marketCapUSD;
	}
	public Timestamp getDate() {
		return date;
	}
	public void setDate(Timestamp date) {
		this.date = date;
	}
	public String getTokenType() {
		return tokenType;
	}
	public void setTokenType(String tokenType) {
		this.tokenType = tokenType;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getSymbol() {
		return symbol;
	}
	public void setSymbol(String symbol) {
		this.symbol = symbol;
	}
	public String getFlag() {
		return flag;
	}
	public void setFlag(String flag) {
		this.flag = flag;
	}
	public BigDecimal getAmount() {
		return amount;
	}
	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}
	public String getBaseType() {
		return baseType;
	}
	public void setBaseType(String baseType) {
		this.baseType = baseType;
	}
	public BigDecimal getAsk() {
		return ask;
	}
	public void setAsk(BigDecimal ask) {
		this.ask = ask;
	}
	public String getExchangeName() {
		return exchangeName;
	}
	public void setExchangeName(String exchangeName) {
		this.exchangeName = exchangeName;
	}
	public String getMarketName() {
		return marketName;
	}
	public void setMarketName(String marketName) {
		this.marketName = marketName;
	}
}

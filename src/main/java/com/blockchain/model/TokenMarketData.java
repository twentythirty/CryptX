package com.blockchain.model;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@javax.persistence.Table(name = "TokenMarketData")
public class TokenMarketData {
	@javax.persistence.Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "Id")
	private int id;

	
	@Column(name = "Volume24_USD", precision = 25, scale = 2)
	private BigDecimal volume24USD;
	
	@Column(name = "MarketCap_USD", precision = 30, scale = 2)
	private BigDecimal marketCapUSD;
	
	@Column(name = "Updated_Date")
	private Timestamp date;
	
	@Column(name = "TokenType")
	private String tokenType;
	
	@Column(name="Invest_Amount")
	private BigDecimal investAmount;
	
	@Column(name = "Execute_Date")
	private Timestamp executeDate;
	
	@Column(name = "Tradable")
	private String tradable ;
	
	

	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "tid")
	
	private CoinIgyToken coinIgyToken;

	
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}
	public String getTradable() {
		return tradable;
	}

	public void setTradable(String tradable) {
		this.tradable = tradable;
	}

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

	public BigDecimal getInvestAmount() {
		return investAmount;
	}

	public void setInvestAmount(BigDecimal investAmount) {
		this.investAmount = investAmount;
	}

	public Timestamp getExecuteDate() {
		return executeDate;
	}

	public void setExecuteDate(Timestamp executeDate) {
		this.executeDate = executeDate;
	}

	public CoinIgyToken getCoinIgyToken() {
		return coinIgyToken;
	}

	public void setCoinIgyToken(CoinIgyToken coinIgyToken) {
		this.coinIgyToken = coinIgyToken;
	}
	
	
}

package com.blockchain.model;

import java.math.BigDecimal;
import java.sql.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

@Entity
@Table(name="Daily_Price_Ticker")
public class PriceTicker {
	
	@Id @GeneratedValue(strategy=GenerationType.AUTO)
	private long id;
	private java.util.Date timestamp;
	@Column(name = "high_trade", precision = 25, scale = 10)
	private BigDecimal high_trade;
	@Column(name = "last_trade", precision = 25, scale = 10)
	private BigDecimal last_trade;
	@Column(name = "low_trade", precision = 25, scale = 10)	
	private BigDecimal low_trade;
	private String market;
	@Column(name = "ask", precision = 25, scale = 10)	
	private BigDecimal ask;
	@Column(name = "bid", precision = 25, scale = 10)	
	private BigDecimal bid;
	@Column(name = "current_volume", precision = 25, scale = 10)
	private BigDecimal current_volume;
	private String exchange;
	
	public BigDecimal getHigh_trade() {
		return high_trade;
	}
	public void setHigh_trade(BigDecimal high_trade) {
		this.high_trade = high_trade;
	}
	public BigDecimal getLast_trade() {
		return last_trade;
	}
	public void setLast_trade(BigDecimal last_trade) {
		this.last_trade = last_trade;
	}
	public BigDecimal getLow_trade() {
		return low_trade;
	}
	public void setLow_trade(BigDecimal low_trade) {
		this.low_trade = low_trade;
	}
	public String getMarket() {
		return market;
	}
	public void setMarket(String market) {
		this.market = market;
	}
	public BigDecimal getAsk() {
		return ask;
	}
	public void setAsk(BigDecimal ask) {
		this.ask = ask;
	}
	public BigDecimal getBid() {
		return bid;
	}
	public void setBid(BigDecimal bid) {
		this.bid = bid;
	}
	public BigDecimal getCurrent_volume() {
		return current_volume;
	}
	public void setCurrent_volume(BigDecimal current_volume) {
		this.current_volume = current_volume;
	}
	public String getExchange() {
		return exchange;
	}
	public void setExchange(String exchange) {
		this.exchange = exchange;
	}
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
	public java.util.Date getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(java.util.Date timestamp) {
		this.timestamp = timestamp;
	}
	
	
}

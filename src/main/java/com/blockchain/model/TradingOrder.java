package com.blockchain.model;

import java.math.BigDecimal;
import java.sql.Date;

import javax.persistence.Column;

@javax.persistence.Entity
@javax.persistence.Table(name = "TradingOrders")
public class TradingOrder {
	@javax.persistence.Id
	@javax.persistence.GeneratedValue(strategy = javax.persistence.GenerationType.AUTO)
	@Column(name = "Id")
	private int id;
	@Column(name = "TokenId")
	private int tokenId;
	@Column(name = "Exchange")
	private String exchange;
	@Column(name = "Rate")
	private BigDecimal rate;
	@Column(name = "Amount")
	private BigDecimal amount;
	@Column(name = "Approved")
	private boolean approved;
	@Column(name = "Execute")
	private boolean execute;
	@Column(name = "orderDate")
	private Date orderDate;
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getTokenId() {
		return tokenId;
	}

	public void setTokenId(int tokenId) {
		this.tokenId = tokenId;
	}

	public String getExchange() {
		return exchange;
	}

	public void setExchange(String exchange) {
		this.exchange = exchange;
	}

	public BigDecimal getRate() {
		return rate;
	}

	public void setRate(BigDecimal rate) {
		this.rate = rate;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public boolean getApproved() {
		return approved;
	}

	public void setApproved(boolean approved) {
		this.approved = approved;
	}

	public boolean getExecute() {
		return execute;
	}

	public void setExecute(boolean execute) {
		this.execute = execute;
	}

	public java.sql.Date getOrderDate() {
		return orderDate;
	}

	public void setOrderDate(Date orderDate) {
		this.orderDate = orderDate;
	}



}

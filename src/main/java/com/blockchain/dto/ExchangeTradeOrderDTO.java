package com.blockchain.dto;

import java.math.BigDecimal;

public class ExchangeTradeOrderDTO {
	private long orderId;
	private String exchangeCode;
	private String tradePair;
	private BigDecimal bid;
	private BigDecimal quantity;
	private String status;
	private String timestamp;
	private long orderTime;
	public long getOrderId() {
		return orderId;
	}

	public void setOrderId(long orderId) {
		this.orderId = orderId;
	}

	public String getExchangeCode() {
		return exchangeCode;
	}

	public void setExchangeCode(String exchangeCode) {
		this.exchangeCode = exchangeCode;
	}

	public String getTradePair() {
		return tradePair;
	}

	public void setTradePair(String tradePair) {
		this.tradePair = tradePair;
	}

	public BigDecimal getQuantity() {
		return quantity;
	}

	public void setQuantity(BigDecimal quantity) {
		this.quantity = quantity;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

	public long getOrderTime() {
		return orderTime;
	}

	public void setOrderTime(long orderTime) {
		this.orderTime = orderTime;
	}

	public BigDecimal getBid() {
		return bid;
	}

	public void setBid(BigDecimal bid) {
		this.bid = bid;
	}
	
	
}

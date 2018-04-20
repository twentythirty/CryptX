package com.blockchain.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class ExchangeTradeOrder {
	private long orderId;
	private String exchangeCode;
	private String tradePair;
	private BigDecimal quantity;
	private String status;
	private Timestamp timestamp;

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

	public Timestamp getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Timestamp timestamp) {
		this.timestamp = timestamp;
	}

}

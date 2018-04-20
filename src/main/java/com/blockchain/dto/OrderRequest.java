package com.blockchain.dto;

import java.math.BigDecimal;

public class OrderRequest {

	private String exchangeCode;
	private String tradePair;
	private String orderType;
	private BigDecimal quantity;
	private BigDecimal limitPrice;
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
	public String getOrderType() {
		return orderType;
	}
	public void setOrderType(String orderType) {
		this.orderType = orderType;
	}
	public BigDecimal getQuantity() {
		return quantity;
	}
	public void setQuantity(BigDecimal quantity) {
		this.quantity = quantity;
	}
	public BigDecimal getLimitPrice() {
		return limitPrice;
	}
	public void setLimitPrice(BigDecimal limitPrice) {
		this.limitPrice = limitPrice;
	}
	
	
}

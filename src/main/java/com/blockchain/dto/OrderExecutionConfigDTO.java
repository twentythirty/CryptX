package com.blockchain.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

import com.blockchain.model.OrderType;

public class OrderExecutionConfigDTO {
	private String baseCoin;
	private OrderType orderType;
	private String exch_code;
	private BigDecimal lot;
	private int timeInterval;
	public int getTimeInterval() {
		return timeInterval;
	}
	public void setTimeInterval(int timeInterval) {
		this.timeInterval = timeInterval;
	}
	public String getBaseCoin() {
		return baseCoin;
	}
	public void setBaseCoin(String baseCoin) {
		this.baseCoin = baseCoin;
	}
	
	public OrderType getOrderType() {
		return orderType;
	}
	public void setOrderType(OrderType orderType) {
		this.orderType = orderType;
	}
	public String getExch_code() {
		return exch_code;
	}
	public void setExch_code(String exch_code) {
		this.exch_code = exch_code;
	}
	public BigDecimal getLot() {
		return lot;
	}
	public void setLot(BigDecimal lot) {
		this.lot = lot;
	}

}

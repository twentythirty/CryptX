package com.blockchain.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "ExchangeOrder")
public class ExchangeTradeOrder {
	@Id
	@Column(name = "OrderId")
	private long orderId;

	@Column(name = "ExchangeCode")
	private String exchangeCode;

	@Column(name = "TradePair")
	private String tradePair;

	@Column(name = "Quantity", precision = 20, scale = 5)
	private BigDecimal quantity;

	@Column(name = "Status")
	private String status;

	@Column(name = "Timestamp")
	private Timestamp timestamp;

	@Column(name = "OrderTime")
	private long orderTime;

	@Column(name = "BidAmount", precision = 20, scale = 4)
	private BigDecimal bidAmount;

	@ManyToOne(cascade = CascadeType.ALL)
	private TradingOrder tradingOrder;

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

	public long getOrderTime() {
		return orderTime;
	}

	public void setOrderTime(long orderTime) {
		this.orderTime = orderTime;
	}

	public BigDecimal getBidAmount() {
		return bidAmount;
	}

	public void setBidAmount(BigDecimal bidAmount) {
		this.bidAmount = bidAmount;
	}

	public TradingOrder getTradingOrder() {
		return tradingOrder;
	}

	public void setTradingOrder(TradingOrder tradingOrder) {
		this.tradingOrder = tradingOrder;
	}

}

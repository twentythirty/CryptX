package com.blockchain.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@javax.persistence.Table(name = "OrderDetail")
public class OrderDetail {
	@javax.persistence.Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "Id")
	private int id;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "orderRunID")
	private OrderRun orderRun;
	
	@Column(name = "CoinId")
	private  String coinTokenId;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "BaseCoinID")
	private BaseCoin baseCoin;
	
	@Column(name = "Amount" , precision = 25, scale = 10)
	private BigDecimal amount;
	
	@Column(name = "Quantity" , precision = 25, scale = 10)
	private BigDecimal quantity;
	
	@Column(name = "contribution", precision = 25, scale = 10)
	private BigDecimal contribution;	
	
	public BigDecimal getContribution() {
		return contribution;
	}

	public void setContribution(BigDecimal contribution) {
		this.contribution = contribution;
	}

	public BigDecimal getQuantity() {
		return quantity;
	}
	
	public void setQuantity(BigDecimal quantity) {
		this.quantity = quantity;
	}

	@Column(name = "Price" , precision = 25, scale = 10)
	private BigDecimal price;
	
	@Column(name = "ExchangeID")
	private String exch_code;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "orderStateId")
	private  OrderState orderState;
	
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public OrderRun getOrderRun() {
		return orderRun;
	}

	public void setOrderRun(OrderRun orderRun) {
		this.orderRun = orderRun;
	}


	public String getCoinTokenId() {
		return coinTokenId;
	}

	public void setCoinTokenId(String coinTokenId) {
		this.coinTokenId = coinTokenId;
	}

	public BaseCoin getBaseCoin() {
		return baseCoin;
	}

	public void setBaseCoin(BaseCoin baseCoin) {
		this.baseCoin = baseCoin;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public String getExch_code() {
		return exch_code;
	}

	public void setExch_code(String exch_code) {
		this.exch_code = exch_code;
	}

	public OrderState getOrderState() {
		return orderState;
	}

	public void setOrderState(OrderState orderState) {
		this.orderState = orderState;
	}
}

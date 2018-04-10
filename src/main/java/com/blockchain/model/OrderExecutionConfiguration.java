package com.blockchain.model;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@javax.persistence.Table(name = "OrderExecutionConfiguration")
public class OrderExecutionConfiguration {
	@javax.persistence.Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "Id")
	private int id;
	
	@Column(name = "BaseCoin")
	private  String baseCoin;
	
	@Column(name = "Lot" , precision = 25, scale = 10)
	private BigDecimal lot;
	
	@Column(name = "Exchange")
	private String exch_code;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "orderTypeId")
	private  OrderType orderType;
	
	@Column(name = "TimeInterval")
	private int timeInterval;
	

	public int getTimeInterval() {
		return timeInterval;
	}

	public void setTimeInterval(int timeInterval) {
		this.timeInterval = timeInterval;
	}

	public void setOrderType(OrderType orderType) {
		this.orderType = orderType;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getBaseCoin() {
		return baseCoin;
	}

	public void setBaseCoin(String baseCoin) {
		this.baseCoin = baseCoin;
	}

	public BigDecimal getLot() {
		return lot;
	}

	public void setLot(BigDecimal lot) {
		this.lot = lot;
	}

	public String getExch_code() {
		return exch_code;
	}

	public void setExch_code(String exch_code) {
		this.exch_code = exch_code;
	}
}

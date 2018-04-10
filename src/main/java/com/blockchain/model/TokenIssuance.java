package com.blockchain.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

@javax.persistence.Entity
@javax.persistence.Table(name = "TokenIssuance")
public class TokenIssuance {
	@javax.persistence.Id
	@javax.persistence.GeneratedValue(strategy = javax.persistence.GenerationType.AUTO)
	@javax.persistence.Column(name = "Id")
	private int id;
	@javax.persistence.Column(name = "date")
	private Timestamp date;
	@javax.persistence.Column(name = "TotalTokens")
	private BigDecimal totalTokens;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Timestamp getDate() {
		return date;
	}

	public void setDate(Timestamp date) {
		this.date = date;
	}

	public BigDecimal getTotalTokens() {
		return totalTokens;
	}

	public void setTotalTokens(BigDecimal totalTokens) {
		this.totalTokens = totalTokens;
	}

}

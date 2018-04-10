package com.blockchain.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Invest {
	private Timestamp startedDate;
	private Timestamp completedDate;
	private BigDecimal amount;
	private String currency;
	private String strategyType;
	private String investmentMode;
	private BigDecimal numberOfShares;
	private int invRunId;
	
	
	
	public int getInvRunId() {
		return invRunId;
	}
	public void setInvRunId(int invRunId) {
		this.invRunId = invRunId;
	}
	public Timestamp getStartedDate() {
		return startedDate;
	}
	public void setStartedDate(Timestamp startedDate) {
		this.startedDate = startedDate;
	}
	public Timestamp getCompletedDate() {
		return completedDate;
	}
	public void setCompletedDate(Timestamp completedDate) {
		this.completedDate = completedDate;
	}
	public BigDecimal getAmount() {
		return amount;
	}
	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}
	public String getCurrency() {
		return currency;
	}
	public void setCurrency(String currency) {
		this.currency = currency;
	}
	public String getStrategyType() {
		return strategyType;
	}
	public void setStrategyType(String strategyType) {
		this.strategyType = strategyType;
	}
	public String getInvestmentMode() {
		return investmentMode;
	}
	public void setInvestmentMode(String investmentMode) {
		this.investmentMode = investmentMode;
	}
	public BigDecimal getNumberOfShares() {
		return numberOfShares;
	}
	public void setNumberOfShares(BigDecimal numberOfShares) {
		this.numberOfShares = numberOfShares;
	}	
}

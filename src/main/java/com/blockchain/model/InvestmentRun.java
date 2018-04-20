package com.blockchain.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@javax.persistence.Table(name = "InvestmentRun")
public class InvestmentRun {
	@javax.persistence.Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "Id")
	private int id;
	
	@Column(name = "StartedDateTime")
	private Timestamp startedDateTime;
	
	@Column(name = "CompletedDateTime")
	private Timestamp completedDateTime;
	
	@Column(name = "LastUpdatedDateTime")
	private Timestamp lastUpdatedDateTime;
	
	@Column(name="Amount")
	private BigDecimal amount;
	
	@Column(name="Currency")
	private String currency;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "StrategyTypeID")
	private StrategyType strategyType;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "InvestmentModeID")
	private  InvestmentMode investmentMode;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "InvWorkflowStateID")
	private InvWorkflowState invWorkflowState;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "userId")
	private  User user;
	
	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	@Column(name="NumberOfShares", precision = 25, scale = 10)
	private BigDecimal numberOfShares;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Timestamp getStartedDateTime() {
		return startedDateTime;
	}

	public void setStartedDateTime(Timestamp startedDateTime) {
		this.startedDateTime = startedDateTime;
	}

	public Timestamp getCompletedDateTime() {
		return completedDateTime;
	}

	public void setCompletedDateTime(Timestamp completedDateTime) {
		this.completedDateTime = completedDateTime;
	}
	
	public Timestamp getLastUpdatedDateTime() {
		return lastUpdatedDateTime;
	}

	public void setLastUpdatedDateTime(Timestamp lastUpdatedDateTime) {
		this.lastUpdatedDateTime = lastUpdatedDateTime;
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

	public StrategyType getStrategyType() {
		return strategyType;
	}

	public void setStrategyType(StrategyType strategyType) {
		this.strategyType = strategyType;
	}

	public InvestmentMode getInvestmentMode() {
		return investmentMode;
	}

	public void setInvestmentMode(InvestmentMode investmentMode) {
		this.investmentMode = investmentMode;
	}

	public InvWorkflowState getInvWorkflowState() {
		return invWorkflowState;
	}

	public void setInvWorkflowState(InvWorkflowState invWorkflowState) {
		this.invWorkflowState = invWorkflowState;
	}

	public BigDecimal getNumberOfShares() {
		return numberOfShares;
	}

	public void setNumberOfShares(BigDecimal numberOfShares) {
		this.numberOfShares = numberOfShares;
	}
	
	
}

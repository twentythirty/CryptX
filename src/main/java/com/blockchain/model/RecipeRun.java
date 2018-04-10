package com.blockchain.model;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@javax.persistence.Table(name = "RecipeRun")
public class RecipeRun {
	@javax.persistence.Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "Id")
	private int id;

	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "invRunID")
	private InvestmentRun investmentRun;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "InvestmentModeID")
	private  InvestmentMode InvestmentMode;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "userId")
	private  User user;
	
	@Column(name = "DateTime")
	private Timestamp dateTime;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public InvestmentRun getInvestmentRun() {
		return investmentRun;
	}

	public void setInvestmentRun(InvestmentRun investmentRun) {
		this.investmentRun = investmentRun;
	}

	public InvestmentMode getInvestmentMode() {
		return InvestmentMode;
	}

	public void setInvestmentMode(InvestmentMode investmentMode) {
		InvestmentMode = investmentMode;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Timestamp getDateTime() {
		return dateTime;
	}

	public void setDateTime(Timestamp dateTime) {
		this.dateTime = dateTime;
	}

	
	
	
}

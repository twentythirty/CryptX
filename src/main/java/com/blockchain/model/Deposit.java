package com.blockchain.model;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@javax.persistence.Table(name = "Deposit")
public class Deposit {
	
	@javax.persistence.Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "Id")
	private int id;
	
	@Column(name = "InvRunID")
	private int invRunID;
	
	@Column(name = "RecipeRunID")
	private int recipeRunID;
	
	@Column(name = "BaseCoin")
	private String baseCoin;
	
	@Column(name = "Amount",precision = 25, scale = 10)
	private BigDecimal amount;
	
	@Column(name = "ExchangeAccountID")
	private String exchangeAccountID;
	
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getInvRunID() {
		return invRunID;
	}

	public void setInvRunID(int invRunID) {
		this.invRunID = invRunID;
	}

	public int getRecipeRunID() {
		return recipeRunID;
	}

	public void setRecipeRunID(int recipeRunID) {
		this.recipeRunID = recipeRunID;
	}

	public String getBaseCoinID() {
		return baseCoin;
	}

	public void setBaseCoinID(String baseCoin) {
		this.baseCoin = baseCoin;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public String getExchangeAccountID() {
		return exchangeAccountID;
	}

	public void setExchangeAccountID(String exchangeAccountID) {
		this.exchangeAccountID = exchangeAccountID;
	}

	
	
	
}

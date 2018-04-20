package com.blockchain.model;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@javax.persistence.Table(name = "OrderRun")
public class OrderRun {
	@javax.persistence.Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "Id")
	private int id;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "invRunID")
	private InvestmentRun investmentRun;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "recipeRunID")
	private  RecipeRun recipeRun;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "investmentModeID")
	private  InvestmentMode investmentMode;
	
	@Column(name = "DateTimeGenerated")
	private Timestamp dateTimeGenerated;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "userId")
	private  User user;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "orderSideId")
	private  OrderSide orderSide;
	
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

	public RecipeRun getRecipeRun() {
		return recipeRun;
	}

	public void setRecipeRun(RecipeRun recipeRun) {
		this.recipeRun = recipeRun;
	}

	public InvestmentMode getInvestmentMode() {
		return investmentMode;
	}

	public void setInvestmentMode(InvestmentMode investmentMode) {
		this.investmentMode = investmentMode;
	}

	public Timestamp getDateTimeGenerated() {
		return dateTimeGenerated;
	}

	public void setDateTimeGenerated(Timestamp dateTimeGenerated) {
		this.dateTimeGenerated = dateTimeGenerated;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public OrderSide getOrderSide() {
		return orderSide;
	}

	public void setOrderSide(OrderSide orderSide) {
		this.orderSide = orderSide;
	}

	

	
}

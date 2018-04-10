package com.blockchain.model;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@javax.persistence.Table(name = "InvestmentApprovals")
public class InvestmentApprovals {
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
	@javax.persistence.JoinColumn(name = "orderRunId")
	private  OrderRun orderRun;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "approvalTypeId")
	private  ApprovalType approvalType;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "userId")
	private  User user;
	
	@Column(name = "DateTime")
	private Timestamp dateTime;
	
	@Column(name = "Rationale")
	private String rationale;

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

	public OrderRun getOrderRun() {
		return orderRun;
	}

	public void setOrderRun(OrderRun orderRun) {
		this.orderRun = orderRun;
	}

	public ApprovalType getApprovalType() {
		return approvalType;
	}

	public void setApprovalType(ApprovalType approvalType) {
		this.approvalType = approvalType;
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

	public String getRationale() {
		return rationale;
	}

	public void setRationale(String rationale) {
		this.rationale = rationale;
	}	

}

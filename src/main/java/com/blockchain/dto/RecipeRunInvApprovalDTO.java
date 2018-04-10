package com.blockchain.dto;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

import com.blockchain.model.InvestmentApprovals;
import com.blockchain.model.InvestmentMode;
import com.blockchain.model.InvestmentRun;
import com.blockchain.model.RecipeRun;
import com.blockchain.model.User;

public class RecipeRunInvApprovalDTO {
	

	private InvestmentRun investmentRun;
	private RecipeRun recipeRun;
	private InvestmentApprovals invApprovals;
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
	public InvestmentApprovals getInvApprovals() {
		return invApprovals;
	}
	public void setInvApprovals(InvestmentApprovals invApprovals) {
		this.invApprovals = invApprovals;
	}
	

	
	

}

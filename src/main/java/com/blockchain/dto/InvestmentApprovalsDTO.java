package com.blockchain.dto;

public class InvestmentApprovalsDTO {
	//private int invId;;
	private String rationale;
	private int recipeRunId;
	
	public int getRecipeRunId() {
		return recipeRunId;
	}
	public void setRecipeRunId(int recipeRunId) {
		this.recipeRunId = recipeRunId;
	}
	/*public int getInvId() {
		return invId;
	}
	public void setInvId(int invId) {
		this.invId = invId;
	}*/
	public String getRationale() {
		return rationale;
	}
	public void setRationale(String rationale) {
		this.rationale = rationale;
	}
}

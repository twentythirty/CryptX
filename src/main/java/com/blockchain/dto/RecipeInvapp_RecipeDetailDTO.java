package com.blockchain.dto;

import java.util.List;

import com.blockchain.model.InvestmentRun;
import com.blockchain.model.RecipeDetail;

public class RecipeInvapp_RecipeDetailDTO {
	
	private RecipeRunInvApprovalDTO recipeRunInvApprovalDTO;
	
	private List<RecipeDetail> recipeDetailList;
	
	
	
	public RecipeRunInvApprovalDTO getRecipeRunInvApprovalDTO() {
		return recipeRunInvApprovalDTO;
	}
	public void setRecipeRunInvApprovalDTO(RecipeRunInvApprovalDTO recipeRunInvApprovalDTO) {
		this.recipeRunInvApprovalDTO = recipeRunInvApprovalDTO;
	}
	public List<RecipeDetail> getRecipeDetailList() {
		return recipeDetailList;
	}
	public void setRecipeDetailList(List<RecipeDetail> recipeDetailList) {
		this.recipeDetailList = recipeDetailList;
	}
	

}

package com.blockchain.dto;

public class OrderApprovalsDTO {
	
	private String rationale;
	private int orderRunId;
	
	
	public String getRationale() {
		return rationale;
	}
	public void setRationale(String rationale) {
		this.rationale = rationale;
	}
	public int getOrderRunId() {
		return orderRunId;
	}
	public void setOrderRunId(int orderRunId) {
		this.orderRunId = orderRunId;
	}
}

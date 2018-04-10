package com.blockchain.dto;

public class WithdrawDTO {
	private int id;
	private String withdrawAddress;
	private String symbol;
	private boolean active;
	private int tokenId;

	public WithdrawDTO() {
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getWithdrawAddress() {
		return withdrawAddress;
	}

	public void setWithdrawAddress(String withdrawAddress) {
		this.withdrawAddress = withdrawAddress;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public int getTokenId() {
		return tokenId;
	}

	public void setTokenId(int tokenId) {
		this.tokenId = tokenId;
	}

	public String getSymbol() {
		return symbol;
	}

	public void setSymbol(String symbol) {
		this.symbol = symbol;
	}
	
}

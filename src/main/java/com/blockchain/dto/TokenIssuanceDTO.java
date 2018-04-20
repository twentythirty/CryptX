package com.blockchain.dto;

import java.math.BigDecimal;

public class TokenIssuanceDTO {
	private BigDecimal issuedToken;
	private java.sql.Timestamp issuedTime;
	private BigDecimal nav;



	public BigDecimal getIssuedToken() {
		return issuedToken;
	}

	public void setIssuedToken(BigDecimal issuedToken) {
		this.issuedToken = issuedToken;
	}

	public java.sql.Timestamp getIssuedTime() {
		return issuedTime;
	}

	public void setIssuedTime(java.sql.Timestamp issuedTime) {
		this.issuedTime = issuedTime;
	}

	public java.math.BigDecimal getNav() {
		return nav;
	}

	public void setNav(java.math.BigDecimal nav) {
		this.nav = nav;
	}
}

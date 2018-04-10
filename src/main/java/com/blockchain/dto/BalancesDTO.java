package com.blockchain.dto;

import java.math.BigDecimal;

public class BalancesDTO {
	private BigDecimal balance_amount_total;
	private BigDecimal btc_balance;
	private BigDecimal balance_amount_avail;
	private String balance_curr_code;
	private BigDecimal last_price;
	private BigDecimal balance_amount_held;

	public BigDecimal getBalance_amount_total() {
		return balance_amount_total;
	}

	public void setBalance_amount_total(BigDecimal balance_amount_total) {
		this.balance_amount_total = balance_amount_total;
	}

	public BigDecimal getBtc_balance() {
		return btc_balance;
	}

	public void setBtc_balance(BigDecimal btc_balance) {
		this.btc_balance = btc_balance;
	}

	public BigDecimal getBalance_amount_avail() {
		return balance_amount_avail;
	}

	public void setBalance_amount_avail(BigDecimal balance_amount_avail) {
		this.balance_amount_avail = balance_amount_avail;
	}

	public String getBalance_curr_code() {
		return balance_curr_code;
	}

	public void setBalance_curr_code(String balance_curr_code) {
		this.balance_curr_code = balance_curr_code;
	}

	public BigDecimal getLast_price() {
		return last_price;
	}

	public void setLast_price(BigDecimal last_price) {
		this.last_price = last_price;
	}

	public BigDecimal getBalance_amount_held() {
		return balance_amount_held;
	}

	public void setBalance_amount_held(BigDecimal balance_amount_held) {
		this.balance_amount_held = balance_amount_held;
	}

}

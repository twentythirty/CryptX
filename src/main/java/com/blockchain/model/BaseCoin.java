package com.blockchain.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * @author faiz
 *
 */
@Entity
@Table(name="BaseCoin")
public class BaseCoin {
	@Id @GeneratedValue(strategy=GenerationType.AUTO)
	@Column(name="Id")
	private long id;
	@Column(name="CurrencyName")
	private String currencyName;
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
	public String getCurrencyName() {
		return currencyName;
	}
	public void setCurrencyName(String currencyName) {
		this.currencyName = currencyName;
	}
	
	
}

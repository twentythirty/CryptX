package com.blockchain.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@javax.persistence.Table(name = "Account")
public class Account {
	@javax.persistence.Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "Id")
	private int id;

	@Column(name="auth_id")
	private int auth_id;
	
	@Column(name="exch_id")
	private long exch_id;
	
	@Column(name="exch_name")
	private String exch_name;
	
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getAuth_id() {
		return auth_id;
	}

	public void setAuth_id(int auth_id) {
		this.auth_id = auth_id;
	}

	public long getExch_id() {
		return exch_id;
	}

	public void setExch_id(long exch_id) {
		this.exch_id = exch_id;
	}

	public String getExch_name() {
		return exch_name;
	}

	public void setExch_name(String exch_name) {
		this.exch_name = exch_name;
	}

	
	
	
}

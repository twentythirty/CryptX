package com.blockchain.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@javax.persistence.Table(name = "Exchange")
public class Exchange {

	@javax.persistence.Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "Id")
	private int id;

	@Column(name="exch_id")
	private int exch_id;
	
	public int getExch_id() {
		return exch_id;
	}
	public void setExch_id(int exch_id) {
		this.exch_id = exch_id;
	}
	@Column(name="Name")
	private String exch_name;
	@Column(name="Code")
	private String exch_code;
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getExch_name() {
		return exch_name;
	}
	public void setExch_name(String exch_name) {
		this.exch_name = exch_name;
	}
	public String getExch_code() {
		return exch_code;
	}
	public void setExch_code(String exch_code) {
		this.exch_code = exch_code;
	}
	
	
}

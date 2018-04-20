package com.blockchain.dto;

public class MarketPairDTO {
	private long exch_id;
	private String exch_name;
	private String exch_code;
	private long mkt_id;
	private String mkt_name;
	private long exchmkt_id;
	public long getExchmkt_id() {
		return exchmkt_id;
	}
	public void setExchmkt_id(long exchmkt_id) {
		this.exchmkt_id = exchmkt_id;
	}
	public String getExch_code() {
		return exch_code;
	}
	public void setExch_code(String exch_code) {
		this.exch_code = exch_code;
	}
	public long getExch_id() {
		return exch_id;
	}
	public void setExch_id(long exch_id) {
		this.exch_id = exch_id;
	}
	public long getMkt_id() {
		return mkt_id;
	}
	public void setMkt_id(long mkt_id) {
		this.mkt_id = mkt_id;
	}
	public String getExch_name() {
		return exch_name;
	}
	public void setExch_name(String exch_name) {
		this.exch_name = exch_name;
	}
	public String getMkt_name() {
		return mkt_name;
	}
	public void setMkt_name(String mkt_name) {
		this.mkt_name = mkt_name;
	}
	
}

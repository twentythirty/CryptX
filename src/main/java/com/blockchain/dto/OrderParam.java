package com.blockchain.dto;

import java.math.BigDecimal;

public class OrderParam {
	 private long auth_id;
    private long exch_id;
    private long mkt_id;
    private long order_type_id;
    private long price_type_id;
    private BigDecimal limit_price;
    private BigDecimal  order_quantity;
    
	public long getAuth_id() {
		return auth_id;
	}
	public void setAuth_id(long auth_id) {
		this.auth_id = auth_id;
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
	public long getOrder_type_id() {
		return order_type_id;
	}
	public void setOrder_type_id(long order_type_id) {
		this.order_type_id = order_type_id;
	}
	public long getPrice_type_id() {
		return price_type_id;
	}
	public void setPrice_type_id(long price_type_id) {
		this.price_type_id = price_type_id;
	}
	public BigDecimal getLimit_price() {
		return limit_price;
	}
	public void setLimit_price(BigDecimal limit_price) {
		this.limit_price = limit_price;
	}
	public BigDecimal getOrder_quantity() {
		return order_quantity;
	}
	public void setOrder_quantity(BigDecimal order_quantity) {
		this.order_quantity = order_quantity;
	}
    
    
}

package com.blockchain.model;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@javax.persistence.Table(name = "RecipeDetail")
public class RecipeDetail {
	@javax.persistence.Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "Id")
	private int id;
	
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "RecipeRunID")
	private  RecipeRun recipeRun;
	
	/*@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "CoinID")
	private  CoinIgyToken token;*/
	@Column(name = "contribution", precision = 25, scale = 10)
	private BigDecimal contribution;
	
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "BaseCoinID")
	private BaseCoin baseCoin;
	
	/*@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "ExchangeID")
	private Exchange exchange;*/
	
	@Column(name = "ExchangeName")
	private String exchangeName;
	
	@Column(name = "CoinName")
	private String coinName;
	
	@Column(name = "Price", precision = 25, scale = 10)
	private BigDecimal price;
	
	@Column(name = "Quantity" , precision = 25, scale = 10)
	private BigDecimal quantity;
	
	public BigDecimal getQuantity() {
		return quantity;
	}
	public void setQuantity(BigDecimal quantity) {
		this.quantity = quantity;
	}
	public String getCoinName() {
		return coinName;
	}
	public void setCoinName(String coinName) {
		this.coinName = coinName;
	}
	public String getExchangeName() {
		return exchangeName;
	}
	public void setExchangeName(String exchangeName) {
		this.exchangeName = exchangeName;
	}
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public RecipeRun getRecipeRun() {
		return recipeRun;
	}
	public void setRecipeRun(RecipeRun recipeRun) {
		this.recipeRun = recipeRun;
	}
	/*public CoinIgyToken getToken() {
		return token;
	}
	public void setToken(CoinIgyToken token) {
		this.token = token;
	}*/
	public BigDecimal getContribution() {
		return contribution;
	}
	public void setContribution(BigDecimal contribution) {
		this.contribution = contribution;
	}
	public BaseCoin getBaseCoin() {
		return baseCoin;
	}
	public void setBaseCoin(BaseCoin baseCoin) {
		this.baseCoin = baseCoin;
	}
	/*public Exchange getExchange() {
		return exchange;
	}
	public void setExchange(Exchange exchange) {
		this.exchange = exchange;
	}*/
	public BigDecimal getPrice() {
		return price;
	}
	public void setPrice(BigDecimal price) {
		this.price = price;
	}
	
	
}

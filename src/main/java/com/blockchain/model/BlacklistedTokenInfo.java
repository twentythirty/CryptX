package com.blockchain.model;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "BlacklistedTokenInfo")
public class BlacklistedTokenInfo {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	private long id;
	@javax.persistence.OneToOne(cascade = { javax.persistence.CascadeType.ALL })
	@javax.persistence.JoinColumn(name = "token_Id")
	private CoinIgyToken ctoken;
	@Column(name = "blacklist_status")
	private boolean blacklistStatus;
	@Column(name = "Valid_From")
	private Timestamp validFrom;
	@Column(name = "Valid_To")
	private Timestamp validTo;
	@Column (name = "comments")
	private String comments;
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
	public CoinIgyToken getCtoken() {
		return ctoken;
	}
	public void setCtoken(CoinIgyToken ctoken) {
		this.ctoken = ctoken;
	}
	public boolean isBlacklistStatus() {
		return blacklistStatus;
	}
	public void setBlacklistStatus(boolean blacklistStatus) {
		this.blacklistStatus = blacklistStatus;
	}
	public Timestamp getValidFrom() {
		return validFrom;
	}
	public void setValidFrom(Timestamp validFrom) {
		this.validFrom = validFrom;
	}
	public Timestamp getValidTo() {
		return validTo;
	}
	public void setValidTo(Timestamp validTo) {
		this.validTo = validTo;
	}
	public String getComments() {
		return comments;
	}
	public void setComments(String comments) {
		this.comments = comments;
	}

}

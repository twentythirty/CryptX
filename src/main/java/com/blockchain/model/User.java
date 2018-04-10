package com.blockchain.model;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import org.hibernate.validator.constraints.NotEmpty;

@Entity
@Table(name = "CRYPTX_USER")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Integer id;
	@NotEmpty
	@Column(name = "SSO_ID", unique = true, nullable = false)
	private String ssoId;
	@NotEmpty
	@Column(name = "PASSWORD", nullable = false)
	private String password;
	@NotEmpty
	@Column(name = "FIRST_NAME", nullable = false)
	private String firstName;
	@NotEmpty
	@Column(name = "LAST_NAME", nullable = false)
	private String lastName;
	@NotEmpty
	@Column(name = "EMAIL", nullable = false)
	private String email;
	@Column(name = "RESET_TOKEN")
	private String resetToken;

	@NotEmpty
	@ManyToMany(fetch = FetchType.LAZY, cascade = { javax.persistence.CascadeType.ALL })
	@JoinTable(name = "CRYPTX_USER_USER_PROFILE", joinColumns = { @javax.persistence.JoinColumn(name = "USER_ID") }, inverseJoinColumns = { @javax.persistence.JoinColumn(name = "USER_PROFILE_ID") })
	private Set<UserProfile> userProfiles = new HashSet<>();

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getSsoId() {
		return ssoId;
	}

	public void setSsoId(String ssoId) {
		this.ssoId = ssoId;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Set<UserProfile> getUserProfiles() {
		return userProfiles;
	}

	public void setUserProfiles(Set<UserProfile> userProfiles) {
		this.userProfiles = userProfiles;
	}

	public String getResetToken() {
		return resetToken;
	}

	public void setResetToken(String resetToken) {
		this.resetToken = resetToken;
	}

}

package com.blockchain.dto;

import com.blockchain.model.UserProfile;

public class UserDTO {
  private int uid;
  private String firstName;
  private String lastName;
  private String email;
  private String password;
  private boolean adminRole;
  private String resetToken;
  private java.util.HashSet<UserProfile> userProfile;
  
  public UserDTO() {}
  
  public int getUid() { return uid; }
  
  public void setUid(int uid) {
    this.uid = uid;
  }
  
  public String getFirstName() {
    return firstName;
  }
  
  public void setFirstName(String firstName) { this.firstName = firstName; }
  
  public String getLastName() {
    return lastName;
  }
  
  public void setLastName(String lastName) { this.lastName = lastName; }
  
  public String getEmail() {
    return email;
  }
  
  public void setEmail(String email) { this.email = email; }
  
  public String getPassword() {
    return password;
  }
  
  public void setPassword(String password) { this.password = password; }
  
  public boolean isAdminRole() {
    return adminRole;
  }
  
  public void setAdminRole(boolean adminRole) { this.adminRole = adminRole; }
  
  public String getResetToken() {
    return resetToken;
  }
  
  public void setResetToken(String resetToken) { this.resetToken = resetToken; }
  
  public java.util.HashSet<UserProfile> getUserProfile() {
    return userProfile;
  }
  
  public void setUserProfile(java.util.HashSet<UserProfile> userProfile) { this.userProfile = userProfile; }
  
  public boolean equals(Object obj)
  {
    if (obj != null) {
      return email.equals(email);
    }
    return false;
  }
}

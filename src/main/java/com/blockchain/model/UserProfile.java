package com.blockchain.model;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
@javax.persistence.Table(name="CRYPTX_PROFILE")
public class UserProfile implements Serializable
{
  @Id
  @GeneratedValue(strategy=javax.persistence.GenerationType.AUTO)
  private Integer id;
  
  public UserProfile() {}
  
  @Column(name="TYPE", length=15, unique=false, nullable=false)
  private String type = UserProfileType.USER.getUserProfileType();
  
  public Integer getId() {
    return id;
  }
  
  public void setId(Integer id) {
    this.id = id;
  }
  
  public String getType() {
    return type;
  }
  
  public void setType(String type) {
    this.type = type;
  }
  
  public int hashCode()
  {
    int prime = 31;
    int result = 1;
    result = 31 * result + (id == null ? 0 : id.hashCode());
    result = 31 * result + (type == null ? 0 : type.hashCode());
    return result;
  }
  
  public boolean equals(Object obj)
  {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (!(obj instanceof UserProfile))
      return false;
    UserProfile other = (UserProfile)obj;
    if (id == null) {
      if (id != null)
        return false;
    } else if (!id.equals(id))
      return false;
    if (type == null) {
      if (type != null)
        return false;
    } else if (!type.equals(type))
      return false;
    return true;
  }
  
  public String toString()
  {
    return "UserProfile [id=" + id + ", type=" + type + "]";
  }
}

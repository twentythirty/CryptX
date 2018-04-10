package com.blockchain.dao;

import java.util.List;

import com.blockchain.model.User;

public abstract interface UserDao
{
  public abstract User findById(int paramInt);
  
  public abstract User findBySSO(String paramString);
  
  public abstract void save(User paramUser);
  
  public abstract void update(User paramUser);
  
  public abstract void deleteBySSO(String paramString);
  
  public abstract List<User> findAllUsers();
}

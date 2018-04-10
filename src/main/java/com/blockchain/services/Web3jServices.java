package com.blockchain.services;

public abstract interface Web3jServices
{
  public abstract void runSubscription();
  
  public abstract String getClientVersion();
}

package com.blockchain.services;

import java.io.IOException;
import java.math.BigInteger;

import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.Web3ClientVersion;
import org.web3j.protocol.core.methods.response.Web3Sha3;
import org.web3j.tx.Contract;

import com.blockchain.contract.CryptxToken;

@org.springframework.transaction.annotation.Transactional
@org.springframework.stereotype.Repository("web3jServices")
public class Web3jServicesImpl implements Web3jServices
{
  public Web3jServicesImpl() {}
  
  public String getClientVersion()
  {
    Web3j web3j = Web3j.build(new org.web3j.protocol.http.HttpService());
    










    String version = null;
    try {
      String contractAddress = "0x60019238685f6b75f877461d2116c1b2640e8476";
      Credentials credentials = null;
      CryptxToken cryptx = CryptxToken.load(contractAddress, web3j, 
        credentials, Contract.GAS_PRICE, Contract.GAS_LIMIT);
      String hash = (String)((Web3Sha3)web3j.web3Sha3(contractAddress).send()).getResult();
      System.out.println("Hash is " + hash);
      Address deliverable = new Address(hash);
      System.out.println("Address is " + "address");
      try {
        Uint256 uint = new Uint256(new BigInteger("1000"));
        System.out.println(cryptx.setNetAssetValue(uint).get());
        System.out.println();
      } catch (Exception e) {
        System.out.println(e);
      }
      
      Web3ClientVersion web3ClientVersion = (Web3ClientVersion)web3j.web3ClientVersion().send();
      version = web3ClientVersion.getWeb3ClientVersion();
    }
    catch (IOException localIOException) {}
    
    return version;
  }
  
  public void runSubscription() {}
}

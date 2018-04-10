package com.blockchain.codegen;

import java.io.File;
import java.io.IOException;
import java.math.BigInteger;
import java.util.concurrent.Future;

import org.springframework.core.io.ClassPathResource;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.CipherException;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.WalletUtils;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.Contract;

import com.blockchain.contract.CryptxToken;


public class ContractWrapperGenerator
{
  public ContractWrapperGenerator() {}
  
  public void abc()
    throws Throwable
  {
    File folder = new ClassPathResource("wallet").getFile();
    System.out.println("path is " + folder.getPath());
    Web3j web3j = Web3j.build(new HttpService());
    Credentials credentials = null;
    try {
      credentials = WalletUtils.loadCredentials("CryptxTokenWallet2017", folder.getPath() + "\\UTC--2017-07-26T08-38-01.451Z--6a68d55f288808cde43d5314a3db995639c910d7");
    }
    catch (CipherException|IOException e) {
      e.printStackTrace();
    }
    
    CryptxToken cryptx = CryptxToken.load("0x7d246f77b5a10f17d4ccbf0e9752486cf8553b38", web3j, 
      credentials, Contract.GAS_PRICE, Contract.GAS_LIMIT);
    try {
      Uint256 ci = new Uint256(new BigInteger("50000"));
      System.out.println("Nav is " + ((Uint256)cryptx.getNetAssetValue().get()).getValue());
      Future<TransactionReceipt> trans = cryptx.setNetAssetValue(new Uint256(new BigInteger("50")));
      Thread.sleep(30000L);
      System.out.println("Set NAV is done " + trans.isDone());
      System.out.println("before TOtal supply is " + ((Uint256)cryptx.totalSupply().get()).getValue());
      Future<TransactionReceipt> issueTokens = cryptx.mintTokensForAmount(ci);
      Future<Uint256> navV = cryptx.getNetAssetValue();
      System.out.println("Set NAV is done " + issueTokens.isDone());
      System.out.println("nav is " + ((Uint256)navV.get()).getValue());
      if (issueTokens == null) {
        System.out.println("null");
      }
      else {
        TransactionReceipt transs = (TransactionReceipt)issueTokens.get();
        System.out.println("Issued Tokens is " + transs);
        System.out.println("after TOtal supply is " + ((Uint256)cryptx.totalSupply().get()).getValue());
      }
    }
    catch (Exception e)
    {
      System.out.println(e);
    }
  }
  














  public static void main(String[] args)
    throws Throwable
  {
    new ContractWrapperGenerator().abc();
  }
}

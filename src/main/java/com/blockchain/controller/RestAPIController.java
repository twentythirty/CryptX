package com.blockchain.controller;

import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import com.blockchain.dto.CurrentPortfolioDTO;
import com.blockchain.dto.TokenIssuanceDTO;
import com.blockchain.services.DumpServices;

@org.springframework.web.bind.annotation.RestController
@RequestMapping({"/api"})
public class RestAPIController
{
  @Autowired
  DumpServices dumpServices;
  
  public RestAPIController() {}
  
  Logger logger = Logger.getLogger(RestAPIController.class);
  
  @RequestMapping(value={"/tokenIssue"}, method={org.springframework.web.bind.annotation.RequestMethod.GET})
  public ResponseEntity<List<TokenIssuanceDTO>> tokenIssuance(HttpServletResponse resp) { logger.debug("tokenIssuance method execution start ... ");
    List<TokenIssuanceDTO> tokenIssuanceList = dumpServices.getIssueTokenList();
    resp.setContentType("application/json");
    if (tokenIssuanceList.isEmpty()) {
      return new ResponseEntity(HttpStatus.NO_CONTENT);
    }
    logger.debug("tokenIssuance method execution completed ... ");
    return new ResponseEntity(tokenIssuanceList, HttpStatus.OK);
  }
  
  @RequestMapping(value={"/currentPortfolio"}, method={org.springframework.web.bind.annotation.RequestMethod.GET})
  public ResponseEntity<List<CurrentPortfolioDTO>> currentPortfolio(Model model)
  {
    logger.debug("currentPortfolio method execution start ... ");
    List<CurrentPortfolioDTO> currentPortfolio = dumpServices.getCurrentPortfolioList();
    if (currentPortfolio.isEmpty()) {
      return new ResponseEntity(HttpStatus.NO_CONTENT);
    }
    logger.debug("currentPortfolio method execution completed ... ");
    return new ResponseEntity(currentPortfolio, HttpStatus.OK);
  }
}

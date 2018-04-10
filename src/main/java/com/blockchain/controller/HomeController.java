package com.blockchain.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.blockchain.dao.DumpDAO;
import com.blockchain.dto.BitCoinDataDTO;
import com.blockchain.dto.ExchangeTradeOrderDTO;
import com.blockchain.dto.Invest;
import com.blockchain.dto.InvestmentApprovalsDTO;
import com.blockchain.dto.OrderApprovalsDTO;
import com.blockchain.dto.OrderExecutionConfigDTO;
import com.blockchain.dto.RecipeInvapp_RecipeDetailDTO;
import com.blockchain.dto.RecipeRunInvApprovalDTO;
import com.blockchain.dto.TokenDTO;
import com.blockchain.dto.TradingOrderDTO;
import com.blockchain.dto.UserDTO;
import com.blockchain.dto.WithdrawDTO;
import com.blockchain.model.BitCoinData;
import com.blockchain.model.CoinIgyToken;
import com.blockchain.model.Exchange;
import com.blockchain.model.InvestmentApprovals;
import com.blockchain.model.InvestmentRun;
import com.blockchain.model.OrderDetail;
import com.blockchain.model.RecipeDetail;
import com.blockchain.model.RecipeRun;
import com.blockchain.model.TokenMarketData;
import com.blockchain.model.TradingOrder;
import com.blockchain.model.User;
import com.blockchain.services.AdminServices;
import com.blockchain.services.DumpServices;
import com.blockchain.services.ExchangeServices;
import com.blockchain.services.Web3jServices;
import com.blockchain.utils.DateUtils;
import com.cedarsoftware.util.io.JsonWriter;

import javax.servlet.http.HttpServletRequest;

@Controller
public class HomeController {
	private static final String TOKEN_LIST = "tokenList";
	@Autowired
	DumpServices dumpServices;
	@Autowired
	Web3jServices web3jServices;
	@Autowired
	AdminServices adminServices;
	@Autowired
	PasswordEncoder passwordEncoder;
	@Autowired
	ExchangeServices exchangeServices;
	@Autowired
	DumpDAO dumpDAO;

	private static final Logger logger = Logger.getLogger(HomeController.class);

	@RequestMapping(value = { "readApiData" }, method = { org.springframework.web.bind.annotation.RequestMethod.GET })
	public String readApiData(ModelMap map) {
		/*
		 * logger.
		 * debug("readApiData method execution Start to read the data from coinmarketcap..."
		 * ); String msg = dumpServices.readDataFromCionMarketApi(); if (msg !=
		 * null) { BigDecimal amount = dumpServices.walletAmount(); if
		 * (amount.compareTo(BigDecimal.ZERO) > 0) {
		 * dumpServices.addTradingOrders(adminServices.getCoinList(), amount); }
		 * }
		 */

		logger.debug("readApiData method execution completed...");
		return "redirect:homePage";
	}

	@RequestMapping(value = { "/nonApprovedOrder" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	public String showNonApprovedOrder(ModelMap map) {

		logger.debug("showNonApprovedOrder method execution Start to show the non approved orders ");

		List<TradingOrderDTO> orderList = dumpServices.getNonApprovedOrder();

		List<TradingOrderDTO> approvedOrderList = dumpServices.getApprovedOrderListForThisWeek(DateUtils.getMinDate(),
				DateUtils.getMaxDate());
		List<BitCoinData> list = dumpServices.getFilterListByDates();

		BigDecimal walletAmount = dumpServices.walletAmount();

		if (orderList.isEmpty() && approvedOrderList.isEmpty() && !(list.isEmpty())
				&& walletAmount.compareTo(BigDecimal.ZERO) == 0)
			map.put("emptyList", "true");

		else if (list.isEmpty())
			map.put("againRead", "true");

		else if (orderList.isEmpty() && approvedOrderList.isEmpty() && walletAmount.compareTo(BigDecimal.ZERO) > 0)
			map.put("recountRecipe", "true");

		map.put("orderList", orderList);

		logger.debug("showNonApprovedOrder method execution end... ");

		return "nonApprovedOrder";
	}

	@RequestMapping(value = { "/regenerateRecipe" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	public String regenerateRecipe(ModelMap map, RedirectAttributes redir) {
		BigDecimal amount = dumpServices.walletAmount();
		if (amount.compareTo(BigDecimal.ZERO) > 0) {
			String msg = dumpServices.addTradingOrders(adminServices.getCoinList(), amount);
			if (msg == null) {
				redir.addFlashAttribute("already", "true");
			}
		}

		return "redirect:nonApprovedOrder";

	}

	@RequestMapping(value = { "/approvedTradingOrder" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	@ResponseBody
	public String approvedTradingOrder(ModelMap map, @RequestParam("oid") int oid, RedirectAttributes redir) {
		logger.debug("approvedTradingOrder method execution Start... ");
		TradingOrder order = dumpServices.getOrderById(oid);
		order.setApproved(true);
		dumpServices.approvedTradingOrder(order);
		redir.addFlashAttribute("approvedMessage", "Order has been approved");
		logger.debug("approvedTradingOrder method execution completed... ");
		return "update";
	}

	@RequestMapping(value = { "/approvedMultipleOrder" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	@ResponseBody
	public String approvedMultipleOrder(ModelMap map, @RequestParam("orderList[]") List<Integer> orderList) {
		int size = orderList.size();
		for (Integer oid : orderList) {
			TradingOrder order = dumpServices.getOrderById(oid.intValue());
			order.setApproved(true);
			dumpServices.updateTradingOrder(order);
		}
		if (size == 1) {
			return size + " order has been approved";
		} else if (size > 1) {
			return size + " orders has been approved";
		}
		return "update";
	}

	@RequestMapping(value = { "/tokenList" }, method = { org.springframework.web.bind.annotation.RequestMethod.GET })
	public String tokenList(ModelMap map) {
		logger.debug("tokenList method execution Start... ");
		List<TokenDTO> tokenList = dumpServices.getTokens();
		map.put(TOKEN_LIST, tokenList);
		logger.debug("tokenList method execution end... ");
		return TOKEN_LIST;
	}

	@RequestMapping(value = { "/updateTokenForm" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET }, headers = {
					"Accept=application/json,application/xml" })
	@ResponseBody
	public String updateTokenForm(Model model, @RequestParam("tid") long tid) {
		logger.debug("updateTokenForm method execution Start to show the data of a Token in a form... ");
		CoinIgyToken token = dumpServices.getTokenById(tid);
		model.addAttribute("token", token);
		logger.debug("updateTokenForm method execution end... ");
		return JsonWriter.objectToJson(model);
	}

	@RequestMapping(value = { "/updateTokenInformation" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.POST })
	public String updateTokenInformation(ModelMap map, @ModelAttribute("tokenDTO") TokenDTO tokenDTO,
			RedirectAttributes redir) {
		logger.debug("updateTokenForm method execution Start... ");
		dumpServices.updateToken(tokenDTO);
		redir.addFlashAttribute("update", tokenDTO.getTokenName() + " has been updated");
		logger.debug("updateTokenForm method execution completed... ");
		return "redirect:tokenList";
	}

	@RequestMapping(value = { "/withdraw" }, method = { org.springframework.web.bind.annotation.RequestMethod.GET })
	public String withdraw(Model model) {
		logger.debug("withdraw method execution Start... ");
		model.addAttribute("coinList", dumpServices.getBitCoinDataList());
		model.addAttribute("withdrawList", dumpServices.getWithdrawList());
		logger.debug("withdraw method execution end... ");
		return "withdraw";
	}

	@RequestMapping(value = { "/addAddress" }, method = { org.springframework.web.bind.annotation.RequestMethod.POST })
	public String addAddress(@ModelAttribute("withdrawDTO") WithdrawDTO withdrawDTO, RedirectAttributes redir)
			throws JsonGenerationException, JsonMappingException, IOException {
		if (StringUtils.isEmpty(withdrawDTO.getSymbol()) || StringUtils.isEmpty(withdrawDTO.getWithdrawAddress())) {
			redir.addFlashAttribute("empty", "empty");
			return "redirect:withdraw";
		} else if (dumpServices.checkDuplicateAddress(withdrawDTO.getWithdrawAddress()) != null) {
			redir.addFlashAttribute("duplicate", "duplicate");
			return "redirect:withdraw";
		}
		logger.debug("addAddress method execution Start... ");
		dumpServices.addAddress(withdrawDTO.getWithdrawAddress(), withdrawDTO.getSymbol());
		logger.debug("addAddress method execution completed... ");
		redir.addFlashAttribute("addAddress", "address has been added");
		return "redirect:withdraw";
	}

	@RequestMapping(value = { "/checkDuplicateAddress" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	@ResponseBody
	public String checkDuplicateAddress(@RequestParam("withdrawAddress") String withdrawAddress)
			throws JsonGenerationException, JsonMappingException, IOException {
		logger.debug("checkDuplicateAddress method execution start ... ");
		WithdrawDTO withdrawDTO = dumpServices.checkDuplicateAddress(withdrawAddress);
		if (withdrawDTO == null) {
			logger.debug("inside if of checkDuplicateAddress method and complete the execution ... ");
			return new ObjectMapper().writeValueAsString("no");
		}
		logger.debug("inside else of checkDuplicateAddress method and complete the execution ... ");
		return new ObjectMapper().writeValueAsString("yes");
	}

	@RequestMapping(value = { "/showAddressListByCoin" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	@ResponseBody
	public List<WithdrawDTO> showAddressListByCoin(@RequestParam("coinSymbol") String coinSymbol, Model model)
			throws JsonGenerationException, JsonMappingException, IOException {
		logger.debug("showAddressListByCoin method execution start ... ");
		BitCoinDataDTO bitCoin = dumpServices.getCoinBySymbol(coinSymbol);
		logger.debug("showAddressListByCoin method execution end ... ");
		return dumpServices.getWithdrawListByTokenId(bitCoin.getToken().getTid());
	}

	@RequestMapping(value = { "/updateAddress" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.POST })
	@ResponseBody
	public String updateAddress(@RequestParam("withdrawAddress") String withdrawAddress,
			@RequestParam("coinSymbol") String coinSymbol)
			throws JsonGenerationException, JsonMappingException, IOException {
		logger.debug("updateAddress method execution start ... ");
		dumpServices.updateWithdrawAddress(coinSymbol, withdrawAddress);
		logger.debug("updateAddress method execution end ... ");
		return "yes";
	}

	@RequestMapping(value = { "/addUserForm" }, method = { org.springframework.web.bind.annotation.RequestMethod.GET })
	public String addUserForm() {
		return "addUserForm";
	}

	@RequestMapping(value = { "/checkDuplicateEmail" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	@ResponseBody
	public String checkDuplicateEmail(@RequestParam("email") String email, Model model)
			throws JsonGenerationException, JsonMappingException, IOException {
		UserDTO user = dumpServices.getUserByEmail(email);
		if (user == null) {
			return new ObjectMapper().writeValueAsString("no");
		}

		return new ObjectMapper().writeValueAsString("yes");
	}

	@RequestMapping(value = { "/userList" }, method = { org.springframework.web.bind.annotation.RequestMethod.GET })
	public String userList(ModelMap map) {
		List<UserDTO> userList = dumpServices.getUserList();
		String email = dumpServices.getCurrentUser().getEmail();
		UserDTO userDTO = dumpServices.getUserByEmail(email);
		userList.remove(userDTO);
		map.put("userList", userList);
		return "userList";
	}

	@RequestMapping(value = { "/addUser" }, method = { org.springframework.web.bind.annotation.RequestMethod.POST })
	public String addUser(Model model, @ModelAttribute("userDTO") UserDTO userDTO, RedirectAttributes redir) {
		System.out.println(userDTO);
		dumpServices.saveUser(userDTO);
		redir.addFlashAttribute("addUser", "One new user has been added");
		return "redirect:userList";
	}

	@RequestMapping(value = { "/updateUserForm" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET }, headers = {
					"Accept=application/json,application/xml" })
	@ResponseBody
	public String updateUserForm(Model model, @RequestParam("uid") int uid) {
		logger.debug("updateUserForm method execution Start to show the data of a User in a form... ");
		UserDTO user = dumpServices.getUserById(uid);
		model.addAttribute("user", user);
		logger.debug("updateUserForm method execution end... ");
		return JsonWriter.objectToJson(model);
	}

	@RequestMapping(value = { "/updateUserInformation" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.POST })
	public String updateUserInformation(ModelMap map, @ModelAttribute("tokenDTO") UserDTO userDTO,
			RedirectAttributes redir) {
		logger.debug("updateUserForm method execution Start... ");
		dumpServices.updateUser(userDTO);
		redir.addFlashAttribute("update", userDTO.getFirstName() + " profile has been updated");
		logger.debug("updateUserForm method execution completed... ");
		return "redirect:userList";
	}

	@RequestMapping(value = { "/deleteUser" }, method = { org.springframework.web.bind.annotation.RequestMethod.GET })
	@ResponseBody
	public String deleteUser(@RequestParam("uid") int uid, Model model)
			throws JsonGenerationException, JsonMappingException, IOException {
		dumpServices.deleteUser(uid);
		return new ObjectMapper().writeValueAsString("User has been deleted");
	}

	@RequestMapping(value = { "/changePasswordForm" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	public String changePasswordForm(Model model) {
		return "changePasswordForm";
	}

	@RequestMapping(value = { "/changePassword" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.POST })
	public String changePassword(RedirectAttributes redir, @ModelAttribute("userDTO") UserDTO userDTO) {
		UserDTO newUser = dumpServices.getUserByEmail(userDTO.getEmail());
		newUser.setPassword(userDTO.getPassword());
		dumpServices.updateUserInformation(newUser);
		redir.addFlashAttribute("changePassword", "Password has been change");
		return "redirect:changePasswordForm";
	}

	@RequestMapping(value = { "/changeUserPassword" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	public String changeUserPasswordForm(Model model) {
		return "changeUserPassword";
	}

	@RequestMapping(value = { "/validatePassword" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	@ResponseBody
	public String validatePassword(@RequestParam("recentPassword") String recentPassword)
			throws JsonGenerationException, JsonMappingException, IOException {
		String email = dumpServices.getCurrentUser().getEmail();
		UserDTO userDTO = dumpServices.getUserByEmail(email);
		if (passwordEncoder.matches(recentPassword, userDTO.getPassword())) {
			return new ObjectMapper().writeValueAsString("yes");
		}
		return new ObjectMapper().writeValueAsString("no");
	}

	@RequestMapping(value = { "/updateUserPassword" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.POST })
	public String changePassword(@RequestParam("password") String password, RedirectAttributes redir)
			throws JsonGenerationException, JsonMappingException, IOException {
		String email = dumpServices.getCurrentUser().getEmail();
		UserDTO userDTO = dumpServices.getUserByEmail(email);
		userDTO.setPassword(password);
		dumpServices.updateUserInformation(userDTO);
		redir.addFlashAttribute("updatePassword", "Password has been changed");
		return "redirect:changeUserPassword";
	}

	@RequestMapping(value = { "/userTokenList" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	public String userTokenList(Model model) {
		List<TokenDTO> tokenList = dumpServices.getTokens();
		model.addAttribute(TOKEN_LIST, tokenList);
		return "userTokenList";
	}

	@RequestMapping(value = { "/list" }, method = { org.springframework.web.bind.annotation.RequestMethod.GET })
	public String user(ModelMap map) {
		List<UserDTO> userList = dumpServices.getUserList();
		String email = dumpServices.getCurrentUser().getEmail();
		UserDTO userDTO = dumpServices.getUserByEmail(email);
		userList.remove(userDTO);
		System.out.println("List " + userList);
		map.put("userList", userList);
		return "userListForUser";
	}

	@RequestMapping(value = { "/tokenIssue" }, method = { org.springframework.web.bind.annotation.RequestMethod.GET })
	public String issueTokens(ModelMap map) {
		dumpServices.tokenIssue(dumpServices.walletAmount());

		return "redirect:homePage";
	}

	@RequestMapping(value = { "/buy" }, method = { org.springframework.web.bind.annotation.RequestMethod.GET })
	public String buy(ModelMap map) {
		dumpServices.buyCoins();

		return "redirect:homePage";
	}

	@RequestMapping(value = { "/orderList" }, method = { org.springframework.web.bind.annotation.RequestMethod.GET })
	public String successOrdersList(ModelMap map) {
		List<ExchangeTradeOrderDTO> list = exchangeServices.getSuccessOrderList();
		map.put("successOrdersList", list);
		return "orderList";
	}

	@RequestMapping(value = { "/dailyPriceTicker" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	public String dailyPriceTicker(ModelMap map) {
		exchangeServices.getDailyTickerList();
		return "redirect:homePage";
	}

	@RequestMapping(value = { "/recipe" }, method = { org.springframework.web.bind.annotation.RequestMethod.GET })
	public String recipeCalculate(ModelMap map) {
		List<TokenMarketData> marketList = dumpServices.getTokenMarketList();
		System.out.println("List of Market is " + marketList);

		map.put("data", marketList);
		return "recipe";
	}

	/*
	 * @RequestMapping(value = { "/buyrecipe" }, method = {
	 * org.springframework.web.bind.annotation.RequestMethod.GET }) public
	 * String buyRecipe(ModelMap map ) {
	 * System.out.println("======buyRecipe calling========");
	 * List<ExchangeMarket> exchangeMarketList = dumpServices.buyRecipe();
	 * if(!exchangeMarketList.isEmpty()){ map.put("data", exchangeMarketList);
	 * return "buyrecipe"; } else{ return "redirect:homePage"; }
	 * 
	 * }
	 */

	@RequestMapping(value = { "/investmentinfo" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	public String investmentInfo(ModelMap map) {
		List<InvestmentRun> invRunList = dumpServices.getInvestmentRunList();
		map.put("data", invRunList);
		return "investmentinfo";
	}

	@RequestMapping(value = { "/newinvestmentinfo" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	public String newInvestmentInfo(ModelMap map) {
		return "newinvestmentinfo";
	}

	@RequestMapping(value = { "/newInvestInfoSubmit" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.POST })
	public String investmentInfoSubmit(@ModelAttribute("invest") Invest invest, ModelMap model,	HttpServletRequest req) {
		InvestmentRun investrun = dumpServices.newInvestmentRun(invest);
		
		if(investrun != null)
		{
			model.put("investrundata", investrun);
			return "newInvestmentRun";
		}
		else{
			 model.put("investrundata", null);
		     return "newInvestmentRun";
		}
	}
	
	//Need to change url for "Recipe Run" and pass InvestRun Data here
	@RequestMapping(value = { "/createFirstRecipeRunReq" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	public String createFirstRecipeRun(@ModelAttribute("id") int id, ModelMap model, HttpServletRequest req) {
		Map<String, Object> tokenMap = dumpServices.readDataFromCionMarketApi(id);
		Object token = tokenMap.get("list");
		InvestmentRun investRun = (InvestmentRun)tokenMap.get("invRun");
		if (token != null) {
			List<TokenMarketData> tokenList = (List<TokenMarketData>) token;
			if (!tokenList.isEmpty()) {
				model.put("id", tokenMap.get("i_run_id"));
				model.put("data", tokenList);
				model.put("recRunId", tokenMap.get("rec_run_id"));
				model.put("invRun", investRun);
				req.getSession().setAttribute("tokenList", tokenList);
				System.out.println("======id======" + tokenMap.get("i_run_id"));
				return "recipe";
			}
		}
		return "redirect:homePage";
	}
	
	@RequestMapping(value = { "/newRecipeRunReq" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })

	public String newRecipeRun(@ModelAttribute("id") int id, ModelMap model,
			HttpServletRequest req) 
	{
		InvestmentRun investRun = dumpDAO.getInvestmentRunbyId(id);
      
        Map<String, Object> tokenMap = dumpServices.newRecipeRun(investRun.getId());
		Object token = tokenMap.get("list");
		if (token != null) {
			List<TokenMarketData> tokenList = (List<TokenMarketData>) token;
			if (!tokenList.isEmpty()) {
				model.put("id", tokenMap.get("i_run_id"));
				model.put("data", tokenList);
				model.put("invRun", investRun);
				req.getSession().setAttribute("tokenList", tokenList);
				System.out.println("======id======" + tokenMap.get("i_run_id"));
				return "recipe";
			}
		}
		return "redirect:homePage";
	}

	@RequestMapping(value = { "/approveRecipeReq" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.POST })

	public String approveRecipeReq(ModelMap map,@ModelAttribute("investmentApprovalsDTO") InvestmentApprovalsDTO investmentApprovalsDTO,
			RedirectAttributes redir) {

		dumpServices.approveRecipe(investmentApprovalsDTO);
		List<InvestmentRun> invRunList = dumpServices.getInvestmentRunList();
		int recipeRunId = investmentApprovalsDTO.getRecipeRunId();
		map.put("data", invRunList);
		map.put("rec_run_id", recipeRunId);
		return "investmentinfo";
	}
	
	
	@RequestMapping(value = { "/rejectRecipeReq" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.POST })

	public String rejectRecipeReq(ModelMap map,
			@ModelAttribute("investmentApprovalsDTO") InvestmentApprovalsDTO investmentApprovalsDTO,
			RedirectAttributes redir) {
		dumpServices.rejectRecipe(investmentApprovalsDTO);
		List<InvestmentRun> invRunList = dumpServices.getInvestmentRunList();
		int recipeRunId = investmentApprovalsDTO.getRecipeRunId();
		map.put("data", invRunList);
		map.put("rec_run_id", recipeRunId);
		return "investmentinfo";
	}

	@RequestMapping(value = { "/createOrderReq" }, method = {org.springframework.web.bind.annotation.RequestMethod.GET })

	public String createOrderReq(@ModelAttribute("id") int id, ModelMap model, HttpServletRequest req) {
		System.out.println(	"------------------- createOrderReq--------------" +id);
		
		 Map<String, Object> orderMap = dumpServices.createOrder(id);
			Object order = orderMap.get("orderDetailListData");
		
			if (order != null) {
				List<OrderDetail> orderDetailList = (List<OrderDetail>) order;
				if (!orderDetailList.isEmpty()) {
				
					model.put("orderDetial", orderDetailList);
					model.put("orderRun",orderMap.get("orderRunData"));
					/*req.getSession().setAttribute("tokenList", tokenList);
					System.out.println("======id======" + tokenMap.get("i_run_id"));*/
					return "orderDetailPage";
				}
			}
			return "redirect:homePage";
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = { "/getInvestmentWorkflowDetailReq" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })

	public String getInvestmentWorkflowDetail(@ModelAttribute("invest") InvestmentRun invest, ModelMap model,
			HttpServletRequest req) {

		Map<String, Object> invWorkflowMap = dumpServices.getInvestmentWorkflowDetail(invest.getId());
		
		if (invWorkflowMap != null) {
			InvestmentRun investmentRun = (InvestmentRun) invWorkflowMap.get("investmentRun");
			List<RecipeRun> recipeRun = (List<RecipeRun>) invWorkflowMap.get("recipeRunList");
			
			List<List<RecipeDetail>> recipeDetailListAll = (List<List<RecipeDetail>>) invWorkflowMap.get("recipeDetailListAll");
			
			List<InvestmentApprovals> invApprovList = (List<InvestmentApprovals>) invWorkflowMap.get("invApprovList");
			User user = (User) invWorkflowMap.get("user");
			List<RecipeRunInvApprovalDTO> recipeRunInvApprovalDTOList = (List<RecipeRunInvApprovalDTO>) invWorkflowMap.get("recipeRunInvApprovalDTOList");
			List<RecipeInvapp_RecipeDetailDTO> l = (List<RecipeInvapp_RecipeDetailDTO>) invWorkflowMap.get("detailId");
			
			model.put("investmentRunData", investmentRun);
			//System.out.println();
			model.put("recipeRunData", recipeRun);
		/*	model.put("recipeDetailListAllData", recipeDetailListAll);
			model.put("invApprovListData", invApprovList);
			model.put("userData", user);
			model.put("recipeRunInvApprovalDTOList", recipeRunInvApprovalDTOList);*/
			//List <RecipeInvapp_RecipeDetailDTO>l = new ArrayList<>();
			
			model.put("test",l);

			return "investmentWorkflowDetail";
		}
		return "redirect:homePage";
	}
	
	@RequestMapping(value = { "/orderExecutionConfiguration" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.GET })
	public String orderExecutionConfiguration(ModelMap map) {
		List<Exchange> exchangeList = exchangeServices.getAvailableExchangeList();
		map.put("exchangeListData", exchangeList);
		return "orderExecutionConfiguration";
	}
	
	@RequestMapping(value = { "/orderExecutionConfigurationSubmit" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.POST })
	public String orderExecutionConfigurationSubmit(@ModelAttribute("orderExecutionConfig") OrderExecutionConfigDTO orderExecutionConfigDTO, ModelMap model,HttpServletRequest req) {
		
		System.out.println("==========OrderExecutionConfig===========");
		dumpServices.saveOrderExecutionConfig(orderExecutionConfigDTO);
		return "orderExecutionConfiguration";
	}
	
	@RequestMapping(value = { "/approveOrder" }, method = {
			org.springframework.web.bind.annotation.RequestMethod.POST })

	public String approveOrder(ModelMap map,@ModelAttribute("orderApprovalsDTO") OrderApprovalsDTO orderApprovalsDTO,
			RedirectAttributes redir) {

		dumpServices.approveOrder(orderApprovalsDTO);
		/*List<InvestmentRun> invRunList = dumpServices.getInvestmentRunList();
		int orderRunId = orderApprovalsDTO.getOrderRunId();
		map.put("data", invRunList);
		map.put("rec_run_id", recipeRunId);*/
		return "investmentinfo";
	}

}

package com.blockchain.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.blockchain.dto.BitCoinDataDTO;
import com.blockchain.model.PriceTicker;
import com.blockchain.model.User;
import com.blockchain.services.AdminServices;
import com.blockchain.services.DumpServices;
import com.blockchain.utils.EmailUtils;

@Controller
public class LoginController {
	@Autowired
	DumpServices dumpServices;
	@Autowired
	AdminServices adminServices;

	@Autowired
	private BCryptPasswordEncoder bCryptPasswordEncoder;
	
	@RequestMapping(value = { "/" }, method = RequestMethod.GET)
	public ModelAndView welcomePage() {
		ModelAndView model = new ModelAndView();
		model.setViewName("redirect:loginPage");
		return model;
	}

	@RequestMapping(value = { "/homePage" }, method =RequestMethod.GET)
	public ModelAndView homePage(HttpServletRequest req) {
		ModelAndView model = new ModelAndView();
		
		
		HttpSession session = req.getSession();
		session.setAttribute("name", dumpServices.getCurrentUser()
				.getFirstName());
		session.setAttribute("adminRole",
	    Boolean.valueOf(dumpServices.getCurrentUser().isAdminRole()));
		List<PriceTicker> priceTicker = adminServices.getPriceTickerList();
		model.addObject("coinList", priceTicker);
		
		model.setViewName("home");
		return model;
	}

	@RequestMapping(value = { "/403" }, method = RequestMethod.GET)
	public ModelAndView accessDenied403() {
		ModelAndView model = new ModelAndView();
		model.setViewName("403");
		return model;
	}

	@RequestMapping(value = { "/loginPage" }, method = RequestMethod.GET)
	public ModelAndView loginPage(
			@RequestParam(value = "error", required = false) String error,
			@RequestParam(value = "logout", required = false) String logout) {
		ModelAndView model = new ModelAndView();
		if (error != null) {
			model.addObject("error", "Invalid username or password");
		}

		if (logout != null) {
			model.addObject("message", "Logout successfully.");
		}

		model.setViewName("login");
		return model;
	}

	// Display forgotPassword page
	@RequestMapping(value = "/forgotPassword", method = RequestMethod.GET)
	public ModelAndView displayForgotPasswordPage() {
		return new ModelAndView("forgotPassword");
	}
	
	// Process form submission from forgotPassword page
	@RequestMapping(value = "/forgotPassword", method = RequestMethod.POST)
	public ModelAndView processForgotPasswordForm(ModelAndView modelAndView , @RequestParam("email") String email,HttpServletRequest request) {
		User user = dumpServices.findBySSO(email);
		if(user!=null){
			user.setResetToken(UUID.randomUUID().toString());
			dumpServices.updateUser(user);
			String appUrl = request.getScheme() + "://" + request.getServerName();
			String msg="To reset your password, click the link below:\n" + appUrl
					+ "/resetPassword?token=" + user.getResetToken();
			String subject="Password Reset Request";
			EmailUtils.sendMail(user.getEmail(), subject, msg);
			// Add success message to view
			modelAndView.addObject("successMessage", "A password reset link has been sent to " + email);
		}
		else{
			modelAndView.addObject("errorMessage", "We didn't find an account for that e-mail address.");
		}
		modelAndView.setViewName("forgotPassword");
		return modelAndView;

	}
	
	// Display form to reset password
	@RequestMapping(value = "/resetPassword", method = RequestMethod.GET)
	public ModelAndView displayResetPasswordPage(ModelAndView modelAndView, @RequestParam("token") String token) {
		
		User user = dumpServices.findUserByResetToken(token);

		if (user!=null) { // Token found in DB
			modelAndView.addObject("resetToken", token);
		} else { // Token not found in DB
			modelAndView.addObject("errorMessage", "Oops!  This is an invalid password reset link.");
		}

		modelAndView.setViewName("resetPassword");
		return modelAndView;
	}
	// Process reset password form
		@RequestMapping(value = "/resetPassword", method = RequestMethod.POST)
		public ModelAndView setNewPassword(ModelAndView modelAndView, @RequestParam Map<String, String> requestParams, RedirectAttributes redir) {
			System.out.println("map is ----------------- "+requestParams);
			// Find the user associated with the reset token
			User user = dumpServices.findUserByResetToken(requestParams.get("token"));

			// This should always be non-null but we check just in case
			if (user!=null) {
				
				
				// Set new password    
				user.setPassword(bCryptPasswordEncoder.encode(requestParams.get("password")));
	            
				// Set the reset token to null so it cannot be used again
				user.setResetToken(null);

				// Save user
				dumpServices.updateUser(user);

				// In order to set a model attribute on a redirect, we must use
				// RedirectAttributes
				redir.addFlashAttribute("successMessage", "You have successfully reset your password.  You may now login.");

				modelAndView.setViewName("redirect:loginPage");
				return modelAndView;
				
			} else {
				modelAndView.addObject("errorMessage", "Oops!  This is an invalid password reset link.");
				modelAndView.setViewName("resetPassword");	
			}
			
			return modelAndView;
	   }

}

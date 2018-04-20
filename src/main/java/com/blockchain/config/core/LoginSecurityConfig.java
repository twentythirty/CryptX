package com.blockchain.config.core;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationTrustResolver;
import org.springframework.security.authentication.AuthenticationTrustResolverImpl;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.configurers.ExpressionUrlAuthorizationConfigurer;
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.rememberme.PersistentTokenBasedRememberMeServices;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;

@Configuration
@EnableWebSecurity
@EnableAutoConfiguration(exclude={LoginSecurityConfig.class})
public class LoginSecurityConfig extends WebSecurityConfigurerAdapter
{
  @Autowired
  @Qualifier("customUserDetailsService")
  org.springframework.security.core.userdetails.UserDetailsService userDetailsService;
  @Autowired
  PersistentTokenRepository tokenRepository;
  
  public LoginSecurityConfig() {}
  
  @Autowired
  public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception
  {
    auth.userDetailsService(userDetailsService);
    auth.authenticationProvider(authenticationProvider());
  }
  

















  protected void configure(HttpSecurity http)
		  throws Exception {
      ((HttpSecurity)((HttpSecurity)((HttpSecurity)
    		  ((FormLoginConfigurer)((FormLoginConfigurer)
    				  ((HttpSecurity)
    						  ((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl)((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl)
    								  ((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl)((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl)
    										  ((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl)((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl)
    												  ((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl)((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl)
    														  ((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl)((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl) 
    																  http.authorizeRequests().antMatchers(new String[] {
          "/nonApprovedOrder"
      })).hasAnyRole(new String[] {
          "ADMIN"
      }).antMatchers(new String[] {
          "/tokenList"
      })).hasRole("ADMIN").antMatchers(new String[] {
          "/withdraw"
      })).hasRole("ADMIN").antMatchers(new String[] {
          "/addUserForm"
      })).hasRole("ADMIN").antMatchers(new String[] {
          "/changePasswordForm"
      })).hasRole("ADMIN").antMatchers(new String[] {
          "/userList"
      })).hasRole("ADMIN").antMatchers(new String[] {
          "/userTokenList"
      })).hasAnyRole(new String[] {
          "USER",
          "ADMIN"
      }).antMatchers(new String[] {
          "/list"
      })).hasAnyRole(new String[] {
          "USER",
          "ADMIN"
      }).antMatchers(new String[] {
          "/changeUserPassword"
      })).hasAnyRole(new String[] {
          "USER",
          "ADMIN"
      }).antMatchers(new String[] {
          "/homePage"
      })).hasAnyRole(new String[] {
          "ADMIN",
          "USER"
      }).and()).formLogin().loginPage("/loginPage").defaultSuccessUrl("/homePage")).failureUrl("/loginPage?error")).usernameParameter("username").passwordParameter("password").and()).logout().logoutSuccessUrl("/loginPage?logout").and()).exceptionHandling().accessDeniedPage("/403").and()).csrf().disable();
  }  
  @Bean
  public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
    authenticationProvider.setUserDetailsService(userDetailsService);
    authenticationProvider.setPasswordEncoder(passwordEncoder());
    return authenticationProvider;
  }
  
  @Bean
  public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
  
  @Bean
  public PersistentTokenBasedRememberMeServices getPersistentTokenBasedRememberMeServices() {
    PersistentTokenBasedRememberMeServices tokenBasedservice = new PersistentTokenBasedRememberMeServices(
      "remember-me", userDetailsService, tokenRepository);
    return tokenBasedservice;
  }
  
  @Bean
  public AuthenticationTrustResolver getAuthenticationTrustResolver() { return new AuthenticationTrustResolverImpl(); }
}

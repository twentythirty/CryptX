package com.blockchain.config.core;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blockchain.model.UserProfile;
import com.blockchain.services.DumpServices;




@Service("customUserDetailsService")
public class CustomUserDetailsService
  implements UserDetailsService
{
  static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);
  @Autowired
  private DumpServices dumpServices;
  
  public CustomUserDetailsService() {}
  
  @Transactional(readOnly=true)
  public UserDetails loadUserByUsername(String ssoId) throws UsernameNotFoundException {
    com.blockchain.model.User user = dumpServices.findBySSO(ssoId);
    logger.info("User : {}", user);
    if (user == null) {
      logger.info("User not found");
      throw new UsernameNotFoundException("Username not found");
    }
    return new org.springframework.security.core.userdetails.User(user.getSsoId(), user.getPassword(), 
      true, true, true, true, getGrantedAuthorities(user));
  }
  
  private List<GrantedAuthority> getGrantedAuthorities(com.blockchain.model.User user)
  {
    List<GrantedAuthority> authorities = new ArrayList();
    
    for (UserProfile userProfile : user.getUserProfiles()) {
      logger.info("UserProfile : {}", userProfile);
      authorities.add(new SimpleGrantedAuthority("ROLE_" + userProfile.getType()));
    }
    logger.info("authorities : {}", authorities);
    return authorities;
  }
}

package com.blockchain.config.core;

import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;







public class BlockchainInitilizer
  extends AbstractAnnotationConfigDispatcherServletInitializer
{
  public BlockchainInitilizer() {}
  
  protected Class<?>[] getRootConfigClasses()
  {
    return new Class[] { LoginApplicationConfig.class };
  }
  
  protected Class<?>[] getServletConfigClasses()
  {
    return null;
  }
  
  protected String[] getServletMappings()
  {
    return new String[] { "/" };
  }
}

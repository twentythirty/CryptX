package com.blockchain.config.core;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewResolverRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.tiles3.TilesConfigurer;
import org.springframework.web.servlet.view.tiles3.TilesViewResolver;

import com.blockchain.controller.ScheduleController;
import com.blockchain.config.core.LoginSecurityConfig;

@EnableWebMvc
@Configuration
@EnableScheduling
@org.springframework.context.annotation.ComponentScan({"com.blockchain.*"})
@Import({LoginSecurityConfig.class})
public class LoginApplicationConfig extends WebMvcConfigurerAdapter
{
  public LoginApplicationConfig() {}
  
  @Autowired
  @Bean
  public TilesConfigurer tilesConfigurer()
  {
    TilesConfigurer tilesConfigurer = new TilesConfigurer();
    tilesConfigurer.setDefinitions(new String[] { "/WEB-INF/tiles.xml" });
    tilesConfigurer.setCheckRefresh(true);
    return tilesConfigurer;
  }
  
  @Bean
  public ScheduleController scheduleController() {
    System.out.println("schedule inject");
    return new ScheduleController();
  }
  



  public void configureViewResolvers(ViewResolverRegistry registry)
  {
    TilesViewResolver viewResolver = new TilesViewResolver();
    registry.viewResolver(viewResolver);
  }
  




  public void addResourceHandlers(ResourceHandlerRegistry registry)
  {
    registry.addResourceHandler(new String[] { "/static/**" }).addResourceLocations(new String[] { "/static/" });
    registry.addResourceHandler(new String[] { "/image/**" }).addResourceLocations(new String[] { "/image/" });
  }
}

package com.blockchain.dao;

import java.util.List;

import org.hibernate.Criteria;
import org.hibernate.Hibernate;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import com.blockchain.model.User;

@Repository("userDao")
public class UserDaoImpl
  extends AbstractDao<Integer, User> implements UserDao
{
  
  static final Logger logger = LoggerFactory.getLogger(UserDaoImpl.class);
  
  public User findById(int id) {
    User user = (User)getByKey(Integer.valueOf(id));
    if (user != null) {
      Hibernate.initialize(user.getUserProfiles());
    }
    return user;
  }
  
  public User findBySSO(String sso) {
    logger.info("SSO : {}", sso);
    Criteria crit = createEntityCriteria();
    crit.add(Restrictions.eq("ssoId", sso));
    User user = (User)crit.uniqueResult();
    if (user != null) {
      Hibernate.initialize(user.getUserProfiles());
    }
    return user;
  }
  
  public List<User> findAllUsers()
  {
    Criteria criteria = createEntityCriteria().addOrder(Order.asc("firstName"));
    criteria.setResultTransformer(Criteria.DISTINCT_ROOT_ENTITY);
    List<User> users = criteria.list();
    






    return users;
  }
  
  public void save(User user) {
    persist(user);
  }
  
  public void deleteBySSO(String sso) {
    Criteria crit = createEntityCriteria();
    crit.add(Restrictions.eq("ssoId", sso));
    User user = (User)crit.uniqueResult();
    delete(user);
  }
  
  public void update(User entity)
  {
    super.update(entity);
  }
}

package com.blockchain.utils;

import java.util.Calendar;

public class DateUtils {
  public DateUtils() {}
  
  public static java.sql.Date getMinDate() { java.sql.Date fromDate = null;
    Calendar c = Calendar.getInstance();
    Calendar cal = Calendar.getInstance();
    if ((cal.get(7) == 1) || (cal.get(7) == 2) || (cal.get(7) == 3))
    {
      c.set(7, 4);
      c.add(5, -7);
      fromDate = new java.sql.Date(c.getTime().getTime());
    }
    else {
      c.set(7, 4);
      fromDate = new java.sql.Date(c.getTime().getTime());
    }
    return fromDate;
  }
  
  public static java.sql.Date getMaxDate() { java.sql.Date toDate = null;
    Calendar c = Calendar.getInstance();
    Calendar cal = Calendar.getInstance();
    if ((cal.get(7) == 1) || (cal.get(7) == 2) || (cal.get(7) == 3))
    {
      c.set(7, 4);
      c.add(5, -1);
      toDate = new java.sql.Date(c.getTime().getTime());
    }
    else {
      c.set(7, 4);
      c.add(5, 6);
      toDate = new java.sql.Date(c.getTime().getTime());
    }
    return toDate;
  }
}

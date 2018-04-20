package com.blockchain.utils;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

public class CustomDateAndTimeDeserialize extends JsonDeserializer<Date>{
	
	Logger logger = Logger.getLogger(CustomDateAndTimeDeserialize.class);		
    private SimpleDateFormat dateFormat = new SimpleDateFormat(
            "yyyy-MM-dd HH:mm:ss");
	@Override
	public Date deserialize(JsonParser p, DeserializationContext ctxt) throws IOException  {
		String str = p.getText().trim();
        try {
            return dateFormat.parse(str);
        } catch (ParseException e) {
        	logger.error("Date Parsing Exception Generate : ", e);
        }
        return ctxt.parseDate(str);
	}
	
}
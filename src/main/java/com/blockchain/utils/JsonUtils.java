package com.blockchain.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URL;
import java.nio.charset.Charset;

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.springframework.stereotype.Service;

@Service
public class JsonUtils {
	public JsonUtils() {
	}

	private static Logger logger = Logger.getLogger(JsonUtils.class);

	public static JSONArray readJsonFromUrl(String url) throws IOException, JSONException {
		logger.debug("readJsonFromUrl method execution Start... ");
		InputStream is = new URL(url).openStream();
		try {
			logger.debug("#### inside try block of readJsonFromUrl method...");
			BufferedReader rd = new BufferedReader(new InputStreamReader(is, Charset.forName("UTF-8")));
			String jsonText = readDataFromReader(rd);
			if ((jsonText.isEmpty()) || (jsonText == null)) {
				return null;
			}
			logger.debug("#### complete try block of readJsonFromUrl method and also return the value...");
			return new JSONArray(jsonText);
		} finally {
			logger.debug("#### inside finally block of readJsonFromUrl method...");
			is.close();
		}
	}

	private static String readDataFromReader(Reader reader) throws IOException {
		logger.debug("readDataFromReader method execution Start... ");
		StringBuilder sb = new StringBuilder();
		int cp;
		while ((cp = reader.read()) != -1) {

			sb.append((char) cp);
		}
		logger.debug("#### readDataFromReader method execution complete ...");
		return sb.toString();
	}
}

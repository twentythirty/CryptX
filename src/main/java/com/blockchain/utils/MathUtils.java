package com.blockchain.utils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class MathUtils {
	private MathUtils() {}
	public static List<BigDecimal> breakByNumber(BigDecimal amount, BigDecimal breakAmount) {
		List<BigDecimal> bigDecimals = new ArrayList<>();
		while (amount.compareTo(BigDecimal.valueOf(0)) != 0) {
			if (amount.compareTo(breakAmount) > 0) {
				bigDecimals.add(breakAmount);
				amount = amount.subtract(breakAmount);
			} else {
				bigDecimals.add(amount);
				amount = amount.subtract(amount);
			}
		}
		return bigDecimals;
	}
}

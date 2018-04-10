package com.blockchain.mapper;

import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import com.blockchain.dto.ExchangeTradeOrderDTO;
import com.blockchain.model.ExchangeTradeOrder;

public class ExchangeMapper {

	public void tradeOrderDtoToModel(ExchangeTradeOrderDTO orderDto, ExchangeTradeOrder order) {
		order.setExchangeCode(orderDto.getExchangeCode());
		order.setOrderId(orderDto.getOrderId());
		order.setQuantity(orderDto.getQuantity());
		order.setStatus(orderDto.getStatus());
		if (orderDto.getTimestamp() != null) {
			SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss:SSS");
			Date parsedTimeStamp;
			try {
				parsedTimeStamp = dateFormat.parse(orderDto.getTimestamp());
				order.setTimestamp(new Timestamp(parsedTimeStamp.getTime()));
			} catch (ParseException e) {
				System.out.println("Exception inside ExchangeMapper in TradeOrderDtoToModel for ParseDate " + e);
			}
		}
		order.setTradePair(orderDto.getTradePair());
		order.setBidAmount(orderDto.getBid());
		order.setOrderTime(orderDto.getOrderTime());
	}

	public void modelToTradeOrderDTO(ExchangeTradeOrder order, ExchangeTradeOrderDTO orderDto) {
		orderDto.setExchangeCode(order.getExchangeCode());
		orderDto.setOrderId(order.getOrderId());
		orderDto.setQuantity(order.getQuantity());
		orderDto.setStatus(order.getStatus());
		orderDto.setTimestamp(order.getTimestamp() + "");
		orderDto.setOrderTime(order.getOrderTime());
		orderDto.setTradePair(order.getTradePair());
		orderDto.setBid(order.getBidAmount());
	}

}

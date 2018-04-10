package com.blockchain.mapper;

import com.blockchain.dto.BitCoinDataDTO;
import com.blockchain.model.BitCoinData;

public class TokenMapper {

	public void tokenMapping(BitCoinDataDTO bitcoinDto , BitCoinData coin){
		bitcoinDto.setId(coin.getToken().getTid());
		bitcoinDto.setCap(coin.getCap());
		bitcoinDto.setDate(coin.getDate());
		bitcoinDto.setName(coin.getToken().getTokenName());
		bitcoinDto.setPrice(coin.getPrice());
		bitcoinDto.setSupply(coin.getSupply());
		bitcoinDto.setVolume(coin.getVolume());
		bitcoinDto.setSymbol(coin.getSymbol());
	}
}

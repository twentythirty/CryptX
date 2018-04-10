package com.blockchain.services;

import java.util.List;

import com.blockchain.dto.BitCoinDataDTO;
import com.blockchain.model.PriceTicker;
import com.blockchain.model.TokenMarketData;

public abstract interface AdminServices {
	public abstract List<BitCoinDataDTO> getCoinList();

	public List<PriceTicker> getPriceTickerList();

	public List<TokenMarketData> getTokenMarketData();
}

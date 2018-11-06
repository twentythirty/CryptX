Feature: View investment run details

    Investment run details page

    Background:

        Given the system has an Investment Manager
        And the system has only WhiteListed Assets
        And the current Asset Capitalization is as follows:
        |	rank	|	asset	|	name	|	capitalization_usd	|	market_share	|	nvt	|
        |	1	|	BTC	|	Bitcoin	|	112885000000	|	52.27779404	|	3048.797	|
        |	2	|	ETH	|	Ethereum	|	21961459511	|	10.17051118	|	5409.137	|
        |	3	|	XRP	|	XRP	|	21094512202	|	9.769021589	|	4518.87	|
        |	4	|	BCH	|	Bitcoin Cash	|	8942269578	|	4.141229895	|	8011.317	|
        |	5	|	EOS	|	EOS	|	5041616395	|	2.334809117	|	4822.148	|
        |	6	|	XLM	|	Stellar	|	4585486626	|	2.123572113	|	4123.702	|
        |	7	|	LTC	|	Litecoin	|	3373660178	|	1.562366496	|	8832.869	|
        |	8	|	USDT	|	Tether	|	2790066057	|	1.292099826	|	6617.143	|
        |	9	|	ADA	|	Cardano	|	2092201126	|	0.968913515	|	5616.535	|
        |	10	|	XMR	|	Monero	|	1869475514	|	0.865767669	|	1190.345	|
        |	11	|	MIOTA	|	IOTA	|	1537919406	|	0.712221631	|	422.793	|
        |	12	|	DASH	|	Dash	|	1490852912	|	0.690424796	|	2436.987	|
        |	13	|	TRX	|	TRON	|	1406681728	|	0.65144451	|	9126.887	|
        |	14	|	BNB	|	Binance Coin	|	1198157178	|	0.554875279	|	632.198	|
        |	15	|	NEO	|	NEO	|	1171597445	|	0.542575274	|	3715.823	|
        |	16	|	ETC	|	Ethereum Classic	|	1154134980	|	0.53448828	|	3455.83	|
        |	17	|	XEM	|	NEM	|	922802501	|	0.427356531	|	8559.777	|
        |	18	|	XTZ	|	Tezos	|	791391439	|	0.366499115	|	5298.355	|
        |	19	|	VET	|	VeChain	|	705880382	|	0.326898324	|	2975.461	|
        |	20	|	DOGE	|	Dogecoin	|	665162927	|	0.308041776	|	6506.053	|
        |	21	|	ZEC	|	Zcash	|	592864691	|	0.274559938	|	7742.078	|
        |	22	|	OMG	|	OmiseGO	|	479593312	|	0.222103141	|	1608.344	|
        |	23	|	BTG	|	Bitcoin Gold	|	436079205	|	0.201951443	|	5123.849	|
        |	24	|	BCN	|	Bytecoin	|	405899746	|	0.187975116	|	9775.48	|
        |	25	|	LSK	|	Lisk	|	368377329	|	0.170598213	|	3802.578	|
        |	26	|	MKR	|	Maker	|	358158473	|	0.165865786	|	9372.667	|
        |	27	|	ONT	|	Ontology	|	351678170	|	0.162864711	|	6697.694	|
        |	28	|	QTUM	|	Qtum	|	344272444	|	0.159435066	|	3223.472	|
        |	29	|	ZRX	|	0x	|	331785556	|	0.153652297	|	8306.846	|
        |	30	|	DCR	|	Decred	|	329144259	|	0.152429093	|	3056.366	|
        |	31	|	BCD	|	Bitcoin Diamond	|	297324731	|	0.137693239	|	7745.137	|
        |	32	|	BTS	|	BitShares	|	289012858	|	0.133843951	|	3512.352	|
        |	33	|	ZIL	|	Zilliqa	|	287497539	|	0.133142195	|	2139.947	|
        |	34	|	NANO	|	Nano	|	286239488	|	0.132559583	|	2628.52	|
        |	35	|	DGB	|	DigiByte	|	263692320	|	0.122117826	|	7189.741	|
        |	36	|	ICX	|	ICON	|	260000961	|	0.120408331	|	2127.249	|
        |	37	|	SC	|	Siacoin	|	258906164	|	0.119901322	|	4442.253	|
        |	38	|	AE	|	Aeternity	|	240814578	|	0.111522978	|	9066.183	|
        |	39	|	STEEM	|	Steem	|	236727116	|	0.109630044	|	4913.534	|
        |	40	|	XVG	|	Verge	|	224917267	|	0.104160818	|	1406.909	|
        |	41	|	WAVES	|	Waves	|	207954373	|	0.096305178	|	7800.838	|
        |	42	|	NPXS	|	Pundi X	|	187598922	|	0.086878421	|	9125.779	|
        |	43	|	BTM	|	Bitmark	|	181572421	|	0.084087505	|	6157.727	|
        |	44	|	ETP	|	Metaverse ETP	|	166494520	|	0.07710482	|	4285.503	|
        |	45	|	BAT	|	Basic Attention Token	|	165755045	|	0.076762363	|	4730.248	|
        |	46	|	ETN	|	Electroneum	|	154220784	|	0.071420764	|	856.437	|
        |	47	|	STRAT	|	Stratis	|	146912392	|	0.068036194	|	2316.212	|
        |	48	|	GNT	|	Golem	|	143244410	|	0.066337525	|	1778.464	|
        |	49	|	REP	|	Augur	|	139885940	|	0.064782193	|	5121.937	|
        |	50	|	HOT	|	Holo	|	128172254	|	0.0593575	|	4719.608	|
        |	51	|	SNT	|	Status	|	127377977	|	0.058989665	|	4169.724	|
        |	52	|	KMD	|	Komodo	|	120362892	|	0.055740928	|	7978.964	|
        |	53	|	CNX	|	Cryptonex	|	119254203	|	0.055227486	|	7046.254	|
        |	54	|	PPT	|	Populous	|	115324742	|	0.053407724	|	5452.188	|
        |	55	|	RDD	|	ReddCoin	|	113845566	|	0.052722707	|	4490.699	|
        |	56	|	WTC	|	Waltonchain	|	112650680	|	0.052169347	|	6558.357	|
        |	57	|	ARDR	|	Ardor	|	111610933	|	0.051687833	|	9193.159	|
        |	58	|	MITH	|	Mithril	|	110275899	|	0.051069569	|	5398.074	|
        |	59	|	KCS	|	KuCoin Shares	|	107871943	|	0.049956279	|	6631.806	|
        |	60	|	IOST	|	IOST	|	107519495	|	0.049793058	|	8765.48	|
        |	61	|	LINK	|	Chainlink	|	107518896	|	0.049792781	|	8631.38	|
        |	62	|	TUSD	|	TrueUSD	|	106782266	|	0.049451642	|	552.289	|
        |	63	|	MOAC	|	MOAC	|	105460391	|	0.048839472	|	6667.683	|
        |	64	|	MAID	|	MaidSafeCoin	|	105237959	|	0.048736462	|	7277.761	|
        |	65	|	XET	|	ETERNAL TOKEN	|	102156410	|	0.047309374	|	3463.674	|
        |	66	|	WAN	|	Wanchain	|	101966364	|	0.047221363	|	8648.391	|
        |	67	|	HC	|	HyperCash	|	101759361	|	0.047125498	|	3506.387	|
        |	68	|	AION	|	Aion	|	90795648	|	0.042048123	|	8859.515	|
        |	69	|	HT	|	Huobi Token	|	87445694	|	0.040496735	|	2720.241	|
        |	70	|	ELF	|	aelf	|	86712454	|	0.040157166	|	1717.467	|
        |	71	|	DROP	|	Dropil	|	83796829	|	0.038806919	|	1982.086	|
        |	72	|	DCN	|	Dentacoin	|	83136694	|	0.038501206	|	1508.333	|
        |	73	|	BNT	|	Bancor	|	82972162	|	0.03842501	|	5202.384	|
        |	74	|	RHOC	|	RChain	|	82083357	|	0.038013398	|	7978.092	|
        |	75	|	MONA	|	MonaCoin	|	81894085	|	0.037925745	|	3156.213	|
        |	76	|	FUN	|	FunFair	|	78550970	|	0.036377524	|	2233.539	|
        |	77	|	ZEN	|	Horizen	|	78345404	|	0.036282325	|	8196.706	|
        |	78	|	QASH	|	QASH	|	77086274	|	0.035699213	|	1029.272	|
        |	79	|	NAS	|	Nebulas	|	76494860	|	0.035425324	|	8707.014	|
        |	80	|	MANA	|	Decentraland	|	76171852	|	0.035275737	|	6660.919	|
        And the system has Instrument Mappings for Binance
        And the current price of BTC is 6800 USD
        And the current price of ETH is 850 USD

    Scenario: view LCI initiated investment run
    
        Given there is a LCI Investment Run created by an Investment Manager
        And the Investment Run was started on Thu, 04 Oct 2018 11:55:35
        And the Investment Run was updated on Thu, 04 Oct 2018 16:55:35
        And the status of the Investment Run is Initiated
        And the Investment Run deposit amounts are as followed: 
            | currency  |  amount  |
            |   USD   |   40000   |
            |   ETH   |    20     |
            |   BTC   |    3      |
        When I log onto CryptX as Investment Manager
        And I fetch the details of the Investment Run
        Then if I look at the Investment Run details
        Then I see data layout:
        | started_timestamp  | updated_timestamp   | completed_timestamp | user_created   | strategy_type   | status|
        | Thu Oct 04 2018 11:55:35  | Thu Oct 04 2018 16:55:35    | -   | Investment Manager  | LCI | Initiated    |
        And if I look at the Investment Run deposit list
        Then I see data layout:
        | currency_name | amount    | value_usd |
        | US Dollars | 40000     | 40000    |
        | Ethereum | 20     | 17000    | 
        | Bitcoin | 3     | 20400    | 
        And if I look at the Investment Run deposit footer
        Then I see data layout:
        | currency_name | amount    | value_usd |
        | 3 Items  | -     | 77400    |
        And if I look at the Asset Mix list
        Then I see data layout:
        | symbol    | long_name | capitalization    | nvt_ratio    | market_share  |
        | BTC   | Bitcoin   |   112885000000 | 3048.797  |  52.27779404  |
        | ETH   | Ethereum   |   21961459511 | 5409.137  |  10.17051118  |
        | XRP	| XRP	|	21094512202	|	4518.87	|	9.769021589	|
        | BCH	| Bitcoin Cash	|	8942269578	|	8011.317	|	4.141229895	|
        | EOS	| EOS	|	5041616395	|	4822.148	|	2.334809117	|
        | XLM	| Stellar	|	4585486626	|	4123.702	|	2.123572113	|
        | LTC	| Litecoin	|	3373660178	|	8832.869	|	1.562366496	|
        | USDT	| Tether	|	2790066057	| 6617.143	|	1.292099826		|
        | ADA	| Cardano	|	2092201126	|	5616.535	|	0.968913515	|
        | XMR	| Monero	|	1869475514	|	1190.345	|	0.865767669	|
        | MIOTA	|	IOTA	|	1537919406	|	422.793	|	0.712221631	|
        | DASH	|	Dash	|	1490852912	|	2436.987	|	0.690424796	|
        | TRX	|	TRON	|	1406681728	|	9126.887	|	0.65144451	|
        | BNB	|	Binance Coin	|	1198157178	|	632.198	|	0.554875279	|
        | NEO	|	NEO	|	1171597445	|	3715.823	|	0.542575274	|
        | ETC	|	Ethereum Classic	|	1154134980	|	3455.83	|	0.53448828	|
        | XEM	|	NEM	|	922802501	|	8559.777	|	0.427356531	|
        | XTZ	|	Tezos	|	791391439	|	5298.355	|	0.366499115	|
        

        And if I look at the Asset Mix footer
        Then I see data layout:
        | symbol    | long_name | capitalization    | nvt_ration    | market_share  |
        | 18 Items  | -   |   194309284776 total | -  |  -  |

    Scenario: view MCI initiated investment run

        Given there is a MCI Investment Run created by an Investment Manager
        And the Investment Run was started on Fri, 05 Oct 2018 11:55:35
        And the Investment Run was updated on Fri, 05 Oct 2018 16:55:35
        And the status of the Investment Run is Initiated
        And the Investment Run deposit amounts are as followed: 
            | currency  |  amount  |
            |   USD   |   25000   |
            |   ETH   |    15     |
            |   BTC   |    1      |
        When I log onto CryptX as Investment Manager
        And I fetch the details of the Investment Run
        Then if I look at the Investment Run details
        Then I see data layout:
        | started_timestamp  | updated_timestamp   | completed_timestamp | user_created   | strategy_type   | status|
        | Fri Oct 05 2018 11:55:35  | Fri Oct 05 2018 16:55:35    | -   | Investment Manager  | MCI | Initiated    |
        And if I look at the Investment Run deposit list
        Then I see data layout:
        | currency_name | amount    | value_usd |
        | US Dollars | 25000     | 25000    |
        | Ethereum | 15     | 12750    | 
        | Bitcoin | 1     | 6800    | 
        And if I look at the Investment Run deposit footer
        Then I see data layout:
        | currency_name | amount    | value_usd |
        | 3 Items  | -     | 44550    |
        And if I look at the Asset Mix list
        Then I see data layout:
        | symbol    | long_name | capitalization    | nvt_ratio    | market_share  |
        | VET	| VeChain	| 705880382	| 2975.461	| 0.326898324	| 
        | DOGE	| Dogecoin	| 665162927	| 6506.053	| 0.308041776	| 
        | ZEC	| Zcash	| 592864691	| 7742.078	| 0.274559938	| 
        | OMG	| OmiseGO	| 479593312	| 1608.344	| 0.222103141	| 
        | BTG	| Bitcoin Gold	| 436079205	| 5123.849	| 0.201951443	| 
        | BCN	| Bytecoin	| 405899746	| 9775.48	| 0.187975116	| 
        | LSK	| Lisk	| 368377329	| 3802.578	| 0.170598213	| 
        | MKR	| Maker	| 358158473	| 9372.667	| 0.165865786	| 
        | ONT	| Ontology	| 351678170	| 6697.694	| 0.162864711	| 
        | QTUM	| Qtum	| 344272444	| 3223.472	| 0.159435066	| 
        | ZRX	| 0x	| 331785556	| 8306.846	| 0.153652297	| 
        | DCR	| Decred	| 329144259	| 3056.366	| 0.152429093	| 
        | BCD	| Bitcoin Diamond	| 297324731	| 7745.137	| 0.137693239	| 
        | BTS	| BitShares	| 289012858	| 3512.352	| 0.133843951	| 
        | ZIL	| Zilliqa	| 287497539	| 2139.947	| 0.133142195	| 
        | NANO	| Nano	| 286239488	| 2628.52	| 0.132559583	| 
        | DGB	| DigiByte	| 263692320	| 7189.741	| 0.122117826	| 
        | ICX	| ICON	| 260000961	| 2127.249	| 0.120408331	| 
        | SC	| Siacoin	| 258906164	| 4442.253	| 0.119901322	| 
        | AE	| Aeternity	| 240814578	| 9066.183	| 0.111522978	| 
        | STEEM	| Steem	| 236727116	| 4913.534	| 0.109630044	| 
        | XVG	| Verge	| 224917267	| 1406.909	| 0.104160818	| 
        | WAVES	| Waves	| 207954373	| 7800.838	| 0.096305178	| 
        | NPXS	| Pundi X	| 187598922	| 9125.779	| 0.086878421	| 
        | BTM	| Bitmark	| 181572421	| 6157.727	| 0.084087505	| 
        | ETP	| Metaverse ETP	| 166494520	| 4285.503	| 0.07710482	| 
        | BAT	| Basic Attention Token	| 165755045	| 4730.248	| 0.076762363	| 
        | ETN	| Electroneum	| 154220784	| 856.437	| 0.071420764	| 
        | STRAT	| Stratis	| 146912392	| 2316.212	| 0.068036194	| 
        | GNT	| Golem	| 143244410	| 1778.464	| 0.066337525	| 
        | REP	| Augur	| 139885940	| 5121.937	| 0.064782193	| 
        | HOT	| Holo	| 128172254	| 4719.608	| 0.0593575	| 
        | SNT	| Status	| 127377977	| 4169.724	| 0.058989665	| 
        | KMD	| Komodo	| 120362892	| 7978.964	| 0.055740928	| 
        | CNX	| Cryptonex	| 119254203	| 7046.254	| 0.055227486	| 
        | PPT	| Populous	| 115324742	| 5452.188	| 0.053407724	| 
        | RDD	| ReddCoin	| 113845566	| 4490.699	| 0.052722707	| 
        | WTC	| Waltonchain	| 112650680	| 6558.357	| 0.052169347	| 
        | ARDR	| Ardor	| 111610933	| 9193.159	| 0.051687833	| 
        | MITH	| Mithril	| 110275899	| 5398.074	| 0.051069569	| 
        | KCS	| KuCoin Shares	| 107871943	| 6631.806	| 0.049956279	| 
        | IOST	| IOST	| 107519495	| 8765.48	| 0.049793058	| 
        | LINK	| Chainlink	| 107518896	| 8631.38	| 0.049792781	| 
        | TUSD	| TrueUSD	| 106782266	| 552.289	| 0.049451642	| 
        | MOAC	| MOAC	| 105460391	| 6667.683	| 0.048839472	| 
        | MAID	| MaidSafeCoin	| 105237959	| 7277.761	| 0.048736462	| 
        | XET	| ETERNAL TOKEN	| 102156410	| 3463.674	| 0.047309374	| 
        | WAN	| Wanchain	| 101966364	| 8648.391	| 0.047221363	| 
        | HC	| HyperCash	| 101759361	| 3506.387	| 0.047125498	| 
        | AION	| Aion	| 90795648	| 8859.515	| 0.042048123	| 
        And if I look at the Asset Mix footer
        Then I see data layout:
        | symbol    | long_name | capitalization    | nvt_ration    | market_share  |
        | 50 Items  | -   |   11603612202 total | -  |  -  |
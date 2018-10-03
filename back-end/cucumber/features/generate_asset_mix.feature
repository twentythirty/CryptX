Feature: Generating an Asset mix

    Asset mix is generated when creating a new investment run.

    Background:

        Given the system has an Investment Manager
        And the system has only WhiteListed Assets
        And the current Asset Capitalization is as follows:
        |	rank	|	asset	|	name	|	capitalization_usd	|	market_share	|
        |	1	|	BTC	|	Bitcoin	|	1.12885E+11	|	52.27779404	|
        |	2	|	ETH	|	Ethereum	|	21961459511	|	10.17051118	|
        |	3	|	XRP	|	XRP	|	21094512202	|	9.769021589	|
        |	4	|	BCH	|	Bitcoin Cash	|	8942269578	|	4.141229895	|
        |	5	|	EOS	|	EOS	|	5041616395	|	2.334809117	|
        |	6	|	XLM	|	Stellar	|	4585486626	|	2.123572113	|
        |	7	|	LTC	|	Litecoin	|	3373660178	|	1.562366496	|
        |	8	|	USDT	|	Tether	|	2790066057	|	1.292099826	|
        |	9	|	ADA	|	Cardano	|	2092201126	|	0.968913515	|
        |	10	|	XMR	|	Monero	|	1869475514	|	0.865767669	|
        |	11	|	MIOTA	|	IOTA	|	1537919406	|	0.712221631	|
        |	12	|	DASH	|	Dash	|	1490852912	|	0.690424796	|
        |	13	|	TRX	|	TRON	|	1406681728	|	0.65144451	|
        |	14	|	BNB	|	Binance Coin	|	1198157178	|	0.554875279	|
        |	15	|	NEO	|	NEO	|	1171597445	|	0.542575274	|
        |	16	|	ETC	|	Ethereum Classic	|	1154134980	|	0.53448828	|
        |	17	|	XEM	|	NEM	|	922802501	|	0.427356531	|
        |	18	|	XTZ	|	Tezos	|	791391439	|	0.366499115	|
        |	19	|	VET	|	VeChain	|	705880382	|	0.326898324	|
        |	20	|	DOGE	|	Dogecoin	|	665162927	|	0.308041776	|
        |	21	|	ZEC	|	Zcash	|	592864691	|	0.274559938	|
        |	22	|	OMG	|	OmiseGO	|	479593312	|	0.222103141	|
        |	23	|	BTG	|	Bitcoin Gold	|	436079205	|	0.201951443	|
        |	24	|	BCN	|	Bytecoin	|	405899746	|	0.187975116	|
        |	25	|	LSK	|	Lisk	|	368377329	|	0.170598213	|
        |	26	|	MKR	|	Maker	|	358158473	|	0.165865786	|
        |	27	|	ONT	|	Ontology	|	351678170	|	0.162864711	|
        |	28	|	QTUM	|	Qtum	|	344272444	|	0.159435066	|
        |	29	|	ZRX	|	0x	|	331785556	|	0.153652297	|
        |	30	|	DCR	|	Decred	|	329144259	|	0.152429093	|
        |	31	|	BCD	|	Bitcoin Diamond	|	297324731	|	0.137693239	|
        |	32	|	BTS	|	BitShares	|	289012858	|	0.133843951	|
        |	33	|	ZIL	|	Zilliqa	|	287497539	|	0.133142195	|
        |	34	|	NANO	|	Nano	|	286239488	|	0.132559583	|
        |	35	|	DGB	|	DigiByte	|	263692320	|	0.122117826	|
        |	36	|	ICX	|	ICON	|	260000961	|	0.120408331	|
        |	37	|	SC	|	Siacoin	|	258906164	|	0.119901322	|
        |	38	|	AE	|	Aeternity	|	240814578	|	0.111522978	|
        |	39	|	STEEM	|	Steem	|	236727116	|	0.109630044	|
        |	40	|	XVG	|	Verge	|	224917267	|	0.104160818	|
        |	41	|	WAVES	|	Waves	|	207954373	|	0.096305178	|
        |	42	|	NPXS	|	Pundi X	|	187598922	|	0.086878421	|
        |	43	|	BTM	|	Bytom	|	181572421	|	0.084087505	|
        |	44	|	ETP	|	Metaverse ETP	|	166494520	|	0.07710482	|
        |	45	|	BAT	|	Basic Attention Token	|	165755045	|	0.076762363	|
        |	46	|	ETN	|	Electroneum	|	154220784	|	0.071420764	|
        |	47	|	STRAT	|	Stratis	|	146912392	|	0.068036194	|
        |	48	|	GNT	|	Golem	|	143244410	|	0.066337525	|
        |	49	|	REP	|	Augur	|	139885940	|	0.064782193	|
        |	50	|	HOT	|	Holo	|	128172254	|	0.0593575	|
        |	51	|	SNT	|	Status	|	127377977	|	0.058989665	|
        |	52	|	KMD	|	Komodo	|	120362892	|	0.055740928	|
        |	53	|	CNX	|	Cryptonex	|	119254203	|	0.055227486	|
        |	54	|	PPT	|	Populous	|	115324742	|	0.053407724	|
        |	55	|	RDD	|	ReddCoin	|	113845566	|	0.052722707	|
        |	56	|	WTC	|	Waltonchain	|	112650680	|	0.052169347	|
        |	57	|	ARDR	|	Ardor	|	111610933	|	0.051687833	|
        |	58	|	MITH	|	Mithril	|	110275899	|	0.051069569	|
        |	59	|	KCS	|	KuCoin Shares	|	107871943	|	0.049956279	|
        |	60	|	IOST	|	IOST	|	107519495	|	0.049793058	|
        |	61	|	LINK	|	Chainlink	|	107518896	|	0.049792781	|
        |	62	|	TUSD	|	TrueUSD	|	106782266	|	0.049451642	|
        |	63	|	MOAC	|	MOAC	|	105460391	|	0.048839472	|
        |	64	|	MAID	|	MaidSafeCoin	|	105237959	|	0.048736462	|
        |	65	|	XET	|	ETERNAL TOKEN	|	102156410	|	0.047309374	|
        |	66	|	WAN	|	Wanchain	|	101966364	|	0.047221363	|
        |	67	|	HC	|	HyperCash	|	101759361	|	0.047125498	|
        |	68	|	AION	|	Aion	|	90795648	|	0.042048123	|
        |	69	|	HT	|	Huobi Token	|	87445694	|	0.040496735	|
        |	70	|	ELF	|	aelf	|	86712454	|	0.040157166	|
        |	71	|	DROP	|	Dropil	|	83796829	|	0.038806919	|
        |	72	|	DCN	|	Dentacoin	|	83136694	|	0.038501206	|
        |	73	|	BNT	|	Bancor	|	82972162	|	0.03842501	|
        |	74	|	RHOC	|	RChain	|	82083357	|	0.038013398	|
        |	75	|	MONA	|	MonaCoin	|	81894085	|	0.037925745	|
        |	76	|	FUN	|	FunFair	|	78550970	|	0.036377524	|
        |	77	|	ZEN	|	Horizen	|	78345404	|	0.036282325	|
        |	78	|	QASH	|	QASH	|	77086274	|	0.035699213	|
        |	79	|	NAS	|	Nebulas	|	76494860	|	0.035425324	|
        |	80	|	MANA	|	Decentraland	|	76171852	|	0.035275737	|





        Scenario Outline: generating a <strategy_type> Asset Mix

            Given the Assets <blacklisted_assets> are Blacklisted
            When I log onto CryptX as Investment Manager
            And I generate a new <strategy_type> strategy Asset Mix
            Then the new Asset Mix is saved to the database
            Then the size of the Asset Mix will be <asset_mix_size>
            And Assets are selected from <list_start> to <list_end> inclusively
            But Blacklisted Assets <blacklisted_assets> will be ignored
            And if <asset> gets Blacklisted
            Then <asset> will remain unchanged in the Asset Mix
            But generating a new <strategy_type> Asset Mix, <asset> will be ignored
            

        Examples:
        | strategy_type | asset_mix_size | blacklisted_assets |  list_start   |  list_end  |  asset  |
        | LCI  | 20  | ADA, MIOTA, XEM  |   BTC   |   BTG   |  NEO  |
        | MCI  | 50  | ADA, MIOTA, ZIL, WAVES, STRAT  |   OMG   |   MONA   |  MAID  |

Feature: View recipe run details

    Recipe run details tables

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
        And the system has Instrument Mappings for Binance
        And the system has Instrument Mappings for Bitfinex
        And the system has Instrument Mappings for OKEx
        And the current Instrument market data is:
        | instrument| exchange  | ask_price     | bid_price     | volume        |
        |	ADA/BTC	|	Binance	|	0.00001205	|	0.00001204	|	10513250	|
        |	ADA/BTC	|	OKEx	|	0.00001225	|	0.00001199	|	10620351	|
        |	ADA/ETH	|	Binance	|	0.00037309	|	0.00037232	|	10513250	|
        |	ADA/ETH	|	Binance	|	0.00037301	|	0.00037239	|	10513345	|
        |	BCH/BTC	|	Binance	|	0.071946	|	0.071893	|	24884.687	|
        |	BCH/BTC	|	Bitfinex	|	0.071959	|	0.071885	|	25423.134	|
        |	BCH/BTC	|	OKEx	|	0.071932	|	0.071901	|	23468.214	|
        |	BCH/ETH	|	Binance	|	0.236512	|	0.2365	|	9543.64	|
        |	BCH/ETH	|	Bitfinex	|	0.236514	|	0.2365499	|	10364.954	|
        |	BCH/ETH	|	OKEx	|	0.236511	|	0.236501	|	9854.654	|
        |	BCN/BTC	|	Binance	|	0.00000025	|	0.00000024	|	188834839	|
        |   BCN/BTC	|	OKEx	|	0.00000026	|	0.00000023	|	189464413	|
        |	BCN/ETH	|	Binance	|	0.00000765	|	0.00000764	|	27648944	|
        |	BNB/BTC	|	Binance	|	0.0015428	|	0.0015417	|	780770.12	|
        |	BNB/ETH	|	Binance	|	0.0232151	|	0.0232031	|	421512	    |
        |	BTC/USD	|	OKEx	|	6221.25	|	6218.99	|	165154355	|
        |	BTC/USDT	|	Binance	|	6303	|	6300	|	7543588.92	|
        |	BTC/USDT	|	Bitfinex	|	6303.95	|	6301.25	|	7543125.92	|
        |	BTC/USDT	|	OKEx	|	6300.11	|	6298.31	|	6985125.123	|
        |	BTG/BTC	|	Binance	|	0.003876	|	0.003871	|	26279.74	|
        |	BTG/BTC	|	Bitfinex	|	0.00387	|	0.003854	|	9078.696579	|
        |	BTG/BTC	|	OKEx	|	0.00397	|	0.003844	|	8078.453512	|
        |	BTG/ETH	|	Binance	|	0.11986	|	0.119231	|	1995.41	|
        |	DASH/BTC	|	Binance	|	0.026692	|	0.02663	|	16412.206	|
        |	DASH/BTC	|	Bitfinex	|	0.027652	|	0.02689	|	12012.207	|
        |	DASH/BTC	|	OKEx	|	0.026554	|	0.02669	|	18742.698	|
        |	DASH/ETH	|	Binance	|	0.122553	|	0.122521	|	215221.32	|
        |	DASH/ETH	|	OKEx	|	0.122568	|	0.122532	|	194521.298	|
        |	EOS/BTC	|	Bitfinex	|	0.0008518	|	0.00085158	|	730971.9258	|
        |	EOS/BTC	|	Binance	|	0.000851	|	0.0008502	|	4263315.93	|
        |	EOS/BTC	|	OKEx	|	0.000828	|	0.0008534	|	6548124.93	|
        |	EOS/ETH	|	Bitfinex	|	0.036542	|	0.036501	|	2330971.9258	|
        |	EOS/ETH	|	Binance	|	0.036598	|	0.036565	|	4512971.21	|
        |	EOS/ETH	|	OKEx	|	0.036555	|	0.036521	|	1855642.28	|
        |	ETC/BTC	|	Bitfinex	|	0.001569	|	0.001565	|	1445261.59	|
        |	ETC/BTC	|	Binance	|	0.001568	|	0.001567	|	1440261.39	|
        |	ETC/BTC	|	OKEx	|	0.001532	|	0.001525	|	1658422.69	|
        |	ETC/ETH	|	Binance	|	0.045123	|	0.045091	|	8524421	|
        |	ETC/ETH	|	OKEx	|	0.045131	|	0.045101	|	6845264	|
        |	ETH/BTC	|	Binance	|	0.0000095	|	0.0000091	|	1656591	|
        |	ETH/BTC	|	Bitfinex	|	0.0000098	|	0.0000096	|	2645451	|
        |	ETH/BTC	|	OKEx	|	0.0000097	|	0.0000096	|	3654234	|
        |	ETH/USD	|	OKEx	|	225.34	|	219.64	|	51541354	|
        |	LSK/BTC	|	Binance	|	0.0004983	|	0.0004971	|	97103.84	|
        |	LSK/BTC	|	OKEx	|	0.0004972	|	0.0004971	|	99845.36	|
        |	LSK/ETH	|	Binance	|	0.015391	|	0.015321	|	8526.83	    |
        |	LSK/ETH	|	OKEx	|	0.015399	|	0.015311	|	7413.31 	|
        |	LTC/BTC	|	Binance	|	0.008306	|	0.008292	|	146420.89	|
        |	LTC/BTC	|	Bitfinex	|	0.0082996	|	0.008295	|	17023.90704	|
        |	LTC/BTC	|	OKEx	|	0.008301	|	0.008299	|	16023.90704	|
        |	LTC/ETH	|	Binance	|	0.25737	|	0.25671	|	5787.039	|
        |	LTC/ETH	|	OKEx	|	0.25756	|	0.25654	|	5423.369	|
        |	MKR/BTC	|	Bitfinex	|	0.0983	|	0.0972	|	854.4	|
        |	MKR/BTC	|	OKEx	|	0.0992	|	0.0970	|	684.22	|
        |	MKR/ETH	|	Bitfinex	|	3.133	|	3.122	|	6797	|
        |	MKR/ETH	|	OKEx	|	3.156	|	3.152	|	5852	|
        |	NEO/BTC	|	Binance	|	0.002613	|	0.002612	|	657237.01	|
        |	NEO/BTC	|	Bitfinex	|	0.002601	|	0.002599	|	745121.01	|
        |	NEO/BTC	|	OKEx	|	0.002624	|	0.002610	|	696737.01	|
        |	NEO/ETH	|	Binance	|	0.013658	|	0.013641	|	95332.12	|
        |	NEO/ETH	|	Bitfinex	|	0.013698	|	0.013672	|	75432.21	|
        |	NEO/ETH	|	OKEx	|	0.013654	|	0.013632	|	85429.97	|
        |	OMG/BTC	|	Binance	|	0.000505	|	0.000503	|	357164.64	|
        |	OMG/BTC	|	Bitfinex	|	0.00050612	|	0.00050489	|	51655.98575	|
        |	OMG/BTC	|	OKEx	|	0.00050606	|	0.00050495	|	42155.98575	|
        |	OMG/ETH	|	Bitfinex	|	0.015728	|	0.01564	|	14616.10634	|
        |	OMG/ETH	|	Binance	|	0.015595	|	0.015594	|	97035.73	|
        |	OMG/ETH	|	OKEx	|	0.015654	|	0.015625	|	56412.4984	|
        |	TRX/BTC	|	Binance	|	0.0000036	|	0.00000359	|	518051336	|
        |	TRX/BTC	|	Bitfinex	|	0.0000035	|	0.00000349	|	518054587	|
        |	TRX/BTC	|	OKEx	|	0.0000037	|	0.00000365	|	518053541	|
        |	TRX/ETH	|	Binance	|	0.0000452	|	0.0000442	|	1255423	|
        |	TRX/ETH	|	Bitfinex	|	0.0000444	|	0.000044	|	1258442	|
        |	TRX/ETH	|	OKEx	|	0.0000465	|	0.0000456	|	954234	|
        |	VET/BTC	|	Binance	|	0.00000192	|	0.00000191	|	366338783	|
        |	VET/BTC	|	Bitfinex	|	0.00000198	|	0.00000194	|	298949632	|
        |	VET/ETH	|	Binance	|	0.00005944	|	0.00005934	|	119724844	|
        |	VET/ETH	|	Bitfinex	|	0.00005932	|	0.00005910	|	156942234	|
        |	XEM/BTC	|	Binance	|	0.00001485	|	0.00001484	|	7844645	|
        |	XEM/BTC	|	OKEx	|	0.00001465	|	0.0000146	|	8952312	|
        |	XEM/ETH	|	Binance	|	0.00023651	|	0.00023642	|	766322	|
        |	XEM/ETH	|	OKEx	|	0.00023633	|	0.00023621	|	1000354	|
        |	XLM/BTC	|	Binance	|	0.00003472	|	0.0000347	|	85715474	|
        |	XLM/BTC	|	Bitfinex	|	0.00003489	|	0.00003463	|	322799.4765	|
        |	XLM/BTC	|	OKEx	|	0.00003472	|	0.00003461	|	56424234.6	|
        |	XLM/ETH	|	Bitfinex	|	0.0010824	|	0.0010716	|	207884.5681	|
        |	XLM/ETH	|	Binance	|	0.00107656	|	0.00107346	|	4093754	|
        |	XLM/ETH	|	OKEx	|	0.00107642	|	0.00107385	|	3542213.36	|
        |	XMR/BTC	|	Binance	|	0.016288	|	0.01626	|	28924.456	|
        |	XMR/BTC	|	Bitfinex	|	0.016277	|	0.01639	|	36442.664	|
        |	XMR/BTC	|	OKEx	|	0.016301	|	0.01685	|	10032.675	|
        |	XMR/ETH	|	Binance	|	0.462312	|	0.462299	|	9533	|
        |	XMR/ETH	|	OKEx	|	0.462365	|	0.462287	|	6855	|
        |	XRP/BTC	|	Binance	|	0.00006586	|	0.00006583	|	32462563	|
        |	XRP/BTC	|	Bitfinex	|	0.0000659	|	0.00006586	|	3462412.512	|
        |	XRP/BTC	|	OKEx	|	0.0000659	|	0.00006588	|	12618619	|
        |	XRP/ETH	|	OKEx	|	0.00204442	|	0.00203366	|	952212	|
        |	XRP/ETH	|	Binance	|	0.00203777	|	0.0020337	|	5387280	|
        |	ZEC/BTC	|	Binance	|	0.018305	|	0.018254	|	8579.157	|
        |	ZEC/BTC	|	Bitfinex	|	0.018325	|	0.018294	|	7846.64	|
        |	ZEC/BTC	|	OKEx	|	0.018318	|	0.018268	|	8002.68	|
        |	ZEC/ETH	|	Binance	|	0.221321	|	0.221301	|	987.644	|
        |	ZEC/ETH	|	OKEx	|	0.221341	|	0.221311	|	754.2	|


    @limit_to_MVP_exchanges
    Scenario: view pending recipe run details of an investment run

        Given the Assets DOGE, USDT, MIOTA, XTZ, BTC, ETH are Blacklisted
        And there is a LCI Investment Run created by an Investment Manager
        And the Investment Run deposit amounts are as followed: 
            | currency  |  amount  |
            |   USD   |   125000   |
            |   ETH   |    540     |
            |   BTC   |    50     |
        And there is a recipe run with status Pending
        And the Recipe Run was created on Thu, 04 Oct 2018 11:55:35
        When I log onto CryptX as Investment Manager
        And I fetch the Recipe Run details
        Then if I look at the Recipe Run details
        Then I see data layout:
        | created_timestamp | user_created    | approval_status | approval_user    | approval_timestamp    | approval_comment  |
        | Thu Oct 04 2018 11:55:35  | Investment Manager    | Pending   |   -   |   -   |      |
        And if I look at the Recipe Run Details list
        Then I see data layout:
        | transaction_asset | quote_asset   | target_exchange   | investment_usd    | investment_btc    | investment_eth    | investment_percentage |
        | BNB	| ETH	| Binance	| 0	| 0	| 123.756567853	| 5	| 
        | ETC	| ETH	| Binance	| 0	| 0	| 123.756567853	| 5	| 
        | TRX	| ETH	| Bitfinex	| 0	| 0	| 123.756567853	| 5	| 
        | XEM	| ETH	| OKEx	| 0	| 0	| 123.756567853	| 5	| 
        | XMR	| ETH	| Binance	| 0	| 0	| 44.973728588	| 1.817023911	| 
        | ADA	| BTC	| Binance	| 0	| 4.482588708	| 0	| 5	| 
        | BCH	| BTC	| OKEx	| 0	| 4.482588708	| 0	| 5	| 
        | BCN	| BTC	| Binance	| 0	| 4.482588708	| 0	| 5	| 
        | BTG	| BTC	| Bitfinex	| 0	| 4.482588708	| 0	| 5	| 
        | EOS	| BTC	| OKEx	| 0	| 4.482588708	| 0	| 5	| 
        | LSK	| BTC	| OKEx	| 0	| 4.482588708	| 0	| 5	| 
        | LTC	| BTC	| Bitfinex	| 0	| 4.482588708	| 0	| 5	| 
        | MKR	| BTC	| Bitfinex	| 0	| 4.482588708	| 0	| 5	| 
        | XLM	| BTC	| Binance	| 0	| 4.482588708	| 0	| 5	| 
        | XRP	| BTC	| Binance	| 0	| 4.482588708	| 0	| 5	| 
        | ZEC	| BTC	| Binance	| 0	| 4.482588708	| 0	| 5	| 
        | NEO	| BTC	| Bitfinex	| 23585.16	| 0.691524211	| 0	| 5	| 
        | DASH	| BTC	| OKEx	| 27887.305	| 0	| 0	| 5	| 
        | OMG	| BTC	| Binance	| 27887.305	| 0	| 0	| 5	| 
        | VET	| BTC	| Binance	| 27887.305	| 0	| 0	| 5	| 
        | XMR	| BTC	| Bitfinex	| 17752.925	| 0	| 0	| 3.182976089	| 

        And if I look at the Recipe Run Details footer
        Then I see data layout:
        | transaction_asset | quote_asset   | target_exchange   | investment_percentage |
        |   20 Assets       |   2 Assets    |   3 Exchanges     |       100%            |

    @limit_to_MVP_exchanges
    Scenario: view approved recipe run details of an investment run

        Given the Assets DOGE, USDT, MIOTA, XTZ, BTC, ETH are Blacklisted
        And there is a LCI Investment Run created by an Investment Manager
        And the Investment Run deposit amounts are as followed: 
            | currency  |  amount  |
            |   USD   |   32000   |
            |   ETH   |    16     |
            |   BTC   |    4     |
        And there is a recipe run with status Pending
        And the Recipe Run was created on Thu, 04 Oct 2018 11:55:35
        But the Recipe Run was approved by Investment Manager on Fri, 05 Oct 2018 09:30:00
        When I log onto CryptX as Investment Manager
        And I fetch the Recipe Run details
        Then if I look at the Recipe Run details
        Then I see data layout:
        | created_timestamp | user_created    | approval_status | approval_user    | approval_timestamp    | approval_comment  |
        | Thu Oct 04 2018 11:55:35  | Investment Manager    | Approved   | Investment Manager   | Fri Oct 05 2018 09:30:00   | I approve.  |
        And if I look at the Recipe Run Details list
        Then I see data layout:
        | transaction_asset | quote_asset   | target_exchange   | investment_usd    | investment_btc    | investment_eth    | investment_percentage |
        | TRX	| ETH	| Bitfinex	| 0	| 0	| 13.42203781	| 5	| 
        | XEM	| ETH	| OKEx	| 2443.604	| 0	| 2.57796219	| 5	| 
        | ADA	| BTC	| Binance	| 0	| 0.486159855	| 0	| 5	| 
        | BCH	| BTC	| OKEx	| 0	| 0.486159855	| 0	| 5	| 
        | BCN	| BTC	| Binance	| 0	| 0.486159855	| 0	| 5	| 
        | BTG	| BTC	| Bitfinex	| 0	| 0.486159855	| 0	| 5	| 
        | EOS	| BTC	| OKEx	| 0	| 0.486159855	| 0	| 5	| 
        | LTC	| BTC	| Bitfinex	| 0	| 0.486159855	| 0	| 5	| 
        | MKR	| BTC	| Bitfinex	| 0	| 0.486159855	| 0	| 5	| 
        | ZEC	| BTC	| Binance	| 0	| 0.486159855	| 0	| 5	| 
        | XRP	| BTC	| Binance	| 2335.698	| 0.110721157	| 0	| 5	| 
        | BNB	| ETH	| Binance	| 3024.522	| 0	| 0	| 5	| 
        | DASH	| BTC	| OKEx	| 3024.522	| 0	| 0	| 5	| 
        | ETC	| ETH	| Binance	| 3024.522	| 0	| 0	| 5	| 
        | LSK	| BTC	| OKEx	| 3024.522	| 0	| 0	| 5	| 
        | NEO	| BTC	| Bitfinex	| 3024.522	| 0	| 0	| 5	| 
        | OMG	| BTC	| Binance	| 3024.522	| 0	| 0	| 5	| 
        | VET	| BTC	| Binance	| 3024.522	| 0	| 0	| 5	| 
        | XLM	| BTC	| Binance	| 3024.522	| 0	| 0	| 5	| 
        | XMR	| BTC	| Bitfinex	| 3024.522	| 0	| 0	| 5	| 

        And if I look at the Recipe Run Details footer
        Then I see data layout:
        | transaction_asset | quote_asset   | target_exchange   | investment_percentage |
        |   20 Assets       |   2 Assets    |   3 Exchanges     |       100%            |
        
        

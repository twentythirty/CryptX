import { fakeAsyncResponse } from "../../utils/testing";
import { Asset } from "../../shared/models/asset";
import { AssetResultData, AssetsAllResponseDetailed } from "./asset.service";


export const AssetServiceStub = {
  getAllAssetsDetailed: () => {
    return fakeAsyncResponse<AssetsAllResponseDetailed>({
      success: true,
      assets: [
        new Asset({
          id: 1978,
          symbol: 'LKY',
          is_cryptocurrency: 'assets.is_cryptocurrency.yes',
          long_name: 'Linkey',
          is_base: 'assets.is_base.no',
          is_deposit: 'assets.is_deposit.no',
          capitalization: '26479963',
          nvt_ratio: '253.3319396726087544',
          market_share: '0.011395714297227607',
          capitalization_updated: '2018-08-29T09:50:16.000Z',
          status: 'assets.status.400'
        }),
        new Asset({
          id: 1979,
          symbol: 'LKY',
          is_cryptocurrency: 'assets.is_cryptocurrency.yes',
          long_name: 'Linkey',
          is_base: 'assets.is_base.no',
          is_deposit: 'assets.is_deposit.no',
          capitalization: '26479963',
          nvt_ratio: '253.3319396726087544',
          market_share: '0.011395714297227607',
          capitalization_updated: '2018-08-29T09:50:16.000Z',
          status: 'assets.status.401'
        }),
      ],
      footer: [
        {
          name: 'is_base',
          value: '2',
          template: 'assets.footer.is_base',
          args: { is_base: '2' }
        },
        {
          name: 'is_deposit',
          value: '1',
          template: 'assets.footer.is_deposit',
          args: { is_deposit: '1' }
        },
      ],
      count: 2
    });
  },

  getHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  },

  getAsset: (assetId: number) => {
    return fakeAsyncResponse<AssetResultData>({
      success: true,
      asset: new Asset({
        id: assetId,
        symbol: 'LKY',
        is_cryptocurrency: 'assets.is_cryptocurrency.yes',
        long_name: 'Linkey',
        is_base: 'assets.is_base.no',
        is_deposit: 'assets.is_deposit.no',
        capitalization: '26479963',
        nvt_ratio: '253.3319396726087544',
        market_share: '0.011395714297227607',
        capitalization_updated: '2018-08-29T09:50:16.000Z',
        status: 'assets.status.400'
      }),
      history: [
        {
          asset_id: 1978,
          timestamp: "2018-08-24T06:42:42.342Z",
          user: {
            id: 7,
            name: "Anatolij Grigorjev",
            email: "anatolij@mediapark.com"
          },
          comment: "me likey linkey",
          type: "assets.status.400"
        },
        {
          asset_id:1978,
          timestamp: "2018-08-24T06:42:29.075Z",
          user: {
            id:7,
            name: "Anatolij Grigorjev",
            email: "anatolij@mediapark.com"
          },
          comment: "me no likey linkey",
          type: "assets.status.401"
        }
      ]
    });
  }
};
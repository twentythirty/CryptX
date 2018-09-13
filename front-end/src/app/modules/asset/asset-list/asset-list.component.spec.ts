import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { extraTestingModules, fakeAsyncResponse, click, newEvent } from '../../../testing/utils';
import * as _ from 'lodash';

import { AssetModule } from '../asset.module';
import { AssetListComponent } from './asset-list.component';
import { AssetService, AssetsAllResponseDetailed } from '../../../services/asset/asset.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Asset } from '../../../shared/models/asset';


const allAssetsDetailedResponse: AssetsAllResponseDetailed = {
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
      status: 'assets.status.400',
      statusCode: 400
    }),
  ],
  footer: [],
  count: 1
};

const AssetServiceStub = {
  getAllAssetsDetailed: () => {
    return fakeAsyncResponse(allAssetsDetailedResponse);
  },

  getHeaderLOV: () => {
    return fakeAsyncResponse([
      { value: 'value 1' },
      { value: 'value 2' },
      { value: 'value 3' },
    ]);
  },

  changeAssetStatus: () => {
    return fakeAsyncResponse({
      success: true
    });
  },
};


describe('AssetListComponent', () => {
  let component: AssetListComponent;
  let fixture: ComponentFixture<AssetListComponent>;
  let authService: AuthService;
  let assetService: AssetService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AssetModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: AssetService, useValue: AssetServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetListComponent);
    component = fixture.componentInstance;
    authService = TestBed.get(AuthService);
    assetService = TestBed.get(AssetService);
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load assets on init', () => {
    AssetServiceStub.getAllAssetsDetailed().subscribe(res => {
      expect(component.assetsDataSource.body).toEqual(res.assets);
      expect(component.assetsDataSource.footer).toEqual(res.footer);
      expect(component.count).toEqual(component.count);
    });
  });

  describe('if user have permissions', () => {
    beforeEach(() => {
      spyOn(authService, 'hasPermissions').and.returnValue(true);
    });


    it('should open rationale modal when press on whitelist, blacklist or degraylist button', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
        click(button);
        fixture.detectChanges();
        const modal = fixture.nativeElement.querySelector('app-rationale-modal');
        expect(modal).not.toBeNull('modal invisible');
      });
    });

    it('should cant blacklist asset if he is not whitelisted', () => {
      const blacklistSpy = spyOn(component, 'blacklist');
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        component.assetsDataSource.body[0].status = 'assets.status.401';
        component.assetsDataSource.body[0].statusCode = 401;
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
        click(button);
        expect(blacklistSpy).not.toHaveBeenCalled();
      });
    });

    it('should can blacklist asset if he is whitelisted and table row get "color-black" class', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        component.assetsDataSource.body[0].status = 'assets.status.400';
        component.assetsDataSource.body[0].statusCode = 400;
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
        click(button);
        fixture.detectChanges();

        const modal = fixture.nativeElement.querySelector('app-rationale-modal');
        const modalTextarea = modal.querySelector('textarea');
        modalTextarea.value = 'test rationale';
        modalTextarea.dispatchEvent(newEvent('input'));
        fixture.detectChanges();

        const modalButton = modal.querySelector('button');
        click(modalButton);

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          const tableRow: HTMLElement = fixture.nativeElement.querySelector('table tbody tr');

          expect(tableRow.classList).toContain('color-black');
        });
      });
    });

    it('should cant whitelist asset if he is whitelisted', () => {
      const whitelistSpy = spyOn(component, 'whitelist');
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        component.assetsDataSource.body[0].status = 'assets.status.400';
        component.assetsDataSource.body[0].statusCode = 400;
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
        click(button);
        expect(whitelistSpy).not.toHaveBeenCalled();
      });
    });

    it('should can whitelist asset if he is blacklisted and table row lose all "color-*" class', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        component.assetsDataSource.body[0].status = 'assets.status.401';
        component.assetsDataSource.body[0].statusCode = 401;
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
        click(button);
        fixture.detectChanges();

        const modal = fixture.nativeElement.querySelector('app-rationale-modal');
        const modalTextarea = modal.querySelector('textarea');
        modalTextarea.value = 'test rationale';
        modalTextarea.dispatchEvent(newEvent('input'));
        fixture.detectChanges();

        const modalButton = modal.querySelector('button');
        click(modalButton);

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          const tableRow: HTMLElement = fixture.nativeElement.querySelector('table tbody tr');

          expect(_.some(tableRow.classList, (item) => /^color\-/.test(item))).toBeFalsy('row have some color-* class');
        });
      });
    });

    it('should can whitelist asset if he is graylisted and table row lose all "color-*" class', () => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        component.assetsDataSource.body[0].status = 'assets.status.402';
        component.assetsDataSource.body[0].statusCode = 402;
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
        click(button);
        fixture.detectChanges();

        const modal = fixture.nativeElement.querySelector('app-rationale-modal');
        const modalTextarea = modal.querySelector('textarea');
        modalTextarea.value = 'test rationale';
        modalTextarea.dispatchEvent(newEvent('input'));
        fixture.detectChanges();

        const modalButton = modal.querySelector('button');
        click(modalButton);

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          const tableRow: HTMLElement = fixture.nativeElement.querySelector('table tbody tr');

          expect(_.some(tableRow.classList, (item) => /^color\-/.test(item))).toBeFalsy('row have some color-* class');
        });
      });
    });

  });

});

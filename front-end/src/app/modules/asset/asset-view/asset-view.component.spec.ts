import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs/observable/of';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { AssetModule } from '../asset.module';
import { AssetViewComponent } from './asset-view.component';
import { AssetService, AssetResultData } from '../../../services/asset/asset.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Asset } from '../../../shared/models/asset';
import permissions from '../../../config/permissions';


const AssetServiceStub = {
  getAsset: () => {
    return fakeAsyncResponse<AssetResultData>({
      success: true,
      asset: new Asset({
        id: 1,
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
      history: [
        {
          asset_id: 1,
          timestamp: '2018-08-24T06:42:42.342Z',
          user: {
            id: 7,
            name: 'Test User',
            email: 'test@domain.com'
          },
          comment: 'comment',
          type: 'assets.status.400'
        },
        {
          asset_id: 1,
          timestamp: '2018-08-24T06:42:29.075Z',
          user: {
            id: 7,
            name: 'Test User',
            email: 'test@domain.com'
          },
          comment: 'comment',
          type: 'assets.status.401'
        }
      ]
    });
  }
};


describe('AssetViewComponent', () => {
  let component: AssetViewComponent;
  let fixture: ComponentFixture<AssetViewComponent>;
  let authService: AuthService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AssetModule,
        ...extraTestingModules
      ],
      providers: [
        { provide: AssetService, useValue: AssetServiceStub },
        {
          provide: ActivatedRoute, useValue: {
            params: of({ assetId: 1 })
          }
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetViewComponent);
    component = fixture.componentInstance;
    authService = TestBed.get(AuthService);
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load asset on init', () => {
    AssetServiceStub.getAsset().subscribe(res => {
      expect(component.assetsDataSource.body).toEqual([res.asset]);
      expect(component.count).toEqual(component.count);
    });
  });

  it('should show activity log', () => {
    expect(fixture.nativeElement.querySelector('app-action-log')).toBeDefined();
  });

  it('should dont see action button if dont have "CHANGE_ASSET_STATUS" permission', () => {
    spyOn(authService, 'getPermissions').and.returnValue([]);
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
      expect(button).toBeNull('action button visible');
    });
  });

  it('should see action button if have "CHANGE_ASSET_STATUS" permission', () => {
    spyOn(authService, 'getPermissions').and.returnValue([permissions.CHANGE_ASSET_STATUS]);
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
      expect(button).not.toBeNull('action button invisible');
    });
  });

  it('should open rationale modal when press on whitelist, blacklist or degraylist button', () => {
    spyOn(authService, 'hasPermissions').and.returnValue(true);
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('table tbody tr app-action-cell label');
      click(button);
      fixture.detectChanges();
      const modal = fixture.nativeElement.querySelector('app-rationale-modal');
      expect(modal).not.toBeNull('modal invisible');
    });
  });
});

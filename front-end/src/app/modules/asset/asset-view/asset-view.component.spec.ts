import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs/observable/of';
import { extraTestingModules } from '../../../utils/testing';

import { AssetModule } from '../asset.module';
import { AssetViewComponent } from './asset-view.component';
import { AssetService } from '../../../services/asset/asset.service';
import { AssetServiceStub } from '../../../services/asset/asset.service.stub';


describe('AssetViewComponent', () => {
  let component: AssetViewComponent;
  let fixture: ComponentFixture<AssetViewComponent>;

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
            params: of({assetId: 1})
          }
        },

      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load asset on init', () => {
    AssetServiceStub.getAsset(1).subscribe(res => {
      expect(component.assetsDataSource.body).toEqual([res.asset]);
      expect(component.count).toEqual(component.count);
    });
  });

});

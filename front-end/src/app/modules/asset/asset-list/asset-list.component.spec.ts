import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules } from '../../../utils/testing';

import { AssetModule } from '../asset.module';
import { AssetListComponent } from './asset-list.component';
import { AssetService } from '../../../services/asset/asset.service';
import { AssetServiceStub } from '../../../services/asset/asset.service.stub';


describe('AssetListComponent', () => {
  let component: AssetListComponent;
  let fixture: ComponentFixture<AssetListComponent>;

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
});

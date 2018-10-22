import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { extraTestingModules, fakeAsyncResponse, click } from '../../../testing/utils';

import { LiquidityModule } from '../liquidity.module';
import { LiquidityListComponent } from './liquidity-list.component';
import { LiquidityService } from '../../../services/liquidity/liquidity.service';
import { testHeaderLov } from '../../../testing/commonTests';
import { getAllLiquiditiesData } from '../../../testing/service-mock/liquidity.service.mock';


describe('LiquidityListComponent', () => {
  let component: LiquidityListComponent;
  let fixture: ComponentFixture<LiquidityListComponent>;
  let location: Location;
  let router: Router;
  let headerLovColumns: Array<string>;
  let button: HTMLElement;
  let liquidityService: LiquidityService;
  let getAllLiquiditiesSpy;
  let navigateSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LiquidityModule,
        ...extraTestingModules
      ],
      providers: [
        LiquidityService,
        Location,
        {
          provide: ActivatedRoute, useValue: {
            queryParams: of({ page: 1 }),
            params: of({ page: 1 }),
          }
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach((done) => {
    fixture = TestBed.createComponent(LiquidityListComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    location = TestBed.get(Location);
    headerLovColumns = ['instrument', 'quote_asset', 'exchange'];
    navigateSpy = spyOn(component.router, 'navigate');
    button = fixture.nativeElement.querySelector('div a');
    liquidityService = fixture.debugElement.injector.get(LiquidityService);
    getAllLiquiditiesSpy = spyOn(liquidityService, 'getAllLiquidities')
      .and.returnValue(fakeAsyncResponse(getAllLiquiditiesData));

    fixture.detectChanges();

    getAllLiquiditiesSpy.calls.mostRecent().returnValue.subscribe(() => {
      fixture.detectChanges();
      done();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly load liquidity requirements table data on init', () => {
    expect(component.liquidityDataSource.body).toEqual(getAllLiquiditiesData.liquidity_requirements);
    expect(component.liquidityDataSource.footer).toEqual(getAllLiquiditiesData.footer);
    expect(component.count).toEqual(getAllLiquiditiesData.count);
  });

  it('should set header LOV observables for specified columns', () => {
    fixture.whenStable().then(() => testHeaderLov(component.liquidityDataSource, headerLovColumns));
  });

  it('should be navigated to liquidity requirement page on table row click', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRow = fixture.nativeElement.querySelector('table tbody tr');
      click(tableRow);
      expect(navigateSpy).toHaveBeenCalledWith(['/liquidity_requirements/preview',
        getAllLiquiditiesData.liquidity_requirements[0].id]);
    });
  });

  it('should be navigated to liquidity requirement creation page on "add requirement" button press', fakeAsync(() => {
    click(button);
    tick();
    expect(location.path()).toBe('/liquidity_requirements/create');
  }));

  it('should navigate to edit page on edit button click', () => {
    const btn = fixture.nativeElement.querySelector('table tbody tr td:last-child label');
    click(btn);
    expect(navigateSpy).toHaveBeenCalledWith(['/liquidity_requirements/edit', 21]);
  });
});

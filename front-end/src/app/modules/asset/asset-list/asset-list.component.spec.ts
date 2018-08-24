import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { AssetListComponent } from './asset-list.component';
import { SharedModule } from '../../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { AssetModule } from '../asset.module';

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({}); // empty translation json
  }
}

describe('AssetListComponent', () => {
  let component: AssetListComponent;
  let fixture: ComponentFixture<AssetListComponent>;

  // beforeEach(async(() => {
  //   TestBed.configureTestingModule({
  //     imports: [
  //       CommonModule,
  //       BrowserModule,
  //       RouterModule, // TODO: Remove this when moving to lazy loaded modules
  //       SharedModule,
  //       //ActivatedRoute,
  //       // AssetRoutingModule
  //     ],
  //     declarations: [
  //       AssetListComponent,
  //     ],
  //     providers: [
  //       CurrencyPipe
  //     ],
  //   })
  //   .compileComponents();
  // }));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AssetModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader }
        })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AssetListComponent);
    fixture.detectChanges();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(AssetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

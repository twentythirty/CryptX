import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { CustodiansListComponent } from './custodians-list.component';
import { ColdStorageCustodiansModule } from '../cold-storage-custodians.module';
import { TranslateModule, TranslateLoader } from '../../../../../../node_modules/@ngx-translate/core';
import { HttpClientModule } from '../../../../../../node_modules/@angular/common/http';

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({}); // empty translation json
  }
}

describe('CustodiansListComponent', () => {
  let component: CustodiansListComponent;
  let fixture: ComponentFixture<CustodiansListComponent>;

  // beforeEach(async(() => {
  //   TestBed.configureTestingModule({
  //     declarations: [ CustodiansListComponent ]
  //   })
  //   .compileComponents();
  // }));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ColdStorageCustodiansModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader }
        })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CustodiansListComponent);
    fixture.detectChanges();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(CustodiansListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

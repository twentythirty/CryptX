import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({}); // empty translation json
  }
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader }
        })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  }));

  it('should create the app', async(() => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  // it(`should have as title 'app'`, async(() => {
  //   // const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.debugElement.componentInstance;
  //   console.log('app', fixture, app);
  //   expect(app.title).toEqual('CryptX');
  // }));

  // it('should render title in a h1 tag', async(() => {
  //   // const fixture = TestBed.createComponent(AppComponent);
  //   // fixture.detectChanges();
  //   const compiled = fixture.debugElement.nativeElement;
  //   console.log('compiled', compiled);
  //   expect(compiled.querySelector('h1').textContent).toContain('Welcome to CryptX!');
  // }));
});

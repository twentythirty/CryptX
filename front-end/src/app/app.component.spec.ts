import { TestBed, async, ComponentFixture } from '@angular/core/testing';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { extraTestingModules } from './testing/utils';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule,
        ...extraTestingModules
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

import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { defer } from 'rxjs/observable/defer';

/**
 * Helper function for stubbing service data
 * 
 * @param data - any data
 */
export function fakeAsyncResponse<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

/**
 * Fake translate json file loader for unit tests
 */
export class FakeTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({}); // empty translation json
  }
}

export const extraTestingModules = [
  BrowserAnimationsModule,
  RouterTestingModule,
  TranslateModule.forRoot({
    loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
  })
];

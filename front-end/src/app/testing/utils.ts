import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { throwError, of, defer } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { routes } from '../config/routes/routes';
import { FakeEmptyModule, FakeEmptyComponent } from './fake-empty.component';

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

export const testingTranslateModule = TranslateModule.forRoot({
  loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
});

export const extraTestingModules = [
  BrowserAnimationsModule,
  RouterTestingModule.withRoutes(
    routes.map(route => {
      if (route.children) {
        route.children.map(child => {
          child.component = FakeEmptyComponent;
          return child;
        });
      }

      return {
        path: route.path,
        component: FakeEmptyComponent,
        children: route.children
      };
    })
  ),
  testingTranslateModule,
  FakeEmptyModule,
];


/**
 * Create custom DOM event the old fashioned way
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Event/initEvent
 * Although officially deprecated, some browsers (phantom) don't accept the preferred "new Event(eventName)"
 */
export function newEvent(eventName: string, bubbles = false, cancelable = false) {
  const evt = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
  evt.initCustomEvent(eventName, bubbles, cancelable, null);
  return evt;
}

/**
 * Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler
 */
export const ButtonClickEvents = {
  left:  { button: 0 },
  right: { button: 2 }
};

/**
 * Simulate element click. Defaults to mouse left-button click event.
 */
export function click(el: DebugElement | HTMLElement, eventObj: any = ButtonClickEvents.left): void {
  if (el instanceof HTMLElement) {
    el.click();
  } else {
    el.triggerEventHandler('click', eventObj);
  }
}

/**
 * error response for spy, when you need check whats going on if API return error
 *
 * serviceSpy.and.returnValue(errorResponse);
 */
export const errorResponse = throwError({
  error: {
    success: false,
    error: 'error message'
  }
});

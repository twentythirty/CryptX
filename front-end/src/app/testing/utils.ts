import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { throwError, of, defer } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { routes } from '../config/routes/routes';
import { FakeEmptyModule, FakeEmptyComponent } from './fake-empty.component';
import { By } from '@angular/platform-browser';
import * as _ from 'lodash';


/**
 * Helper function for stubbing service data
 *
 * @param data - any data
 */
export function fakeAsyncResponse<T>(data: T) {
  return defer(() => Promise.resolve(
    _.cloneDeep(data)
  ));
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




/**
 * function for ng-select option selecting in tests
 */
export function selectOption(fixture, key: KeyCode, index: number) {
  triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Space); // open
  for (let i = 0; i < index; i++) {
    triggerKeyDownEvent(getNgSelectElement(fixture), key);
  }
  triggerKeyDownEvent(getNgSelectElement(fixture), KeyCode.Enter); // select
}

export enum KeyCode {
  Tab = 9,
  Enter = 13,
  Esc = 27,
  Space = 32,
  ArrowUp = 38,
  ArrowDown = 40,
  Backspace = 8
}

export function getNgSelectElement(fixture): DebugElement {
  if (fixture.debugElement) {
    return fixture.debugElement.query(By.css('ng-select'));
  } else {
    return fixture.query(By.css('ng-select'));
  }
}

export function triggerKeyDownEvent(element: DebugElement, which: number, key = ''): void {
  element.triggerEventHandler('keydown', {
    which: which,
    key: key,
    preventDefault: () => { },
    stopPropagation: () => { }
  });
}

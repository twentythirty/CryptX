import { async } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { click } from './utils';


export function testHeaderLov(dataSource, headerLovColumns) {
  for (const item of dataSource.header) {
    if (headerLovColumns.includes(item.column)) {
      expect(item.filter.rowData$).toBeDefined(`"${item.column}" column`);
    } else {
      expect(item.filter.rowData$).toBeUndefined(`"${item.column}" column`);
    }
  }
}

// export function testFormControlForm(formControl: FormGroup, submitButton: HTMLElement, fillForm: Function) {
export function testFormControlForm(
  additionalData: () => {
    component: any,
    formControl: FormGroup,
    submitButton: HTMLElement,
    fillForm: Function
  }
) {
  describe('form tests', () => {
    let component: any;
    let formControl: FormGroup;
    let submitButton: HTMLElement;
    let fillForm: Function;

    let navigateSpy;

    beforeEach(async(() => {
      ({ component, formControl, submitButton, fillForm } = additionalData());
    }));

    it('submit button should be enabled after component init', () => {
      expect(submitButton.hasAttribute('disabled')).toBe(false);
    });
    it('submit button should be enabled if form is invalid', () => {
      expect(formControl.invalid).toBe(true, 'form isint invalid');
      expect(submitButton.hasAttribute('disabled')).toBe(false, 'button isint enabled');
    });
    it('should mark all form controls as dirty on submit button press', () => {
      click(submitButton);
      for (const field of Object.keys(formControl.controls)) {
        expect(formControl.controls[field].dirty).toBe(true, `${field} isint dirty`);
      }
    });

    describe('after form is valid', () => {
      beforeEach(async(() => fillForm()));

      it('form submit button should not be disabled', () => {
        expect(submitButton.hasAttribute('disabled')).toBe(false);
      });

      describe('after form is submited', () => {
        beforeEach(async(() => {
          navigateSpy = spyOn(component.router, 'navigate');
          click(submitButton);
        }));

        it('submit button should be disabled', () => {
          expect(submitButton.hasAttribute('disabled')).toBe(true);
        });

        describe('after form submit get response', () => {
          it('should not be redirected on unsuccessful response', () => {
            expect(navigateSpy).not.toHaveBeenCalled();
          });

          it('should be redirected on successful response', () => {

          });

          it('submit button should not be disabled', () => {
            expect(submitButton.hasAttribute('disabled')).toBe(false);
          });
        });
      });
    });
  });

}

import { async } from '@angular/core/testing';
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


export function testFormControlForm(
  additionalData: () => {
    component: any,
    fixture: any,
    formControl: FormGroup,
    submitButton: HTMLElement,
    fillForm: Function,
    changeToUnsuccess: Function,
  }
) {
  describe('common form validating/submiting', () => {
    let component: any;
    let fixture: any;
    let formControl: FormGroup;
    let submitButton: HTMLElement;
    let fillForm: Function;
    let changeToUnsuccess: Function;

    let navigateSpy;

    beforeEach(async(() => {
      ({ component, fixture, formControl, submitButton, fillForm, changeToUnsuccess } = additionalData());
    }));

    it('submit button should be enabled after component init', () => {
      expect(submitButton.hasAttribute('disabled')).toBe(false);
    });
    it('submit button should be enabled if form is invalid', () => {
      expect(formControl.invalid).toBe(true, 'form isint invalid');
      expect(submitButton.hasAttribute('disabled')).toBe(false, 'button isint enabled');
    });
    it('should mark all form controls as touched on submit button press', () => {
      click(submitButton);

      for (const field of Object.keys(formControl.controls)) {
        expect(formControl.controls[field].touched).toBe(true, `${field} isint touched`);
      }
    });

    describe('after form is valid', () => {
      beforeEach(async(() => fillForm()));

      it('form submit button should not be disabled', () => {
        expect(submitButton.hasAttribute('disabled')).toBe(false);
      });

      describe('after form is successfuly submited', () => {
        beforeEach(async(() => {
          navigateSpy = spyOn(component.router, 'navigate');
          click(submitButton);
          fixture.detectChanges();
        }));

        it('submit button should be disabled', () => {
          expect(submitButton.hasAttribute('disabled')).toBe(true);
        });

        it('should be redirected', () => {
          expect(navigateSpy).toHaveBeenCalled();
        });

        it('submit button should not be disabled', () => {
          fixture.detectChanges();
          expect(submitButton.hasAttribute('disabled')).toBe(false);
        });
      });

      describe('after form is unsuccessfuly submited', () => {
        beforeEach(async(() => {
          changeToUnsuccess();
          navigateSpy = spyOn(component.router, 'navigate');
          click(submitButton);
        }));

        it('should not be redirected', () => {
          expect(navigateSpy).not.toHaveBeenCalled();
        });
      });

    });
  });

}

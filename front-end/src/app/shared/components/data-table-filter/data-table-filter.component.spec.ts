import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatInputModule } from '@angular/material';
import * as _ from 'lodash';
import { testingTranslateModule, click, newEvent, fakeAsyncResponse } from '../../../testing/utils';

import { DataTableFilterComponent, DataTableFilterData } from './data-table-filter.component';
import { FilterPipe } from '../../pipes/filter.pipe';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { BtnComponent } from '../btn/btn.component';
import { DataTableFilterType } from './data-table-filter-type.enum';

describe('DataTableFilterComponent', () => {
  let component: ComponentWrapperComponent;
  let fixture: ComponentFixture<ComponentWrapperComponent>;

  it('should create', () => {
    ({ fixture, component } = createTestingModule(`
      <app-data-table-filter></app-data-table-filter>
    `));
    expect(component).toBeTruthy();
  });


  describe('text search', () => {
    const searchVisibleMsg = 'text search button is visible';
    const searchInvisibleMsg = 'text search button not visible';

    it('should show text search button if filter type is text', () => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
          type="${DataTableFilterType.Text}"
        ></app-data-table-filter>
      `));

      const sortableBlock = fixture.nativeElement.querySelector('.search-in-filters');
      expect(sortableBlock).toBeTruthy(searchInvisibleMsg);
    });

    it('should not show text search button if filter type is not text', () => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
        ></app-data-table-filter>
      `));

      const types = [
        DataTableFilterType.Date,
        DataTableFilterType.Number
      ];

      for (const key in types) {
        if (types[key]) {
          component.filterComponent.type = <DataTableFilterType>types[key];
          fixture.detectChanges();
          const sortableBlock = fixture.nativeElement.querySelector('.search-in-filters');
          expect(sortableBlock).toBeFalsy(searchVisibleMsg);
        }
      }
    });

    it('should show text search button if filter inputSearch attribute is "true" at any type', () => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
          inputSearch="true"
        ></app-data-table-filter>
      `));

      const types = DataTableFilterType;

      for (const key in types) {
        if (types[key]) {
          component.filterComponent.type = <DataTableFilterType>types[key];
          fixture.detectChanges();
          const sortableBlock = fixture.nativeElement.querySelector('.search-in-filters');
          expect(sortableBlock).toBeTruthy(searchInvisibleMsg);
        }
      }
    });

    describe('after search icon click', () => {
      beforeEach(() => {
        ({ fixture, component } = createTestingModule(`
          <app-data-table-filter
            inputSearch="true"
          ></app-data-table-filter>
        `));

        const searchIcon = fixture.nativeElement.querySelector('.search-in-filters .ico');
        click(searchIcon);
        fixture.detectChanges();

        // set some value also
        const input = fixture.nativeElement.querySelector('.search-in-filters input');
        input.value = 'test value';
        input.dispatchEvent(newEvent('input'));
        fixture.detectChanges();
      });

      it('should open text search input field', () => {
        const searchBlock = fixture.nativeElement.querySelector('.search-in-filters .search-input');
        expect(searchBlock).toBeTruthy();
      });

      describe('after close search icon click', () => {
        beforeEach(() => {
          const closeSearchIcon = fixture.nativeElement.querySelector('.search-in-filters .close-search');
          click(closeSearchIcon);
          fixture.detectChanges();
        });

        it('should close text search input field', () => {
          const searchBlock = fixture.nativeElement.querySelector('.search-in-filters .search-input');
          expect(searchBlock).toBeFalsy();
        });

        it('should clear search input value', fakeAsync(() => {
          const searchIcon = fixture.nativeElement.querySelector('.search-in-filters .ico');
          click(searchIcon);
          fixture.detectChanges();
          tick();

          const input = fixture.nativeElement.querySelector('.search-in-filters input');
          expect(input.value).toBe('');
        }));
      });
    });

  });


  describe('checkbox list', () => {
    beforeEach(() => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
          [rowData]="rowData"
        ></app-data-table-filter>
      `));

      component.rowData = [
        { value: 'value1' },
        { value: 'value2' },
      ];

      fixture.detectChanges();
    });


    it('should show list with 2 checkbox items', () => {
      const checkbox = fixture.nativeElement.querySelectorAll('.list-of-filters app-checkbox');
      expect(checkbox.length).toBe(2);
    });


    describe('after text search field fill', () => {
      beforeEach(() => {
        const searchIcon = fixture.nativeElement.querySelector('.search-in-filters .ico');
        click(searchIcon);
        fixture.detectChanges();

        // set some value also
        const input = fixture.nativeElement.querySelector('.search-in-filters input');
        input.value = 'e2';
        input.dispatchEvent(newEvent('input'));
        fixture.detectChanges();
      });


      it('should filter checkboxlist and show only 1 chechbox', () => {
        const checkbox = fixture.nativeElement.querySelectorAll('.list-of-filters app-checkbox');
        expect(checkbox.length).toBe(1);

        const checkboxLabelText = checkbox[0].querySelector('label').innerText.trim();
        expect(checkboxLabelText).toBe('value2');
      });
    });
  });


  describe('checkbox list from API', () => {
    beforeEach(() => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
          [rowData$]="rowData$"
          [dirty]="dirty"
        ></app-data-table-filter>
      `));

      component.rowData$ = fakeAsyncResponse([
        { value: 'value1' },
        { value: 'value2' },
      ]);
      component.dirty = true;

      fixture.detectChanges();
    });

    it('should show preloader', () => {
      const preloader = fixture.nativeElement.querySelector('.list-of-filters .preloader');
      expect(preloader).toBeTruthy('no preloader found');
    });


    describe('after data are loaded', () => {
      beforeEach((done) => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          done();
        });
      });

      it('should not show preloader', () => {
        const preloader = fixture.nativeElement.querySelector('.list-of-filters .preloader');
        expect(preloader).toBeFalsy('preloader found');
      });

      it('should show list with 2 checkbox items', () => {
        const checkbox = fixture.nativeElement.querySelectorAll('.list-of-filters app-checkbox');
        expect(checkbox.length).toBe(2);
      });
    });

  });


  describe('date range picker', () => {
    it('should show daterange picker if filter type is "date"', () => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
          type="${DataTableFilterType.Date}"
        ></app-data-table-filter>
      `));

      const daterangeBox = fixture.nativeElement.querySelector('.calendar');
      expect(daterangeBox).toBeTruthy('date range picked no fount');
    });
  });


  describe('number range block', () => {
    it('should show number range block if filter type is "number"', () => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
          type="${DataTableFilterType.Number}"
        ></app-data-table-filter>
      `));

      const rangeBox = fixture.nativeElement.querySelector('.calendar-filter input[type="number"]');
      expect(rangeBox).toBeTruthy('number range no found');
    });

    it('should show number range block if filter type is "number" and hasRange is true', () => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
          type="${DataTableFilterType.Number}"
          [hasRange]="true"
        ></app-data-table-filter>
      `));

      const rangeBox = fixture.nativeElement.querySelector('.calendar-filter input[type="number"]');
      expect(rangeBox).toBeTruthy('number range no found');
    });

    it('should not show number range block if filter type is "number" and hasRange is false', () => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
          type="${DataTableFilterType.Number}"
          [hasRange]="false"
        ></app-data-table-filter>
      `));

      const rangeBox = fixture.nativeElement.querySelector('.calendar-filter input[type="number"]');
      expect(rangeBox).toBeFalsy('number range found');
    });

    it('should not show number range block if filter type is not "number"', () => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
          type="${DataTableFilterType.Number}"
        ></app-data-table-filter>
      `));

      const types = [
        DataTableFilterType.Date,
        DataTableFilterType.Text
      ];

      for (const key in types) {
        if (types[key]) {
          component.filterComponent.type = <DataTableFilterType>types[key];
          fixture.detectChanges();
          const sortableBlock = fixture.nativeElement.querySelector('.calendar-filter input[type="number"]');
          expect(sortableBlock).toBeFalsy();
        }
      }
    });


    describe('number values autocorrection', () => {
      beforeEach(() => {
        ({ fixture, component } = createTestingModule(`
          <app-data-table-filter
            type="${DataTableFilterType.Number}"
          ></app-data-table-filter>
        `));
      });


      it('should not change values if both fields are not filled', fakeAsync(() => {
        let inputs = fillNumberRangeFields(5, '');

        expect(inputs[0].value).toBe('5', 'field1 value was changed');
        expect(inputs[1].value).toBe('', 'field2 value was changed');

        inputs = fillNumberRangeFields('', 4);

        expect(inputs[0].value).toBe('', 'field1 value was changed');
        expect(inputs[1].value).toBe('4', 'field2 value was changed');
      }));

      it('should not change values if field1 value is lower than field2 value', fakeAsync(() => {
        const inputs = fillNumberRangeFields(4, 7);

        expect(inputs[0].value).toBe('4', 'field1 value changed');
        expect(inputs[1].value).toBe('7', 'field2 value changed');
      }));

      it('if field2 value is lower than field1, field1 should get field2 value', fakeAsync(() => {
        const input1 = fillNumberRangeField1(8);
        const input2 = fillNumberRangeField2(3);

        expect(input1.value).toBe('3');
      }));

      it('if field1 value is lower than field2, field2 should get field1 value', fakeAsync(() => {
        // different input order!
        const input2 = fillNumberRangeField2(4);
        const input1 = fillNumberRangeField1(7);

        expect(input2.value).toBe('7');
      }));
    });
  });


  describe('sortable', () => {
    it('should not show sorting select if value is "false"', () => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
          [sortable]="false"
        ></app-data-table-filter>
      `));

      const sortableBlock = fixture.nativeElement.querySelector('.bottom-part .select');
      expect(sortableBlock).toBeFalsy('select is visible');
    });

    it('should show sorting select if value is "true"', () => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
          [sortable]="true"
        ></app-data-table-filter>
      `));

      const sortableBlock = fixture.nativeElement.querySelector('.bottom-part .select');
      expect(sortableBlock).toBeTruthy('select not visible');
    });

    it('should show sorting select by default', () => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table-filter
        ></app-data-table-filter>
      `));

      const sortableBlock = fixture.nativeElement.querySelector('.bottom-part .select');
      expect(sortableBlock).toBeTruthy('select not visible');
    });
  });


  describe('filter submiting', () => {

    describe('text filter', () => {
      beforeEach(() => {
        ({ fixture, component } = createTestingModule(`
          <app-data-table-filter
            column="id"
            type="${DataTableFilterType.Text}"
            [rowData]="rowData"
            (onFilter)="onSetFilter($event)"
          ></app-data-table-filter>
        `));

        component.rowData = [
          { value: 'value1' },
          { value: 'value2' },
        ];

        openSearchButton();
      });


      it('filter by text', () => {
        fillTextSearchField('text query');
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: '%text query%',
              expression: 'iLike',
              type: 'string'
            }
          ]
        };

        expect(component.filterResult).toEqual(expectation);
      });

      it('filter by single checkbox', () => {
        checkCheckboxByIndex(0);
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: ['value1'],
              expression: 'in',
              type: 'string'
            }
          ]
        };

        expect(component.filterResult).toEqual(expectation);
      });

      it('filter by single checkbox when search query field filled', () => {
        fillTextSearchField('value1');
        checkCheckboxByIndex(0);
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: ['value1'],
              expression: 'in',
              type: 'string'
            }
          ]
        };

        expect(component.filterResult).toEqual(expectation);
      });

      it('filter by multiple checkbox', () => {
        checkCheckboxByIndex(0, 1);
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: ['value1', 'value2'],
              expression: 'in',
              type: 'string'
            }
          ]
        };

        expect(component.filterResult).toEqual(expectation);
      });
    });


    describe('date filter', () => {
      beforeEach(() => {
        ({ fixture, component } = createTestingModule(`
          <app-data-table-filter
            column="id"
            type="${DataTableFilterType.Date}"
            (onFilter)="onSetFilter($event)"
          ></app-data-table-filter>
        `));
      });


      it('filter by date "from"', () => {
        const dateFrom = new Date(2015, 5, 15);
        component.filterComponent.filterData.values = [dateFrom];
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: Date.parse(String(dateFrom)),
              expression: 'gt',
              type: 'timestamp'
            }
          ]
        };

        expect(component.filterResult).toEqual(expectation);
      });

      it('filter by date "to"', () => {
        const dateTo = new Date(2015, 5, 15);
        component.filterComponent.filterData.values = [null, dateTo];
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: Date.parse(String(dateTo)),
              expression: 'lt',
              type: 'timestamp'
            }
          ]
        };

        expect(component.filterResult).toEqual(expectation);
      });

      it('filter by date range', () => {
        const dateFrom = new Date(2015, 5, 10);
        const dateTo = new Date(2015, 5, 15);
        component.filterComponent.filterData.values = [dateFrom, dateTo];
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: Date.parse(String(dateFrom)),
              expression: 'gt',
              type: 'timestamp'
            },
            {
              field: 'id',
              value: Date.parse(String(dateTo)),
              expression: 'lt',
              type: 'timestamp'
            }
          ]
        };

        expect(component.filterResult).toEqual(expectation);
      });

      it('filter by date "from" and sorting', () => {
        const dateFrom = new Date(2015, 5, 10);
        component.filterComponent.filterData.values = [dateFrom];
        selectSorting('asc');
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: Date.parse(String(dateFrom)),
              expression: 'gt',
              type: 'timestamp'
            }
          ],
          order: {
            by: 'id',
            order: 'asc'
          }
        };

        expect(component.filterResult).toEqual(expectation);
      });
    });


    describe('number filter', () => {
      beforeEach(() => {
        ({ fixture, component } = createTestingModule(`
          <app-data-table-filter
            column="id"
            type="${DataTableFilterType.Number}"
            [inputSearch]="true"
            (onFilter)="onSetFilter($event)"
          ></app-data-table-filter>
        `));

        openSearchButton();
      });


      it('search by text input', () => {
        fillTextSearchField('5');
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: '5'
            }
          ]
        };

        expect(component.filterResult).toEqual(expectation);
      });

      it('search by number "from"', fakeAsync(() => {
        fillNumberRangeField1(7);
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: 7,
              expression: 'gte',
              type: 'number'
            }
          ]
        };

        expect(component.filterResult).toEqual(expectation);
      }));

      it('search by number "to"', fakeAsync(() => {
        fillNumberRangeField2(7);
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: 7,
              expression: 'lte',
              type: 'number'
            }
          ]
        };

        expect(component.filterResult).toEqual(expectation);
      }));

      it('search by number range', fakeAsync(() => {
        fillNumberRangeFields(3, 7);
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: 3,
              expression: 'gte',
              type: 'number'
            },
            {
              field: 'id',
              value: 7,
              expression: 'lte',
              type: 'number'
            }
          ]
        };

        expect(component.filterResult).toEqual(expectation);
      }));

      it('search by number "from" and sorting', fakeAsync(() => {
        fillNumberRangeField1(4);
        selectSorting('desc');
        submitFilter();

        const expectation: DataTableFilterData = {
          column: 'id',
          values: [
            {
              field: 'id',
              value: 4,
              expression: 'gte',
              type: 'number'
            }
          ],
          order: {
            by: 'id',
            order: 'desc'
          }
        };

        expect(component.filterResult).toEqual(expectation);
      }));
    });
  });



  function openSearchButton() {
    const searchButton = fixture.nativeElement.querySelector('.search-in-filters .ico');
    click(searchButton);
    fixture.detectChanges();
  }

  function fillTextSearchField(query: string) {
    const input = fixture.nativeElement.querySelector('.search-in-filters input');
    input.value = query;
    input.dispatchEvent(newEvent('input'));
    fixture.detectChanges();

    return input;
  }

  function checkCheckboxByIndex(...indexArr: number[]) {
    const checkboxes = fixture.nativeElement.querySelectorAll('.list-of-filters input[type=checkbox]');

    return indexArr.map(i => {
      checkboxes[i].checked = true;
      checkboxes[i].dispatchEvent(newEvent('change'));

      return checkboxes[i];
    });
  }

  function fillNumberRangeField(index, val) {
    const inputs = fixture.nativeElement.querySelectorAll('.calendar-filter input[type=number]');
    inputs[index].value = val;
    inputs[index].dispatchEvent(newEvent('input'));
    inputs[index].dispatchEvent(newEvent('change'));
    fixture.detectChanges();
    tick();

    return inputs[index];
  }

  function fillNumberRangeField1(val) {
    return fillNumberRangeField(0, val);
  }

  function fillNumberRangeField2(val) {
    return fillNumberRangeField(1, val);
  }

  function fillNumberRangeFields(val1, val2) {
    return [
      fillNumberRangeField1(val1),
      fillNumberRangeField2(val2),
    ];
  }

  function selectSorting(value: '' | 'asc' | 'desc') {
    const select = fixture.nativeElement.querySelector('.bottom-part .select-styled');
    click(select);
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.bottom-part .select-options li');
    let index;

    switch (value) {
      case '': index = 0; break;
      case 'asc': index = 1; break;
      case 'desc': index = 2;
    }

    click(options[index]);

    return options[index];
  }

  function submitFilter() {
    const btn = fixture.nativeElement.querySelector('.bottom-part button');
    click(btn);
    fixture.detectChanges();
  }

});




@Component({
  template: ``
})
class ComponentWrapperComponent {
  @ViewChild(DataTableFilterComponent) filterComponent: DataTableFilterComponent;
  rowData;
  rowData$;
  dirty;
  filterResult;

  onSetFilter(data) {
    this.filterResult = data;
  }
}


function createTestingModule(template: string) {
  TestBed.configureTestingModule({
    declarations: [
      DataTableFilterComponent,
      FilterPipe,
      CheckboxComponent,
      BtnComponent,
      ComponentWrapperComponent,
    ],
    imports: [
      FormsModule,
      MatProgressSpinnerModule,
      MatDatepickerModule,
      MatFormFieldModule,
      MatNativeDateModule,
      MatInputModule,
      testingTranslateModule,
      BrowserAnimationsModule,
    ]
  })
  .overrideComponent(ComponentWrapperComponent, {
    set: {
      template: template
    }
  })
  .compileComponents();

  const fixture = TestBed.createComponent(ComponentWrapperComponent);
  fixture.detectChanges();

  return {
    fixture: fixture,
    component: fixture.componentInstance
  };
}

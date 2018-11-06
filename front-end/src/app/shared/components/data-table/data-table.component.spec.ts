import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { extraTestingModules, click } from '../../../testing/utils';

import { TableDataColumn, TableDataSource, DataTableComponent, TableDataSourceHeader, TableDataSourceFooter } from './data-table.component';
import { SharedModule } from '../../shared.module';
import { DataTableFilterType } from '../data-table-filter/data-table-filter-type.enum';


describe('DataTableComponent', () => {
  let component: ComponentWrapperComponent;
  let fixture: ComponentFixture<ComponentWrapperComponent>;

  const tableEmptyMessageCont: (ComponentFixture) => HTMLElement = (f) => {
    return f.nativeElement.querySelector('.empty-col span');
  };
  const tableEmptyPreloader: (ComponentFixture) => HTMLElement = (f) => {
    return f.nativeElement.querySelector('.empty-col mat-progress-spinner');
  };
  const tablePreloader: (ComponentFixture) => HTMLElement = (f) => {
    return f.nativeElement.querySelector('.data-table-preloader');
  };
  const tableBodyFirstRow: (ComponentFixture) => HTMLElement = (f) => {
    return f.nativeElement.querySelector('tbody tr:first-child');
  };

  const tableHeadCol: (ComponentFixture, number) => HTMLElement = (f, index) => {
    return f.nativeElement.querySelector(`thead th:nth-child(${++index})`);
  };
  const tableBodyCol: (ComponentFixture, number) => NodeListOf<HTMLElement> = (f, index) => {
    return f.nativeElement.querySelectorAll(`tbody td:nth-child(${++index})`);
  };
  const tableFootCol: (ComponentFixture, number) => HTMLElement = (f, index) => {
    return f.nativeElement.querySelector(`tfoot td:nth-child(${++index})`);
  };

  const tableFilterCol: (ComponentFixture, number) => HTMLElement = (f, index) => {
    return f.nativeElement.querySelector(`thead th:nth-child(${++index})`);
  };
  const tableFilter: (ComponentFixture, number) => HTMLElement = (f, index) => {
    return tableFilterCol(f, index).querySelector('app-data-table-filter');
  };
  const tableFilterSortingSelect: (HTMLElement) => HTMLElement = (el) => {
    return el.querySelector('.bottom-part .select-styled');
  };
  const tableFilterSortingSelectOption: (HTMLElement, number) => HTMLElement = (el, index) => {
    return el.querySelector(`.bottom-part .select-options li:nth-child(${++index})`);
  };
  const tableFilterSubmit: (HTMLElement) => HTMLElement = (el) => {
    return el.querySelector('app-btn .btn');
  };


  it('should create', () => {
    ({ fixture, component } = createTestingModule(`
      <app-data-table
        [dataSource]="dataSource"
        [columnsToShow]="columnsToShow"
      ></app-data-table>
    `));

    expect(component).toBeTruthy();
  });

  it('should show preloader if dataSource body null', () => {
    ({ fixture, component } = createTestingModule(`
      <app-data-table
        [dataSource]="dataSource"
        [columnsToShow]="columnsToShow"
      ></app-data-table>
    `));

    const preloader = tableEmptyPreloader(fixture);
    expect(preloader).toBeTruthy('preloader not found');
  });


  describe('when empty data set given', () => {
    beforeEach(() => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table
          [dataSource]="dataSource"
          [columnsToShow]="columnsToShow"
        ></app-data-table>
      `));

      component.dataSource.body = [];

      fixture.detectChanges();
    });


    it('should not show preloader', () => {
      const preloader = tableEmptyPreloader(fixture);
      expect(preloader).toBeFalsy('preloader not found');
    });

    it('should show empty data set message', () => {
      const message = tableEmptyMessageCont(fixture).innerText;
      expect(message).toBe('common.list_empty');
    });
  });


  describe('when custom empty data set message given', () => {
    beforeEach(() => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table
          [dataSource]="dataSource"
          [columnsToShow]="columnsToShow"
          emptyText="custom text"
        ></app-data-table>
      `));

      component.dataSource.body = [];

      fixture.detectChanges();
    });


    it('should show empty data set custom message', () => {
      const message = tableEmptyMessageCont(fixture).innerText;
      expect(message).toBe('custom text');
    });
  });


  describe('when data set is given', () => {
    beforeEach(() => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table
          [dataSource]="dataSource"
          [columnsToShow]="columnsToShow"
          [loading]="loading"
        ></app-data-table>
      `));

      component.dataSource.body = tableBodyData;

      fixture.detectChanges();
    });


    it('should not show empty table message', () => {
      const message = tableEmptyMessageCont(fixture);
      expect(message).toBeFalsy('empty message visible');
    });


    describe('loading state', () => {
      it('should not show table preloader', () => {
        const preloader = tablePreloader(fixture);
        expect(preloader).toBeFalsy('preloader visible');
      });

      it('should show table preloader on loading state', () => {
        component.loading = true;
        fixture.detectChanges();

        const preloader = tablePreloader(fixture);
        expect(preloader).toBeTruthy('preloader invisible');
      });
    });

  });


  describe('custom row class', () => {
    beforeEach(() => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table
          [dataSource]="dataSource"
          [columnsToShow]="columnsToShow"
          [rowClass]="rowClass"
        ></app-data-table>
      `));

      component.dataSource.body = tableBodyData;
      component.rowClass = (row) => 'custom-row-class';

      fixture.detectChanges();
    });

    it('should apply custom row class to row', () => {
      const row = tableBodyFirstRow(fixture);
      expect(row.classList).toContain('custom-row-class');
    });
  });


  describe('custom column class', () => {
    beforeEach(() => {
      tableHeaderData[0].column_class = 'custom-column-class';

      ({ fixture, component } = createTestingModule(`
        <app-data-table
          [dataSource]="dataSource"
          [columnsToShow]="columnsToShow"
        ></app-data-table>
      `));

      component.dataSource.body = tableBodyData;
      component.dataSource.footer = tableFooterData;

      fixture.detectChanges();
    });

    afterEach(() => {
      delete tableHeaderData[0].column_class;
    });

    it('should apply custom column class to column', () => {
      const theadCol = tableHeadCol(fixture, 0);
      expect(theadCol.classList).toContain('custom-column-class');

      const tbodyCol = tableBodyCol(fixture, 0);
      Array.from(tbodyCol).forEach(item => {
        expect(item.classList).toContain('custom-column-class');
      });

      const tfootCol = tableFootCol(fixture, 0);
      expect(tfootCol.classList).toContain('custom-column-class');
    });
  });

  describe('filter defined', () => {
    beforeEach(() => {
      tableHeaderData[0].filter = { type: DataTableFilterType.Text };

      ({ fixture, component } = createTestingModule(`
        <app-data-table
          [dataSource]="dataSource"
          [columnsToShow]="columnsToShow"
        ></app-data-table>
      `));

      fixture.detectChanges();
    });

    afterEach(() => {
      delete tableHeaderData[0].filter;
    });


    it('should not render filter container in second and third row', () => {
      expect(tableFilter(fixture, 1)).toBeFalsy('filter found');
      expect(tableFilter(fixture, 2)).toBeFalsy('filter found');
    });

    it('should render hidden filter container in first row', () => {
      const filter = tableFilter(fixture, 0);
      expect(filter).toBeTruthy('filter not found');
      expect(filter.hasAttribute('hidden')).toBeTruthy('filter not hidden');
    });

    it('should show filter on header cell click', () => {
      const filterCol = tableFilterCol(fixture, 0);
      const filter = tableFilter(fixture, 0);

      click(filterCol);
      fixture.detectChanges();
      expect(filter.hasAttribute('hidden')).toBeFalsy('filter hidden');
    });
  });

  describe('filter applying', () => {
    beforeEach(() => {
      tableHeaderData[0].filter = { type: DataTableFilterType.Text, sortable: true };

      ({ fixture, component } = createTestingModule(`
        <app-data-table
          [dataSource]="dataSource"
          [columnsToShow]="columnsToShow"
        ></app-data-table>
      `));

      component.dataSource.body = tableBodyData;
      component.dataSource.footer = tableFooterData;

      fixture.detectChanges();
    });

    afterEach(() => {
      delete tableHeaderData[0].filter;
    });

    describe('submit empty filter', () => {
      beforeEach(() => {
        const filterCol = tableFilterCol(fixture, 0);
        const filterSubmit = tableFilterSubmit(filterCol);

        click(filterCol);
        fixture.detectChanges();

        click(filterSubmit);
        fixture.detectChanges();
      });

      it('should hide filter', () => {
        const filter = tableFilter(fixture, 0);
        expect(filter).toBeTruthy('filter not found');
        expect(filter.hasAttribute('hidden')).toBeTruthy('filter not hidden');
      });

      it('column should not get hightlight state', () => {
        const theadCol = tableHeadCol(fixture, 0);
        expect(theadCol.classList).not.toContain('highlight');

        const tbodyCol = tableBodyCol(fixture, 0);
        Array.from(tbodyCol).forEach(item => {
          expect(item.classList).not.toContain('highlight');
        });

        const tfootCol = tableFootCol(fixture, 0);
        expect(tfootCol.classList).not.toContain('highlight');
      });
    });


    describe('submit sorting filter', () => {
      beforeEach(() => {
        const filterCol = tableFilterCol(fixture, 0);
        const filterSortingSelect = tableFilterSortingSelect(filterCol);
        const filterSubmit = tableFilterSubmit(filterCol);

        click(filterCol);
        fixture.detectChanges();

        click(filterSortingSelect);
        fixture.detectChanges();
        click(tableFilterSortingSelectOption(filterCol, 1));
        fixture.detectChanges();

        click(filterSubmit);
        fixture.detectChanges();
      });


      it('should hide filter', () => {
        const filter = tableFilter(fixture, 0);
        expect(filter).toBeTruthy('filter not found');
        expect(filter.hasAttribute('hidden')).toBeTruthy('filter not hidden');
      });

      it('column should get hightlight state', () => {
        const theadCol = tableHeadCol(fixture, 0);
        expect(theadCol.classList).toContain('highlight');

        const tbodyCol = tableBodyCol(fixture, 0);
        Array.from(tbodyCol).forEach(item => {
          expect(item.classList).toContain('highlight');
        });

        const tfootCol = tableFootCol(fixture, 0);
        expect(tfootCol.classList).toContain('highlight');
      });

    });
  });


  describe('click on row', () => {
    beforeEach(() => {
      ({ fixture, component } = createTestingModule(`
        <app-data-table
          [dataSource]="dataSource"
          [columnsToShow]="columnsToShow"
          (openRow)="openRow($event)"
        ></app-data-table>
    `));

    component.dataSource.body = tableBodyData;

    fixture.detectChanges();
    });


    it('should call openRow method', () => {
      const bodyFirstRow = tableBodyFirstRow(fixture);

      click(bodyFirstRow);

      expect(component.openRowCalled).toBeTruthy();
    });
  });

});



const tableHeaderData: TableDataSourceHeader[] = [
  { column: 'id', nameKey: 'ID' },
  { column: 'name', nameKey: 'Name' },
  { column: 'type', nameKey: 'Type' },
];

const tableBodyData = [
  {
    id: 1,
    name: 'Test User',
    type: 'type1',
    material: 'wood',
    energy: true
  }
];

const tableFooterData: TableDataSourceFooter[] = [
  {
    name: 'id',
    template: 'ID',
    value: '1',
    args: { id: 1 }
  }
];


@Component({
  template: ``
})
class ComponentWrapperComponent {
  @ViewChild(DataTableComponent) tableComponent: DataTableComponent;

  dataSource: TableDataSource = {
    header: tableHeaderData,
    body: null
  };
  columnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'name' }),
    new TableDataColumn({ column: 'type' }),
  ];

  loading;
  rowClass;
  openRowCalled;
  openRow = () => this.openRowCalled = true;
}

function createTestingModule(template: string) {
  TestBed.configureTestingModule({
    declarations: [
      ComponentWrapperComponent,
    ],
    imports: [
      SharedModule,
      ...extraTestingModules
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

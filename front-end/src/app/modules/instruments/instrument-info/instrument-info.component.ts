import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap, finalize } from 'rxjs/operators';
import {zip} from 'rxjs/observable/zip';
import * as _ from 'lodash';

import { InstrumentsService } from '../../../services/instruments/instruments.service';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';

import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import {
  ActionCellDataColumn,
  DataCellAction,
  DateCellDataColumn,
  SelectCellDataColumn,
  NumberCellDataColumn,
} from '../../../shared/components/data-table-cells';
import { InstrumentExchangeMap } from '../../../shared/models/instrumentExchangeMap';
import { AddMappingRequestData } from '../../../shared/models/api/addMappingRequestData';

import { ComponentCanDeactivate } from '../../../config/routes/route-pending-changes.guard';

@Component({
  selector: 'app-instrument-info',
  templateUrl: './instrument-info.component.html',
  styleUrls: ['./instrument-info.component.scss']
})
export class InstrumentInfoComponent extends DataTableCommonManagerComponent implements OnInit, ComponentCanDeactivate {
  private cryptoSuffix: string;

  public exchanges: Array<any>;
  public loading: boolean;
  public noChanges = true;

  public instrumentDataSource: TableDataSource = {
    header: [
      { column: 'symbol', nameKey: 'table.header.symbol' },
      { column: 'exchanges_connected', nameKey: 'table.header.exchanges_connected' },
      { column: 'exchanges_failed', nameKey: 'table.header.exchanges_failed' },
    ],
    body: null,
  };
  public instrumentColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'symbol' }),
    new TableDataColumn({ column: 'exchanges_connected' }),
    new TableDataColumn({ column: 'exchanges_failed' }),
  ];

  public mappingDataSource: TableDataSource = {
    header: [],
    body: null
  };
  public mappingColumnsToShow: Array<TableDataColumn>;


  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private instrumentsService: InstrumentsService,
    private exchangesService: ExchangesService,
  ) {
    super(route, router);
  }

  ngOnInit() {
    super.ngOnInit();

    this.getInstrumentData();
  }

  public declareMappingTable() {
    this.mappingDataSource.header = [
      { column: 'exchange_id', nameKey: 'table.header.exchange', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'external_instrument', nameKey: 'table.header.identifier', filter: { type: 'text', sortable: true } },
      { column: 'current_price', nameKey: 'table.header.current_price' },
      { column: 'last_day_vol', nameKey: 'table.header.last_day_vol' },
      { column: 'last_week_vol', nameKey: 'table.header.last_7days_vol' },
      { column: 'last_updated', nameKey: 'table.header.last_updated' },
      { column: 'actions', nameKey: 'table.header.actions' },
    ];

    this.mappingColumnsToShow = [
      new SelectCellDataColumn({
        column: 'exchange_id',
        inputs: {
          placeholder: 'Select',
          fieldType: 'select',
          small: true,
          selectedValue: (row) => {
            return {
              id: row.exchange_id,
              name: row.exchange_name
            };
          },
          isDisabled: (row) => {
            return !row.isNew;
          },
          items: (row) => {
            return this.exchanges;
          }
        },
        outputs: {
          valueChange: ({ value, row }) => {
            row.exchange_id = +value;
            row.external_instrument = null;
            // row.external_instrument_list = [];
            this.loading = true;
            this.exchangesService.getExchangeInstrumentIdentifiers(row.exchange_id)
            .subscribe(res => {
              row.external_instrument_list = _.sortBy(res.identifiers);
              this.loading = false;
            });
          }
        },
      }),
      new SelectCellDataColumn({
        column: 'external_instrument',
        inputs: {
          placeholder: 'Enter',
          fieldType: 'autocomplete',
          small: true,
          selectedValue: (row) => {
            return {
              id: row.external_instrument,
              name: row.external_instrument
            };
          },
          isDisabled: (row) => {
            return !row.external_instrument_list;
          },
          items: (row) => {
            if (!row.isNew) {
              return [{ id: row.external_instrument, name: row.external_instrument }];
            } else {
              return [
                ...(row.external_instrument_list || []).map(item => ({ id: item, name: item }))
              ];
            }
          },
        },
        outputs: {
          valueChange: ({ value, row }) => {
            this.loading = false;
            row.external_instrument = value;

            this.checkMapping(row);
          }
        }
      }),
      new TableDataColumn({ column: 'current_price' }),
      new NumberCellDataColumn({
        column: 'last_day_vol',
        inputs: {
          suffix: this.cryptoSuffix,
          digitsInfo: '1.0-2',
        }
      }),
      new NumberCellDataColumn({
        column: 'last_week_vol',
        inputs: {
          suffix: this.cryptoSuffix,
          digitsInfo: '1.0-2',
        }
      }),
      new DateCellDataColumn({ column: 'last_updated' }),
      new ActionCellDataColumn({ column: null,
        inputs: {
          actions: [
            new DataCellAction({
              label: 'Delete',
              isShown: (row: any) => !row.isDeleted && !row.isNew,
              exec: (row: any) => {
                this.deleteExchangeMapping(row);
              }
            }),
            new DataCellAction({
              label: 'Undo',
              isShown: (row: any) => row.isDeleted,
              exec: (row: any) => {
                this.undoExchangeMappingDeletion(row);
              }
            }),
            new DataCellAction({
              label: 'Undo',
              isShown: (row: any) => row.isNew,
              exec: (row: any) => {
                this.deleteExchangeMapping(row);
              }
            })
          ]
        }
      }),
    ];
  }

  private getInstrumentData(): void {
    this.route.params.pipe(
      mergeMap(
        params => zip(
          this.instrumentsService.getInstrument(params['id']),
          this.exchangesService.getAllExchanges(),
        )
      )
    ).subscribe(
      res => {
        const [{instrument}, { exchanges }] = res;

        this.instrumentDataSource.body = [instrument];
        [this.cryptoSuffix] = instrument.symbol.split('/');

        this.exchanges = exchanges;

        this.declareMappingTable();
      },
      err => this.instrumentDataSource.body = []
    );
  }

  public getAllData(): void {
    this.route.params.pipe(
      mergeMap(
        params => {
          return this.instrumentsService.getInstrumentExchangesMapping(params['id']);
        }
      )
    ).subscribe(
      res => {
        Object.assign(this.mappingDataSource, {
          body: res.mapping_data.map(data => Object.assign(data, {
            valid: true,
            isDeleted: false,
            isNew: false
          }) )
        });

        if (_.isEmpty(this.mappingDataSource.body)) {
          this.mappingDataSource.body.push( new InstrumentExchangeMap() );
        }
      },
      err => this.mappingDataSource.body = []
    );
  }

  public deleteExchangeMapping(mapping) {
    if (mapping.isNew) {
      _.remove(this.mappingDataSource.body, item => _.isEqual(item, mapping) );
    } else {
      mapping.isDeleted = true;
    }

    this.canSave();
  }

  public undoExchangeMappingDeletion(mapping) {
    mapping.isDeleted = false;

    this.canSave();
  }

  public addNewMapping(): void {
    if ( !this.canAddNewMapping() ) {
      return;
    }

    const lastItem = _.last(this.mappingDataSource.body);
    if ( !lastItem || lastItem.valid ) {
      this.mappingDataSource.body.push( new InstrumentExchangeMap() );
    } else {
      this.mappingDataSource.body[ this.mappingDataSource.body.length - 1 ] = new InstrumentExchangeMap();
    }

    this.canSave();
  }

  public canAddNewMapping(): boolean {
    if (!this.exchanges || !this.mappingDataSource.body) {
      return false;
    }
    return this.exchanges.length > this.mappingDataSource.body.length;
  }

  private checkMapping(row: any): void {
    if ( !row.exchange_id || !row.external_instrument ) {
      return;
    }

    const request = {
      exchange_id: row.exchange_id,
      external_instrument_id: row.external_instrument,
    };

    this.instrumentsService.checkMapping(request).subscribe(
      res => {
        if (res.mapping_status) {
          Object.assign(row, { valid: true });
        } else {
          this.deleteObjectProps(row);
          Object.assign(row, new InstrumentExchangeMap() );
        }
        this.canSave();
      }
    );
  }

  private deleteObjectProps(obj) {
    Object.keys(obj).map(key => { delete obj[key]; });
  }

  public saveMapping(ignoreDeleted: boolean = false): void {
    const exchange_mapping = _.chain(this.mappingDataSource.body)
    .map((item: InstrumentExchangeMap) => {
      if ( item.valid && !item.isDeleted ) {
        return {
          exchange_id: item.exchange_id,
          external_instrument_id: item.external_instrument
        };
      }
    })
    .compact()
    .value();

    const request: AddMappingRequestData = { exchange_mapping: exchange_mapping };

    this.loading = true;

    console.log('save mapping');
    this.route.params.pipe(
      mergeMap(
        params => this.instrumentsService.addMapping(params['id'], request).pipe(
          finalize(() => this.loading = false)
        )
      )
    ).subscribe(
      data => {
        if (data.success) {
          this.noChanges = true;
          this.router.navigate(['/instruments']);
        } else {
          console.log(data.error);
        }
      }
    );
  }

  public canSave() {
    const changes = this.mappingDataSource.body.filter(mapping => (mapping['isNew'] || mapping['isDeleted']) && mapping['valid']);
    if (changes.length) { this.noChanges = false; } else { this.noChanges = true; }
  }

  /**
   * Guard
   */

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return this.noChanges;
  }

  /**
   * Styles
   */

  public rowClass(row: InstrumentExchangeMap): string {
    if (row.isNew) { return 'color-light-green'; } else if (row.isDeleted) { return 'color-light-red'; }
    return '';
  }

}

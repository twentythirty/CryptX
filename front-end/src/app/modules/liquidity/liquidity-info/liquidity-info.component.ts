import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, finalize } from 'rxjs/operators';

import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataColumn, TableDataSource } from '../../../shared/components/data-table/data-table.component';
import { NumberCellDataColumn, DateCellDataColumn, StatusCellDataColumn } from '../../../shared/components/data-table-cells';

import { LiquidityService } from '../../../services/liquidity/liquidity.service';

@Component({
  selector: 'app-liquidity-info',
  templateUrl: './liquidity-info.component.html',
  styleUrls: ['./liquidity-info.component.scss']
})
export class LiquidityInfoComponent extends DataTableCommonManagerComponent implements OnInit {
  private cryptoSuffix: string;
  showDeleteConfirm: boolean = false;
  deleteLoading: boolean = false;

  public liquidityDataSource: TableDataSource = {
    header: [
      { column: 'instrument', nameKey: 'table.header.instrument' },
      { column: 'periodicity', nameKey: 'table.header.periodicity' },
      { column: 'quote_asset', nameKey: 'table.header.quote_asset' },
      { column: 'minimum_circulation', nameKey: 'table.header.minimum_daily_avg_volume' },
      { column: 'exchange', nameKey: 'table.header.exchange' },
      { column: 'exchange_count', nameKey: 'table.header.exchange_count' },
      { column: 'exchange_not_pass', nameKey: 'table.header.exchange_not_pass' },
    ],
    body: null,
  };
  public liquidityColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'instrument' }),
    new TableDataColumn({ column: 'periodicity' }),
    new TableDataColumn({ column: 'quote_asset' }),
    new NumberCellDataColumn({ column: 'minimum_circulation',  inputs: {
      digitsInfo: '1.2-2'
    } }),
    new StatusCellDataColumn({ column: 'exchange' }),
    new TableDataColumn({ column: 'exchange_count' }),
    new TableDataColumn({ column: 'exchange_not_pass' }),
  ];

  public exchangesDataSource: TableDataSource = {
    header: null,
    body: null
  };
  public exchangesColumnsToShow: Array<TableDataColumn>;

  constructor(
    public route: ActivatedRoute,
    private liquidityService: LiquidityService,
    public router: Router,
  ) {
    super(route, router);
  }

  ngOnInit() {
    super.ngOnInit();

    this.getLiquidityData();
  }


  private declareExchangesTable() {
    Object.assign(this.exchangesDataSource, {
      header: [
        { column: 'exchange', nameKey: 'table.header.exchange' },
        { column: 'instrument_identifier', nameKey: 'table.header.identifier' },
        { column: 'current_price', nameKey: 'table.header.current_price' },
        { column: 'last_day_vol', nameKey: 'table.header.last_day_vol' },
        { column: 'last_week_vol', nameKey: 'table.header.last_7days_vol' },
        { column: 'last_updated', nameKey: 'table.header.last_updated' },
        { column: 'passes', nameKey: 'table.header.liquidity_status' },
      ]
    });

    this.exchangesColumnsToShow = [
      new TableDataColumn({ column: 'exchange' }),
      new TableDataColumn({ column: 'instrument_identifier' }),
      new NumberCellDataColumn({
        column: 'current_price',
        inputs: {
          suffix: this.cryptoSuffix,
          digitsInfo: '1.0-7',
        }
      }),
      new NumberCellDataColumn({
        column: 'last_day_vol',
        inputs: {
          suffix: this.cryptoSuffix,
          digitsInfo: '1.2-2',
        }
      }),
      new NumberCellDataColumn({
        column: 'last_week_vol',
        inputs: {
          suffix: this.cryptoSuffix,
          digitsInfo: '1.2-2',
        }
      }),
      new DateCellDataColumn({ column: 'last_updated' }),
      new StatusCellDataColumn({ column: 'passes' }),
    ];
  }

  private getLiquidityData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.liquidityService.getLiquidity(params['id'])
      )
    ).subscribe(
      res => {
        this.liquidityDataSource.body = [res.liquidity_requirement];
        this.cryptoSuffix = res.liquidity_requirement.quote_asset;

        this.declareExchangesTable();
      },
      err => this.liquidityDataSource.body = []
    );
  }

  getAllData(): void {
    this.route.params.pipe(
      mergeMap(
        params => this.liquidityService.getExchanges(params['id'])
      )
    ).subscribe(
      res => {
        Object.assign(this.exchangesDataSource, {
          body: res.exchanges,
          footer: res.footer
        });
      },
      err => this.exchangesDataSource.body = []
    );
  }


  openDeleteConfirm(): void {
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
  }

  deleteLiquidity(): void {
    this.closeDeleteConfirm();
    this.deleteLoading = true;

    this.route.params.pipe(
      mergeMap(
        params => this.liquidityService.deleteLiquidity(params.id).pipe(
          finalize(() => this.deleteLoading = false)
        )
      )
    ).subscribe(
      res => {
        if (res.success) {
          this.router.navigate(['/liquidity_requirements']);
        }
      }
    );
  }

}

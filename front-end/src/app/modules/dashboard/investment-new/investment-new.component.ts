import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';

import { ModelConstantsService } from '../../../services/model-constants/model-constants.service';
import { InvestmentService } from '../../../services/investment/investment.service';
import { DataTableCommonManagerComponent } from '../../../shared/components/data-table-common-manager/data-table-common-manager.component';
import { TableDataSource, TableDataColumn } from '../../../shared/components/data-table/data-table.component';
import { CurrencyCellDataColumn,
         NumberCellDataColumn,
         PercentCellDataColumn,
         ActionCellDataColumn,
         DataCellAction,
         StatusCellDataColumn} from '../../../shared/components/data-table-cells';

@Component({
  selector: 'app-investment-new',
  templateUrl: './investment-new.component.html',
  styleUrls: ['./investment-new.component.scss']
})
export class InvestmentNewComponent extends DataTableCommonManagerComponent implements OnInit {

  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() onComplete: EventEmitter<any> = new EventEmitter();


  loading = false; // Is submit button loading
  tableLoading = false; // Is table loading

  next_step = false;
  showSelectedAssetsMix = false; // Show/hide selected asset mix
  showSkippedAssets = false; // Show/hide skipped assets
  tableTitle; // Selected/skipped assets table title

  readModalIsShown = false; // Show/hide rationale modal
  readData; // Rationale data

  pageSize = 999; // Table page size

  group_name = 'STRATEGY_TYPES';
  strategies = {}; // Strategy type list
  strategyType = null; // Selected strategy type
  isSimulated = null; // Selected mode
  assetGroup; // Created asset group id


  public assetDataSource: TableDataSource = {
    header: [
      { column: 'row_number', nameKey: 'common.row_number' },
      { column: 'symbol', nameKey: 'table.header.symbol', filter: { type: 'text', sortable: true } },
      { column: 'long_name', nameKey: 'table.header.long_name', filter: { type: 'text', sortable: true } },
      { column: 'capitalization', nameKey: 'table.header.capitalisation', filter: { type: 'number', sortable: true } },
      { column: 'nvt_ratio', nameKey: 'table.header.nvt_ratio', filter: { type: 'number', sortable: true } },
      { column: 'market_share', nameKey: 'table.header.market_share', filter: { type: 'number', sortable: true } }
    ],
    body: null
  };

  public assetColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'row_number' }),
    new TableDataColumn({ column: 'symbol' }),
    new TableDataColumn({ column: 'long_name' }),
    new CurrencyCellDataColumn({ column: 'capitalization' }),
    new NumberCellDataColumn ({ column: 'nvt_ratio' }),
    new PercentCellDataColumn({ column: 'market_share' }),
  ];

  runForm: FormGroup = new FormGroup({
    deposit_usd: new FormControl('', [Validators.required]),
    deposit_btc: new FormControl(''),
    deposit_eth: new FormControl('')
  });

  constructor(
    private modelConstantService: ModelConstantsService,
    private investmentService: InvestmentService,
    public route: ActivatedRoute,
    public router: Router,
  ) {
    super (route, router);
  }

  ngOnInit() {
    this.strategies = Object.entries(this.modelConstantService.getGroup(this.group_name));
    super.ngOnInit();
  }

  onChangeMode(value) {
    this.isSimulated = value;
    this.isValid();
  }

  onChangePortfolio(value) {
    this.strategyType = value[1];
    this.isValid();
  }

  // Check if mode and portfolio selected
  isValid() {
    if (this.isSimulated != null && this.strategyType != null) {
      this.next_step = true;
      this.showSelectedAssetsMix = true;
      this.createAssetMix();
    }
  }

  // Submit a new investment run
  Confirm() {
    if (this.showSelectedAssetsMix && !this.showSkippedAssets) {
      this.showSelectedAssetsMix = false;
      this.showSkippedAssets = true;
      this.getAllData();
    } else if (!this.showSelectedAssetsMix && this.showSkippedAssets) {
      this.showSkippedAssets = false;
      this.runForm.reset();
    } else if (!this.showSelectedAssetsMix && !this.showSkippedAssets && this.runForm.valid) {
      this.loading = true;

      const request = {
        strategy_type: this.strategyType,
        is_simulated: this.isSimulated,
        deposit_amounts: this.toArray(),
        investment_group_asset_id: this.assetGroup
      };

      this.investmentService.createInvestmentRun(request).pipe(
        finalize(() => this.loading = false)
      ).subscribe(
        data => {
          if (data.success) {
            this.onClose();
            this.onComplete.emit();
            this.router.navigate(['/run/investment', data.investment_run.id]);
          }
        }
      );
    }
  }


  createAssetMix() {
    if (this.next_step && this.showSelectedAssetsMix && !this.showSkippedAssets) {
      this.loading = true;

      const request = {
        strategy_type: this.strategyType
      };

      this.investmentService.createAssetMix(request).subscribe(data => {
        this.loading = false;

        if (data.success) {
          this.assetGroup = data.list.id;
          this.getAllData();
        }
      });
    }
  }


  // Get selected asset mix table
  getAllData() {
    this.loading = true;

    if (!this.showSelectedAssetsMix && this.showSkippedAssets) {
      this.getSkippedAssets();
    }
    if (this.next_step && this.showSelectedAssetsMix && !this.showSkippedAssets) {
      this.tableLoading = true;

      // load show only whitelisted
      this.requestData.filter.status = ['assets.status.400'];

      this.investmentService.getAssetMix(this.assetGroup, this.requestData).subscribe(
        res => {
          if (res.success) {
            this.assetDataSource.body = res.assets;
            this.assetDataSource.footer = res.footer;
            this.count = res.count;
            this.tableTitle = this.count + ' Selected asset mix';
            this.tableLoading = false;
            this.loading = false;
          }
        }
      );
    }
  }

  // Get Skipped assets table
  getSkippedAssets() {
    this.tableLoading = true;

    // Get table data
    this.requestData.filter.status = ['assets.status.401', 'assets.status.402'];
    this.requestData.order.push({ by: 'capitalization', order: 'desc' });

    this.investmentService.getAssetMix(this.assetGroup, this.requestData).subscribe(
      res => {
        if (res.success) {
          // Append new column
          this.assetDataSource.header.push(
            { column: 'status', nameKey: 'table.header.status' },
            { column: 'actions', nameKey: 'table.header.rationale' }
          );
          this.assetColumnsToShow.push(
            new StatusCellDataColumn({ column: 'status' }),
            new ActionCellDataColumn({ column: 'actions', inputs: {
              actions: [
                new DataCellAction({
                  label: 'READ',
                  exec: (row: any) => {
                    this.showReadModal({
                      title: 'Rationale',
                      content: row.comment
                    });
                  }
                })
              ]
            }})
          );

          // remove columns witch should not appear in this step
          _.remove(this.assetDataSource.header, item => item.column === 'row_number');
          _.remove(this.assetColumnsToShow, item => item.column === 'row_number');


          this.assetDataSource.body = res.assets;
          this.assetDataSource.footer = res.footer;
          this.count = res.count;
          this.tableTitle = this.count + ' Greylisted / blacklisted assets that were skipped';
          this.tableLoading = false;
          this.loading = false;
        }
      }
    );
  }

  // Form investment run creation request
  toArray() {
    const array = [];
    if (this.runForm.get('deposit_usd').value !== null) {
      const obj = {
        symbol: 'USD',
        amount: Number(this.runForm.get('deposit_usd').value)
      };
      array.push(obj);
    }
    if (this.runForm.get('deposit_btc').value !== null) {
      const obj = {
        symbol: 'BTC',
        amount: Number(this.runForm.get('deposit_btc').value)
      };
      array.push(obj);
    }
    if (this.runForm.get('deposit_eth').value !== null) {
      const obj = {
        symbol: 'ETH',
        amount: Number(this.runForm.get('deposit_eth').value)
      };
      array.push(obj);
    }
    return array;
  }

  // Show/hide skipped assets rationale modal
  showReadModal(data: { title: string, content: string }): void {
    this.readModalIsShown = true;
    this.readData = data;
  }

  hideReadModal(): void {
    this.readModalIsShown = false;
    this.readData = null;
  }

  // Set row color
  rowClass(row): string {
    if (row.status == 'assets.status.401') { return 'color-black'; }
    if (row.status == 'assets.status.402') { return 'color-gray'; }
    return '';
  }

  // Open asset details in a new tab
  openListRow(asset) {
    window.open('/#/assets/view/' + asset.id);
  }

  // Close investment run creation modal
  onClose() {
    this.close.emit();
  }

}

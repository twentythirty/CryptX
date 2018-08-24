import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { DataTableCommonManagerComponent } from "../../../shared/components/data-table-common-manager/data-table-common-manager.component";
import { ColdStorageService } from "../../../services/cold-storage/cold-storage.service";
import { TableDataSource, TableDataColumn } from "../../../shared/components/data-table/data-table.component";

@Component({
  selector: 'app-custodians-list',
  templateUrl: './custodians-list.component.html',
  styleUrls: ['./custodians-list.component.scss']
})
export class CustodiansListComponent extends DataTableCommonManagerComponent implements OnInit {

  public custodiansDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'name', nameKey: 'table.header.custodian', column_class: 'column-align-left column-padded-40', filter: { type: 'text', sortable: true } },
    ],
    body: null
  };

  public custodiansColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'name' }),
  ];

  constructor(
    private coldStorageService: ColdStorageService,
    public route: ActivatedRoute,
    public router: Router
  ) {
    super(route, router);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getAllData(): void {
    this.coldStorageService.getAllCustodians(this.requestData)
    .finally(() => this.stopTableLoading())
    .subscribe(
      res => {
        Object.assign(this.custodiansDataSource, {
          body: res.custodians,
          footer: res.footer
        });
        this.count = res.count;
      }
    )
  }

}

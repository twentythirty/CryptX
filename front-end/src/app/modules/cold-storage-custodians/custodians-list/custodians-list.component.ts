import { Component, OnInit } from '@angular/core';
import { DataTableCommonManagerComponent } from "../../../shared/components/data-table-common-manager/data-table-common-manager.component";
import { Router, ActivatedRoute } from "@angular/router";
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
      { column: 'name', nameKey: 'table.header.custodian', filter: { type: 'text', sortable: true }, column_class: 'column-align-left padded-40' },
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
      private router: Router
  ) { super (route)}

  ngOnInit() {
    super.ngOnInit();
  }

  getAllData(): void {
    this.coldStorageService.getAllCustodians(this.requestData).subscribe(
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

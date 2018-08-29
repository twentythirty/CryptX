import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { finalize } from 'rxjs/operators';

import { DataTableCommonManagerComponent } from "../../../shared/components/data-table-common-manager/data-table-common-manager.component";
import { TableDataSource, TableDataColumn } from "../../../shared/components/data-table/data-table.component";
import { DateCellDataColumn, StatusCellDataColumn, ActionCellDataColumn, DataCellAction } from "../../../shared/components/data-table-cells";
import { StatusClass } from "../../../shared/models/common";
import { RecipeRunsService } from "../../../services/recipe-runs/recipe-runs.service";
import { Recipe } from "../../../shared/models/recipe";

@Component({
  selector: 'app-recipe-run-list',
  templateUrl: './recipe-run-list.component.html',
  styleUrls: ['./recipe-run-list.component.scss']
})
export class RecipeRunListComponent extends DataTableCommonManagerComponent implements OnInit {

  public recipeDataSource: TableDataSource = {
    header: [
      { column: 'id', nameKey: 'table.header.id', filter: { type: 'number', hasRange: false, inputSearch: true, sortable: true } },
      { column: 'investment_run_id', nameKey: 'table.header.investment_run_id', filter: { type: 'text', sortable: true } },
      { column: 'created_timestamp', nameKey: 'table.header.creation_time', filter: { type: 'date', sortable: true } },
      { column: 'user_created', nameKey: 'table.header.creator', filter: { type: 'text', sortable: true } },
      { column: 'approval_status', nameKey: 'table.header.status', filter: { type: 'text', sortable: true } },
      { column: 'approval_user', nameKey: 'table.header.decision_by', filter: { type: 'text', sortable: true } },
      { column: 'approval_timestamp', nameKey: 'table.header.decision_time', filter: { type: 'date', sortable: true } },
      { column: 'approval_comment', nameKey: 'table.header.rationale' },
    ],
    body: null
  };

  public recipeColumnsToShow: Array<TableDataColumn> = [
    new TableDataColumn({ column: 'id' }),
    new TableDataColumn({ column: 'investment_run_id' }),
    new DateCellDataColumn({ column: 'created_timestamp' }),
    new TableDataColumn({ column: 'user_created' }),
    new StatusCellDataColumn({ column: 'approval_status', inputs: { classMap: { 
      'recipes.status.41': StatusClass.PENDING,
      'recipes.status.42': StatusClass.REJECTED,
      'recipes.status.43': StatusClass.APPROVED,
    }}}),
    new TableDataColumn({ column: 'approval_user' }),
    new DateCellDataColumn({ column: 'approval_timestamp'}),
    new ActionCellDataColumn({ column: 'approval_comment', inputs: {
      actions: [
        new DataCellAction({
          label: 'READ',
          isShown: row => row.approval_status !== 'recipes.status.41',
          exec: (row: any) => {
            this.showReadModal({
              title: 'Rationale',
              content: row.approval_comment
            })
          }
        })
      ]
    }}),
  ];

  public readModalIsShown: boolean = false;
  public readData: { title: string, content: string };

  constructor(
    public route: ActivatedRoute,
    protected recipeService: RecipeRunsService,
    public router: Router,
  ) {
    super (route, router)
  }

  ngOnInit() {
    super.ngOnInit();
    this.getFilterLOV();
  }

  getFilterLOV(): void {
    this.recipeDataSource.header.filter(
       col => ['id', 'investment_run_id', 'user_created', 'approval_status', 'approval_user'].includes(col.column)
    ).map(
      col => {
        col.filter.rowData$ = this.recipeService.getHeaderLOV(col.column);
      }
    );
  }

  getAllData(): void {
    this.recipeService.getAllRecipeRuns(this.requestData).pipe(
      finalize(() => this.stopTableLoading())
    ).subscribe(
      res => {
        Object.assign(this.recipeDataSource, {
          body: res.recipe_runs,
          footer: res.footer
        });
        this.count = res.count;
      }
    );
  }

  openRow(recipe: Recipe): void {
    this.router.navigate(['/run/recipe/', recipe.id]);
  }

  showReadModal(data: { title: string, content: string }): void {
    this.readModalIsShown = true;
    this.readData = data;
  }

  hideReadModal(): void {
    this.readModalIsShown = false;
    this.readData = null;
  }


}

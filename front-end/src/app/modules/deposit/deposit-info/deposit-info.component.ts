import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from "@angular/router";
import { DepositService, DepositResultData, DepositResponseData } from "../../../services/deposit/deposit.service";
import { Deposit, DepositStatus } from "../../../shared/models/deposit";
import { DepositListComponent } from "../deposit-list/deposit-list.component";
import { TableDataColumn } from "../../../shared/components/data-table/data-table.component";
import { ActionCellDataColumn, DataCellAction } from "../../../shared/components/data-table-cells/index";
import { FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { InvestmentService } from "../../../services/investment/investment.service";
import { mergeMap } from "rxjs/operators";
import { Observable } from "rxjs/Rx";
import { TimelineEvent } from "../../../shared/components/timeline/timeline.component";


@Component({
  selector: 'app-deposit-info',
  templateUrl: './deposit-info.component.html',
  styleUrls: ['./deposit-info.component.scss']
})
export class DepositInfoComponent extends DepositListComponent implements OnInit {

  public depositId: number;
  public activityLog: Array<DepositStatus>;
  public showConfirm = false;
  public showModal = false;
  public amount = '';
  public management_fee = '';
  public timeline$: Observable<object>;

  depositForm = new FormGroup({
    Amount: new FormControl('', [Validators.required]),
    Management_fee: new FormControl('', [Validators.required]),
  });

  constructor(public route: ActivatedRoute,
    protected depositService: DepositService,
    protected router: Router,
    protected investmentService: InvestmentService) {
    super(route, depositService, router);
  }


  ngOnInit() {
    this.getDeposit();
    this.getTimelineData();
  }

  private getDeposit(): void {
    this.route.params.filter(
      (params: Params) => params.depositId
    ).subscribe(
      (params: Params) => {
        this.depositId = params.depositId;
        this.depositService.getDeposit(this.depositId).subscribe(
          (res: DepositResultData) => {
            this.depositDataSource.body = [res.recipe_deposit];
            this.activityLog = res.status_changes
            this.count = 1;
            this.dataColumn();
          }
        )
      }
      )
  }

  dataColumn() {
   /* if (!_.find(this.depositDataSource.header, col => col.column == 'action')){
      if (this.depositDataSource.body[0].status === 151) { //pakeisti į 150
        this.depositDataSource.header.push({ column: 'action', nameKey: 'table.header.action' })
        this.depositColumnsToShow.push(
          new ActionCellDataColumn({
            column: null,
            inputs: {
              actions: [
                new DataCellAction({
                  label: '',
                  isShown: (row: any) => true,
                  exec: (row: any) => {
                    this.showModal = true;
                  }
                }),
              ]
            }
          }));
      }
    }*/
  }

  hideConfirm() {
    this.showConfirm = false;
  }

  hideModal() {
    this.showModal = false;
  }

  Confirm() {
    if (this.depositForm.valid) {
      let obj = {
        amount: this.amount,
        deposit_management_fee: this.management_fee
      }
      this.depositService.Submit(this.depositId, obj).subscribe(
        (res: DepositResponseData) => {
          if (res.success) {
            this.showModal = false;
            this.showConfirm = true;
          } else {
            console.log(res.deposit)
          }
        }, error => {
          console.log('Error', error);
        }, () => {
        });
    } else {
      this.markAsTouched(this.depositForm);
    }
  }

  markAsTouched(group) {
    Object.keys(group.controls).map((field) => {
      const control = group.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.markAsTouched(control);
      }
    });
  }

  protected getTimelineData(): void {
    this.timeline$ = this.investmentService.getAllTimelineData({ "deposits_id": this.depositId })
  }

  Send() {
    this.depositService.Approve(this.depositId).subscribe(
      (data: DepositResponseData) => {
        if (data.success) {
          this.showConfirm = false;
        } else {
          console.log(data.deposit)
        }
      }, error => {
        console.log('Error', error);
      }, () => {
      });
  }

}

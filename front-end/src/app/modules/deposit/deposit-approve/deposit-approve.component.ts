import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DepositService, DepositResponseData } from '../../../services/deposit/deposit.service';

@Component({
  selector: 'app-deposit-approve',
  templateUrl: './deposit-approve.component.html'
})
export class DepositApproveComponent implements OnInit {
  @Input() depositId: number;
  @Output() updateData = new EventEmitter();

  form = new FormGroup({
    amount: new FormControl(null, Validators.required),
    deposit_management_fee: new FormControl(null, Validators.required),
  });

  showModal: boolean = false;
  showConfirm: boolean = false;
  isSubmitDepositLoading: boolean = false;

  constructor(
    private depositService: DepositService
  ) { }

  ngOnInit() {
  }

  openModal() {
    this.showModal = true;
  }

  hideModal() {
    this.showModal = false;
    this.form.reset();
  }

  openConfirm() {
    this.showConfirm = true;
  }

  hideConfirm() {
    this.showConfirm = false;
    this.updateData.emit();
  }

  private getConvertedFormValue() {
    const val = this.form.value;
    Object.keys(val).map(key => val[key] = +val[key]);
    return val;
  }

  submitDeposit() {
    const request = this.getConvertedFormValue();

    this.isSubmitDepositLoading = true;

    this.depositService.Submit(this.depositId, request).subscribe(
      (res: DepositResponseData) => {
        this.isSubmitDepositLoading = false;

        if (res.success) {
          this.hideModal();
          this.openConfirm();
        } else {
          console.log(res.deposit);
        }
      }
    );
  }

  approveDeposit() {
    const request = this.getConvertedFormValue();

    this.depositService.Approve(this.depositId, request).subscribe(
      (data: DepositResponseData) => {
        if (data.success) {
          this.hideConfirm();
        } else {
          console.log(data.deposit);
        }
      }
    );
  }


}

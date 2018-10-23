import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ExchangesService } from '../../../services/exchanges/exchanges.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AssetService } from '../../../services/asset/asset.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-exchange-accounts-add',
  templateUrl: './exchange-accounts-add.component.html',
  styleUrls: ['./exchange-accounts-add.component.scss']
})
export class ExchangeAccountsAddComponent implements OnInit {

  exchanges: Array<{ id: number, value: string }>;
  assets: Array<{ id: number, value: string }>;
  exchangeAccountId;
  buttonName;
  isActive;

  loading = false;
  exchangesLoading = true;
  assetsLoading = true;

  showDeactivateConfirm = false;
  showErrorModal = false;

  form: FormGroup = new FormGroup({
    exchangeId: new FormControl({value: '', disabled: false}, Validators.required),
    assetId: new FormControl({value: '', disabled: false}, Validators.required),
    address: new FormControl({value: '', disabled: false}, Validators.required),
  });

  constructor(
    private exchangesService: ExchangesService,
    public router: Router,
    private assetService: AssetService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // get exchangeAccountId from url
    this.route.params.pipe(
      filter(params => params.id)
    ).subscribe(params => {
      this.exchangeAccountId = params.id;

      this.exchangesService.getSingleExchangeAccount(this.exchangeAccountId).subscribe(res => {
        this.form.disable();
        this.form.controls.exchangeId.setValue(res.exchange_account.exchange_id);
        this.form.controls.assetId.setValue(res.exchange_account.asset_id);
        this.form.controls.address.setValue(res.exchange_account.address);

        if (res.exchange_account.is_active === 'exchange_accounts.is_active.active') {
          this.buttonName = 'Deactivate';
          this.isActive = true;
        } else if (res.exchange_account.is_active === 'exchange_accounts.is_active.inactive') {
          this.buttonName = 'Activate';
          this.isActive = false;
        }
      });
    });

    const getMVPExchanges = false;
    this.exchangesService.getAllExchanges(getMVPExchanges).subscribe(res => {
      this.exchangesLoading = false;
      this.exchanges = res.exchanges.map(exchange => {
        return {
          id: exchange.id,
          value: exchange.name,
        };
      });
    });

    this.assetService.getAllAssets().subscribe(res => {
      this.assetsLoading = false;
      this.assets = res.assets.map(asset => {
        return {
          id: asset.id,
          value: `${asset.long_name} (${asset.symbol})`
        };
      });
    });
  }

  addExchangeAccount() {
    if (this.form.invalid) {
      return;
    }
    const request = {
      account_type: 201,
      asset_id: this.form.controls.assetId.value,
      address: this.form.controls.address.value,
      is_active: true
    };
    const exchangeId = this.form.controls.exchangeId.value;

    this.loading = true;
    this.exchangesService.createExchangeAccount(request, exchangeId).subscribe(res => {
      if (res.success) {
        this.router.navigate(['/exchange_accounts']);
      }
    }, error => {
      console.log('Error', error);
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  editExchangeAccount() {
    const request = {
      is_active: !this.isActive
    };

    this.loading = true;
    this.exchangesService.editExchangeAccountData(request, this.exchangeAccountId).subscribe(res => {
      if (res.success) {
        this.showDeactivateConfirm = false;
        this.router.navigate(['/exchange_account']);
      }
    }, error => {
      console.log('Error', error);
      this.showErrorModal = true;
      this.showDeactivateConfirm = false;
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }
}

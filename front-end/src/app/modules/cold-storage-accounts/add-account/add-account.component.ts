import { Component, OnInit } from '@angular/core';
import { ModelConstantsService } from "../../../services/model-constants/model-constants.service";
import { AssetService } from "../../../services/asset/asset.service";
import { ColdStorageService } from "../../../services/cold-storage/cold-storage.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import _ from 'lodash';
import { Router } from "@angular/router";

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss']
})
export class AddAccountComponent implements OnInit {

  strategies = [];
  assets = [];
  custodians = [];

  buttonLoading: boolean = false;

  strategiesLoading: boolean = true;
  assetsLoading: boolean = true;
  custodiantsLoading: boolean = true;

  form: FormGroup = new FormGroup({
    strategy_type: new FormControl('', Validators.required),
    asset_id: new FormControl('', Validators.required),
    custodian_id: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required)
  });

  constructor(private modelConstantService: ModelConstantsService,
              private assetService: AssetService,
              private coldStorageService: ColdStorageService,
              private router: Router) { }

  ngOnInit() {
    this.getStrategies();
    this.getAssets();
    this.getCustodians();
  }

  getStrategies(){
      let group_name = 'STRATEGY_TYPES';
      Object.entries(this.modelConstantService.getGroup(group_name)).map((item, index) => {
        this.strategies[index]= {
          id: item[1],
          value: item[0]
        }
        this.strategiesLoading = false;
      })
  }

  getAssets(){
      this.assetService.getAllAssets().subscribe(res => {
      this.assetsLoading = false;
      this.assets = res.assets.map(asset => {
        return {
          id: asset.id,
          value: asset.symbol,
        };
      });
    });
  }

  getCustodians(){
    this.coldStorageService.getAllCustodians().subscribe(res => {
      this.custodiantsLoading = false;
      this.custodians = res.custodians.map(custodian => {
        return {
          id: custodian.id,
          value: custodian.name
        };
      });
    });
  }

  // reset form group control value if user dont pick anything from autocomplete
  ValueChanged(value, controlName) {
    if (typeof value === 'string') {
      this.form.controls[ controlName ].setValue('');
    }
  }

  Add(){
    const request = _.mapValues(this.form.value, val => {
      return typeof val === 'object' ? val.id : val;
    });

    this.buttonLoading = true;

    this.coldStorageService.addAccount(request)
    .finally(() => this.buttonLoading = false)
    .subscribe(
      data => {
        if (data.success) {
          this.router.navigate(['/cold_storage/accounts']);
        } else {
          console.log(data.error);
        }
      }
    );
  }

}

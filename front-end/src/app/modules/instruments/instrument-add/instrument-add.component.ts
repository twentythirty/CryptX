import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';

import { AssetService } from '../../../services/asset/asset.service';
import { InstrumentsService } from '../../../services/instruments/instruments.service';

@Component({
  selector: 'app-instrument-add',
  templateUrl: './instrument-add.component.html',
  styleUrls: ['./instrument-add.component.scss']
})
export class InstrumentAddComponent implements OnInit {
  assets: Array<Object> = [];
  loading = false;
  assetsLoading = true;

  form: FormGroup = new FormGroup({
    transaction_asset_id: new FormControl('', Validators.required),
    quote_asset_id: new FormControl('', Validators.required),
  });

  constructor(
    private assetService: AssetService,
    private instrumentsService: InstrumentsService,
    public router: Router,
  ) { }

  ngOnInit() {
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

  saveInstrument() {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    this.instrumentsService.createInstrument(this.form.value).pipe(
      finalize(() => this.loading = false)
    ).subscribe(
      res => {
        if (res.success) {
          this.router.navigate(['/instrument/', res.instrument.id]);
        } else {
          console.log(res.error);
        }
      },
      err => {}
    );
  }

}

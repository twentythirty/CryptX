import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import _ from 'lodash';

import { AuthService } from '../../../services/auth/auth.service';
import { AssetService } from '../../../services/asset/asset.service';
import { InstrumentsService } from '../../../services/instruments/instruments.service';

@Component({
  selector: 'app-instrument-add',
  templateUrl: './instrument-add.component.html',
  styleUrls: ['./instrument-add.component.scss']
})
export class InstrumentAddComponent implements OnInit {
  assets: Array<Object> = [];
  loading: boolean = false;
  assetsLoading: boolean = true;

  form: FormGroup = new FormGroup({
    transaction_asset_id: new FormControl('', Validators.required),
    quote_asset_id: new FormControl('', Validators.required),
  });

  constructor(
    private authService: AuthService,
    private assetService: AssetService,
    private instrumentsService: InstrumentsService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.assetService.getAllAssets().subscribe(res => {
      this.assetsLoading = false;
      this.assets = res.assets.map(asset => {
        return {
          id: asset.id,
          value: asset.long_name
        };
      });
    });
  }

  // reset form group control value if user dont pick anything from autocomplete
  assetValueChanged(value, controlName) {
    if (typeof value === 'string') {
      this.form.controls[ controlName ].setValue('');
    }
  }

  saveInstrument() {
    this.loading = true;

    this.instrumentsService.createInstrument(this.form.value).pipe(
      finalize(() => this.loading = false)
    ).subscribe(
      data => {
        if (data.success) {
          this.router.navigate(['/instrument/', data.instrument.id]);
        } else {
          console.log(data.error);
        }
      }
    );
  }

}

import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-rationale-modal',
  templateUrl: './rationale-modal.component.html',
  styleUrls: ['./rationale-modal.component.scss']
})
export class RationaleModalComponent implements OnInit {

  public screen: string = 'INPUT';
  public form: FormGroup;

  @Input() data: any;
  @Output() close = new EventEmitter();

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      rationale: [null, Validators.required]
    })
  }

  public submit(): void {
    if(this.form.valid) {
      this.screen = 'SUCCESS';
      this.finish();
    } else {
      this.screen = 'ERROR';
    }
  }

  public back(): void {
    this.screen = 'INPUT';
  }

  public finish(): void {
    this.close.emit({
      rationale: this.form.value.rationale,
      data: this.data
    });
  }

  public dismiss(): void {
    this.close.emit(null);
  }

}

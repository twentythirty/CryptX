import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';


@Component({
  selector: 'app-button-back',
  templateUrl: './button-back.component.html',
  styleUrls: ['./button-back.component.scss']
})
export class ButtonBackComponent {
  @Input() heading: string;

  constructor(
    private location: Location
  ) { }

}

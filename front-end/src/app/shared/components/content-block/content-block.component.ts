import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-content-block',
  templateUrl: './content-block.component.html',
  styleUrls: ['./content-block.component.scss']
})
export class ContentBlockComponent implements OnInit {
  @Input() heading: string; // block h2 heading text
  @Input() name: string;
  @Input() type: string;
  @Input() value: any;

  constructor() { }

  ngOnInit() {
  }

}

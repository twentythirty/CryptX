import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-page-heading',
  templateUrl: './page-heading.component.html',
  styleUrls: ['./page-heading.component.scss']
})
export class PageHeadingComponent implements OnInit {
   @Input() heading: string;

  constructor() { }

  ngOnInit() {
  }

}

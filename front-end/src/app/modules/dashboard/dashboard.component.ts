import { NgModule, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [],
  providers: []
})
export class DashboardModule { }
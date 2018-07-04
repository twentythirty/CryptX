import { NgModule, Component, OnInit } from '@angular/core';
import { ModelConstantsService } from '../../services/model-constants/model-constants.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(private modelConstants: ModelConstantsService) { }

  ngOnInit() {
  }

}

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule // enables json pipe
  ],
  providers: []
})
export class DashboardModule { }
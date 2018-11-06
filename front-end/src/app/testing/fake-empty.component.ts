import { NgModule, Component } from '@angular/core';


@Component({
  selector: 'app-fake-empty',
  template: '',
  styles: []
})
export class FakeEmptyComponent {

  constructor() { }

}

@NgModule({
  declarations: [
    FakeEmptyComponent
  ],
  exports: [
    FakeEmptyComponent
  ]
})
export class FakeEmptyModule {}

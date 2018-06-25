import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import _ from 'lodash';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  @Input() page: number = 1;
  @Input() count: number;
  @Input() perPage: number = 20;
  @Input() loading: boolean;
  @Input() pagesToShow: number = 5;

  @Output() goFirst = new EventEmitter<boolean>();
  @Output() goLast = new EventEmitter<number>();
  @Output() goPrev = new EventEmitter<boolean>();
  @Output() goNext = new EventEmitter<boolean>();
  @Output() goPage = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {

  }

  onFirst(): void {
    this.goFirst.emit();
  }

  onLast(): void {
    const lastPage = this.getLastPage();

    this.goLast.emit(lastPage);
  }

  onPage(n: number): void {
    this.goPage.emit(n);
  }

  onPrev(): void {
    this.goPrev.emit();
  }

  onNext(next: boolean): void {
    this.goNext.emit();
  }

  isLastPage(): boolean {
    return this.perPage * this.page >= this.count;
  }

  getLastPage() {
    return Math.ceil(this.count / this.perPage);
  }

  getPages(): number[] {
    const pagesToShow = this.pagesToShow;
    const currentPage = this.page;
    const count = this.getLastPage();

    let pageRangeFrom = currentPage - Math.ceil((pagesToShow - 1) / 2);
    let pageRangeTo = pageRangeFrom + pagesToShow;

    if ( pageRangeFrom < 1 ) {
      pageRangeFrom = 1;
      pageRangeTo = count > pagesToShow ? pagesToShow + 1 : count + 1;
    }
    else if ( pageRangeTo > count ) {
      pageRangeTo = count + 1;
      pageRangeFrom = count - pagesToShow < 1 ? 1 : count - pagesToShow + 1;
    }

    return _.range( pageRangeFrom, pageRangeTo );
  }

}

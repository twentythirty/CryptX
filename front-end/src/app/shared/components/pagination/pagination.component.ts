import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  @Input() count: number; // total records count
  @Input() page: number = 1; // page number
  @Input() perPage: number = 20; // how much records show per single page
  @Input() pagesToShow: number = 5; // how much pages buttons to show between arrows buttons
  @Input() loading: boolean; // is Table loading

  constructor(
    private router: Router
  ) { }

  onFirst(): void {
    this.page = 1;
    this.onPageChange();
  }

  onLast(): void {
    this.page = this.getLastPage();
    this.onPageChange();
  }

  onPage(n: number): void {
    this.page = n;
    this.onPageChange();
  }

  onPrev(): void {
    this.page--;
    this.onPageChange();
  }

  onNext(): void {
    this.page++;
    this.onPageChange();
  }

  onPageChange() {
    this.router.navigate([], {
      queryParamsHandling: 'merge',
      queryParams: {
        page: this.page
      },
      skipLocationChange: false
    });
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

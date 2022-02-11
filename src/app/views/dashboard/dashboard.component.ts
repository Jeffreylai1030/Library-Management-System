import { BorrowDto } from 'src/app/models/borrow-dto';
import { BorrowService } from 'src/app/services/borrow.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EChartsOption } from 'echarts';
import { BookService } from 'src/app/services/book.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private bookService: BookService,
    private borrowService: BorrowService,
    private datePipe: DatePipe,
  ) {}

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  dataSource!: MatTableDataSource<any>;

  today = new Date();
  chartTitle = 'New Borrowed Last 7 Days';
  totalBooksNumber = 0;
  totalBorrowsNumber = 0;
  totalTodayBorrowsNumber = 0;
  totalBorrowsExpiredNumber = 0;
  borrows: BorrowDto[] = [];
  chartOption: EChartsOption = {};
  displayedColumns = ['date', 'number'];
  selectedTab = 'lastWeek';
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  ngOnInit() {
    this.bookService.get().subscribe(item => {
      this.totalBooksNumber = item.length;
    })

    this.borrowService.get().subscribe(item => {
      this.borrows = item;
      this.totalBorrowsNumber = item.length;
      this.totalTodayBorrowsNumber = item.filter(x => this.datePipe.transform(x.addDate.toDate(), 'yyyy-MM-dd') === this.datePipe.transform(new Date(), 'yyyy-MM-dd'))?.length;
      this.totalBorrowsExpiredNumber = item.filter(x => x.dueDate.toDate().toISOString().substring(0, 10) <= new Date().toISOString().substring(0, 10)).length;

      this.onTabChange('lastWeek');
    })
  }

  getByBorrowedDateRange(startDate: Date, endDate: Date) {
    this.borrowService.getByBorrowedDateRange(startDate, endDate).subscribe(item => {
      this.borrows = item;
    })
  }

  // Trigger when change the tab for date range reports
  onTabChange(value: string) {
    const endDate = new Date();

    if (value === 'lastWeek') {
      this.chartTitle = 'New Borrowed Last 7 Days';
      const startDate = new Date(new Date().setDate(new Date().getDate() - 6));
      this.generateLineChart(startDate, endDate);
    } else if (value === 'lastMonth') {
      this.chartTitle = 'New Borrowed Last 30 Days';
      const startDate = new Date(new Date().setDate(new Date().getDate() - 29));
      this.generateLineChart(startDate, endDate);
    }
  }

  onChartChange() {
    const startDate = this.dateRange.value.start;
    const endDate = this.dateRange.value.end;
    this.selectedTab = '';
    this.chartTitle = `New Borrowed ${this.datePipe.transform(startDate, 'mediumDate')} ~ ${this.datePipe.transform(endDate, 'mediumDate')}`;

    console.log(startDate, endDate);

    this.generateLineChart(startDate, endDate);
  }

  generateLineChart(startDate: Date, endDate: Date) {
    this.getByBorrowedDateRange(startDate, endDate);

    let data: any = [];
    let xAxis: string[] = [];
    let yAxis: number[] = [];
    let count = 0;

    let startDateStr = this.datePipe.transform(startDate, 'yyyy-MM-dd');
    let endDateStr = this.datePipe.transform(endDate, 'yyyy-MM-dd');

    console.log(`start: ${startDateStr}, end: ${endDateStr}`);

    while (startDate <= endDate) {
      const pastDate = this.datePipe.transform(startDate, 'yyyy-MM-dd') || '';
      const pastData = this.borrows.filter(x => this.datePipe.transform(x.borrowedDate.toDate(), 'yyyy-MM-dd') === pastDate).length;

      xAxis.push(pastDate);
      yAxis.push(pastData);
      data.push({ date: pastDate, number: pastData });
      count++;
      startDate.setDate(startDate.getDate() + 1);
    }

    // Restore the original startDate, else it will change the date range
    startDate.setDate(startDate.getDate() - count);

    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.chartOption = {
      legend: {
        data: ['Books']
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      xAxis: {
        type: 'category',
        data: xAxis, // Past 7 days Date
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Books',
          data: yAxis, // Number of books
          type: 'line',
        },
      ],
    };
  }

}
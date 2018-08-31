import { Component, OnInit, OnDestroy,AfterViewInit,ViewChild,ViewEncapsulation } from '@angular/core';
import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';

import { BookingService, BookingStates } from 'app/layout/booking/booking.service';
import { Moment } from 'moment';
import { MatPaginator } from '@angular/material';
import { Lang } from 'app/shared/services';

var moment = require('moment');

@Component({
  selector: 'app-tableview',
  templateUrl: './tableview.component.html',
  styleUrls: ['./tableview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableviewComponent implements OnInit,OnDestroy, AfterViewInit {

  isShow:boolean = false;
  loading = false;
  private componetDestroyed = new Subject();

  bookings:Array<any>;
  private date : string;
  private shiftId:number;

  isAllShifts = false;
  displayedColumns;
  dataSource;
  //@ViewChild(MatPaginator) paginator: MatPaginator;


  pageSize = 10;
  pageNumber = 0;
  offSet = 0;
  totalElements = 0;
  custom_messages = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: this.lang.get('NO_DATA_TO_DISPLAY')['value'],

    // Footer total message
    totalMessage: this.lang.get('TOTAL')['value']
  };

  columns = [
    {
      name: this.lang.get('GUESTS_BOOKINGS_NUMBER')['value'],
      prop: 'booking_number',
      flexGrow: 1
    },

    {
      name: this.lang.get('DATE')['value'],
      prop: 'date',
      flexGrow: 2
    },

    {
      name: this.lang.get('TIME')['value'],
      prop: 'time',
      flexGrow: 1
    },

    {
      name: this.lang.get('HOURS')['value'],
      prop: 'hours',
      flexGrow: 1
    },

    {
      name: this.lang.get('NUMBER_OF_PEOPLE')['value'],
      prop: 'number_of_people',
      flexGrow: 2
    },

    {
      name: this.lang.get('STATUS')['value'],
      prop: 'status',
      flexGrow: 2
    },

    {
      name: this.lang.get('GUESTS_BOOKINGS_NAME')['value'],
      prop: 'name',
      flexGrow: 2
    },

    {
      name: this.lang.get('PHONE_NUMBER')['value'],
      prop: 'phone',
      flexGrow: 3
    },

    {
      name: this.lang.get('EMAIL_ADDRESS')['value'],
      prop: 'email',
      flexGrow: 3
    },

    {
      name: this.lang.get('DETAIL')['value'],
      prop: 'link',
      flexGrow: 2
    }
  ];
  constructor(
    private actions         : ActionsService,
    private bookingService  : BookingService,
    private lang            : Lang) {


    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe(
      action => {
        switch ( action.action ){
          case BookingAction.Search:
            if(action.param2) break;
            this.initialize( action.param1 );
          case BookingAction.ReSet:
            this.search();
            break;
        }
      });

  }

  ngOnInit() {
    //this.setPage({ offset: 0 });
    this.displayedColumns = [ 'booking_number', 'date', 'time','hours','number_of_people', 'status', 'name','phone','email', 'link'];
  }

  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }
  ngAfterViewInit() {
  }

  getToalNumberAndBookings( date:string, shift_id:number ){
    this.startLoading();
    this.bookingService.getToalNumberBookings(date, shift_id, '').subscribe(
      res => {
        this.totalElements = parseInt( res.data );

        this.getBookings( date, shift_id, this.offSet, this.pageSize );
        this.endLoading();
      },
      err => {
        this.bookings = [];
        this.endLoading();
      });
  }
  getBookings(date:string, shift_id:number, offsetNumber:number, pageSize:number ){
    this.startLoading();
    this.bookingService.getBookings(date, shift_id, '', offsetNumber, pageSize).subscribe(
      res => {
        const data = res.data.map(v => {
          return {
            ...v,
            time: moment(v.time, 'hh:mm:ss').format('hh:mm A')
          };
        });

        this.bookings = res.data;
        this.bookings.forEach( booking =>{
          let status = this.lang.get( this.getStatusName(booking.status) )
          booking.status = status['value'];
          booking.time = moment(booking.time, 'hh:mm:ss').format('hh:mm A');
          booking.link = "<a>"+this.lang.get( "GUESTS_BOOKINGS_MORE" )['value']+"</a>";
        });
// console.log( res.data );
// console.log( offsetNumber );
// console.log( pageSize );
        this.dataSource = new BookingDataSource(data);
        this.actions.toggleBookingAction( BookingAction.Searched, this.bookings);
        this.endLoading();
      },
      err => {
        this.bookings = [];
        this.endLoading();
      });
  }
  getStatusName( statusId: string ){
    let  state = BookingStates.find( status => status.id == statusId );
    return state? state.name : "";
  }
  selectBooking( event ){ //bookingId: number ){
    if ( event.type == "click" ) {
        const booking = event.row;
        this.actions.toggleBookingAction( BookingAction.Select, booking, false );
    }
  }

  initialize( info ){
    this.date = info.date;
    this.shiftId = info.shift.id;
    this.isAllShifts = info.isAllShift;
    if( this.isAllShifts == true )
      this.shiftId = 0;

  }
  search(){
    this.getToalNumberAndBookings( this.date, this.shiftId );
  }
    /**
   * Populate the table with new data based on the page number
   * @param page The page to select
   */
  setPage(pageInfo){
    this.pageNumber = pageInfo.offset;
    let offSetNumber = this.pageNumber * this.pageSize;

    this.getBookings( this.date, this.shiftId, offSetNumber, this.pageSize );
  }
   //------- Spinner start -----------------
   private startLoading() {
    this.loading = true;
  }

  private endLoading() {
    this.loading = false;
  }
  //------- Spinner start -----------------
}
export interface Booking {
  id:number,
  booking_number: number,
  date: string;
  time: string;
  hours: number;
  number_of_people: number;
  status: string;
  name: string;
  phone: string;
  email: string;
  link: string;
}

export class BookingDataSource extends DataSource<any> {
  data: Booking[];
  constructor(data: Booking[]) {
    super();
    this.data = data;
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Booking[]> {
    return of(this.data);
  }

  disconnect() { }
}

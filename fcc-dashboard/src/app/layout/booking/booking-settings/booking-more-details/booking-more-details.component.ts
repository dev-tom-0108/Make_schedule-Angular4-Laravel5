import { Component, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';

import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { BookingStates } from 'app/layout/booking/booking.service';
import { ApiService } from 'app/api.service';

import { Moment } from 'moment';
var moment = require('moment');

@Component({
  selector: 'app-booking-more-details',
  templateUrl: './booking-more-details.component.html',
  styleUrls: ['./booking-more-details.component.scss']
})
export class BookingMoreDetailsComponent implements OnInit {

  loading:boolean = false;
  isShow:boolean = false;
  isShowEdit:boolean = false;
  isCurrentBooking:boolean = true;
  private componetDestroyed = new Subject();

  public booking: any = {};
  public guest:any={};

  public sizeOfTotalBookings;
  public sizeOfNoShows;
  public sizeOfCanceledBookings;

  displayedColumns;
  dataSource;

  constructor(
    private actions: ActionsService,
    private apiService: ApiService) {

    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
      action => {
        switch ( action.action ){
          case BookingAction.ShowMoreDetails:
            this.afterShowDetails( action.param1, action.param2, action.param3 );
            break;
          case BookingAction.HideMoreDetails:     
            this.isShow = false; 
            this.isShowEdit = false;         
            break;
          case BookingAction.HideEdit:
            this.isShowEdit = false;
            break;  
          case BookingAction.Updated:
            this.afterUpdatedBooking( action.param1, action.param2 );
            break;          
        }
      });
  }
  ngOnInit() {
    this.displayedColumns = ['id', 'date', 'time', 'guests', 'status', 'link'];
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }

  afterShowDetails( booking:any, isShowEdit:boolean, isCurrentBooking:boolean ){

    this.booking = { ...booking };
    this.isShow = true;
    this.isShowEdit = isShowEdit;
    this.isCurrentBooking = isCurrentBooking;

    this.getInformation( booking.guest_id );
    if ( this.isShowEdit) this.showEdit(); 
  }
  afterUpdatedBooking( booking, isCurrent ){
    this.booking = { ...booking };
    this.isShowEdit = false; 
    this.isCurrentBooking = isCurrent; 
    this.getInformation( booking.guest_id);    
  }
  getInformation( guestId: number ){
    this.getGuest( guestId );
    this.getGuestBookingById( guestId );
  }
  getGuest(guestId:number) {
    this.startLoading();
    this.apiService.getGuestById(guestId).subscribe(
      res => {
        this.guest = res.data;
        this.endLoading();
      },
      err=>{
        this.guest = {};
        this.endLoading();
      }
    );
  }
  getGuestBookingById( guestId:number ){
    this.startLoading();
    this.apiService.getBookingsByGuestId(guestId).subscribe(
      res => {
        const data = res.data.map(v => {
          return {
            ...v,
            time: moment(v.time, 'hh:mm:ss').format('hh:mm A'),
            email: this.guest.email,
            guest_tags: this.guest.tags,
            name: this.guest.name,
            phone: this.guest.phone
          };
        });
        this.endLoading();

        this.sizeOfTotalBookings = data.length;
        this.sizeOfNoShows = data.filter(booking => booking.status === 'No show').length;
        this.sizeOfCanceledBookings = data.filter(booking => booking.status === 'Cancel').length;
        this.dataSource = new BookingDataSource(data);
      },
      err=>{
        this.endLoading();
      }
    );    
  }

  convertDateString(date: string){
    return moment( date, 'YYYY-MM-DD').format('D MMM YYYY');
  }
  convertTimeString( time: string ){
    return moment( time, "hh:mm").format("hh:mm A")
  }
  getTablesNameString( tables:Array<any> ){
    return tables ? tables.map( table => { return table.name }).join(" , ") : "";
  }
  getStatusName( statusId: string ){
    let  state = BookingStates.find( status => status.id == statusId );
    return state? state.name : "";
  }

  selectBooking( bookingId: number ){
    let b_item = this.dataSource.data.find( booking => booking.id == bookingId );
    this.actions.toggleBookingAction( BookingAction.Select, b_item, false );
  }

  showEdit() {
    this.isShowEdit = true;
    this.actions.toggleBookingAction( BookingAction.Edit, this.booking, this.isCurrentBooking );
  }
  close() {
    this.actions.toggleBookingAction( BookingAction.HideMoreDetails );
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
  id: string;
  booking_number: number,
  date: string;
  time: string;
  number_of_people: number;
  status: string;
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

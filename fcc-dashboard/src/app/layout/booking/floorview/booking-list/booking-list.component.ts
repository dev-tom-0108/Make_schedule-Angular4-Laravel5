import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Moment } from 'moment';
import { BookingStates, BookingService } from '../../booking.service';
import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { DefaultAvatarImg } from 'app/layout/header.service';

var moment = require('moment');

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.scss']
})
export class BookingListComponent implements OnInit, OnDestroy {

  public loading:boolean = false;
  public bookingStates = BookingStates;
  private componetDestroyed = new Subject();
  public defaultAvatar = DefaultAvatarImg;

  public staffs:Array<any> = [];
  public bookings:Array<any> = [];
  public selectedBookingId = -1;
  public selectedStaffId = -1;
  public date : string;
  public shiftId:number;
  public searchStr ='';

  constructor( 
    private actions:ActionsService,
    private bookingService:BookingService) { 

    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
      action => {
        switch ( action.action ){
          case BookingAction.Search:
            if (action.param2) break;
            this.initialize( action.param1 );
          case BookingAction.ReSet:
            this.search();
            break;
            
        }
      });
  }

  ngOnInit() {
    //this.getStaffs();
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }  
//---- Get data from API Start---------- 
  getStaffs(date:string, shift_id:number, search:string){
    this.startLoading();
    this.bookingService.getStaffs(date, shift_id, search).subscribe(
      res => { 
        this.staffs = res.data;//.filter( staff => staff.role === 1);
        this.actions.toggleBookingAction( BookingAction.SearchedStaff, this.staffs); 
        this.selectedStaffId = -1;
        this.endLoading();
      },
      err => {
        this.staffs = [];
        this.selectedStaffId = -1;
        this.endLoading();
      });
  }
  getBookings(date:string, shift_id:number, search:string){
    this.startLoading();
    this.bookingService.getBookings(date, shift_id, search).subscribe(
      res => { 
        this.bookings = res.data;
        console.log( res.data );
        this.actions.toggleBookingAction( BookingAction.Searched, this.bookings);        
        this.selectedBookingId = -1;
        this.endLoading();
      },
      err => {
        this.bookings = [];
        this.selectedBookingId = -1;        
        this.endLoading();
      });
  }
  //---- Get data from API end----------
  initialize( info ){
    this.date = info.date;
    this.shiftId = info.shift.id;    
  }

  search(){
    this.getBookings(this.date, this.shiftId, this.searchStr);
    this.getStaffs( this.date, this.shiftId, this.searchStr);
  }

  getLengthBookingsOfStatus( bookstate:string ){
    return this.getBookingsOfStatus( bookstate ).length;
  }

  getBookingsOfStatus( bookstate:string ){
    if (bookstate == this.bookingStates[1].id ){
      return this.bookings.filter( book =>  book.tables.length == 0 );
    }else{
      return this.bookings.filter( book => book.status == bookstate && book.tables.length != 0 );     
    }
  }

  getTablesNameString( tables:Array<any> ){
    return tables.map( table => { return table.name }).join(" | ");
  }

  convertTimeString( time: string ){
    return moment( time, "hh:mm").format("hh:mm A")
  }

  getLengthStaffsFromAssignStatus(isAssigned:boolean ){
    return this.getStaffsFromAssignStatus( isAssigned ).length;
  }

  getStaffsFromAssignStatus( isAssigned : boolean ){
    return this.staffs.filter( staff => ( isAssigned ? staff.tables.length > 0 : staff.tables.length == 0) );
  }

  selectBooking( bookingId: number ){
    this.selectedBookingId = bookingId;
    let b_item = this.bookings.find( booking => booking.id == bookingId );
    this.actions.toggleBookingAction( BookingAction.Select, b_item, false );
  }

  selectStaff( isAssigned:boolean, staffId:number ){
    this.selectedStaffId = staffId;
    let s_item = this.staffs.find( staff => staff.id == staffId );
    this.actions.toggleBookingAction( BookingAction.SelectStaff, s_item );
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

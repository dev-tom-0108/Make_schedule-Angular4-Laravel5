import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { Moment } from 'moment';
import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { BookingStates, BookingService } from 'app/layout/booking/booking.service';
var moment = require('moment');

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent implements OnInit, OnDestroy {
  //view: string = "timeline";
  loading:boolean = false;
  private componetDestroyed = new Subject();
  private bookingStates = BookingStates;

  isTableBooking: boolean = false;

  isShow:boolean = false;
  isShowMore: boolean = false;
  isShowEdit: boolean = false;
  isCurrentMore: boolean = true;

  public booking:any ={};
  public upcoming:any = {};

  public tablename:string;

  constructor(
    private actions         : ActionsService,
    private bookingService  : BookingService) {

    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
      action => {
        switch ( action.action ){
          case BookingAction.Select:
            this.afterSelect( action.param1, action.param2 );
            break;
          case BookingAction.Updated:
            this.afterUpdated( action.param1, action.parm2 );
            break;

          case BookingAction.ShowMoreDetails:
            this.isShowMore = true;
            break;
          case BookingAction.HideMoreDetails:
            this.isShowMore = false;
            this.isShowEdit = false;
            break;
          case BookingAction.HideStatus:
            this.isTableBooking = false;
            this.booking = { ...action.param1 };
            break;
          case BookingAction.Edit:
            this.isShowMore = true;
            this.isShowEdit = true;
            break;
          case BookingAction.HideEdit:
            this.isShowEdit = false;
            break;
        }
      });
  }

  ngOnInit() { 

  }

  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }
  afterSelect( booking:any, isTableDetails:boolean ){
    this.isShow = true;
    this.isShowMore = false;
    this.isTableBooking = isTableDetails;
    if ( this.isTableBooking ){
      this.booking = { ...booking.current };
      this.upcoming = booking.upcoming;
      this.tablename = booking.name;
    }else{
      this.booking = { ...booking };
    }
  }
  afterUpdated(booking:any, isCurrent:boolean ){
    if ( isCurrent )
      this.booking = { ...booking };
    else
      this.upcoming = { ...booking };

    this.actions.toggleBookingAction( BookingAction.ReSet );
  }
  convertTimeString( time: string ){
    return moment( time, "hh:mm").format("hh:mm A")
  }
  getBookingStatusInfo( status: string ){
    return this.bookingStates.find( booking => booking.id == status );
  }
  getTablesNameString( tables:Array<any> ){
    return tables.map( table => { return table.name }).join(" | ");
  }
  getStatusClass( status: string ){
    return this.getBookingStatusInfo( status ) ? this.getBookingStatusInfo( status ).class : "";
  }
  getStatusName( status: string ){
    return this.getBookingStatusInfo( status ) ? this.getBookingStatusInfo( status ).name : "";
  }
  showStatus() {
    this.actions.toggleBookingAction( BookingAction.ShowStatus, this.booking );
  }
  close() {
    this.isShowEdit = false;
    this.isShow = false;
    this.isShowMore = false;
    this.actions.toggleBookingAction( BookingAction.Deselect );
  }
  toggleEdit(){
    if ( !this.isShowEdit ){
      this.actions.toggleBookingAction( BookingAction.ShowMoreDetails, this.booking, true, true );
    }
    else
      this.actions.toggleBookingAction(BookingAction.HideEdit );
  }

  toggleMoreDetails( booking:any, isCurrent:boolean ) {
    this.isCurrentMore = isCurrent;
    if ( !this.isShowMore ){
      this.actions.toggleBookingAction( BookingAction.ShowMoreDetails, booking, false, isCurrent );
    }else{
      this.actions.toggleBookingAction( BookingAction.HideMoreDetails );
    }
  }
  changeToFinishStatus(){
    this.startLoading();
    const complete = BookingStates.find(t => t.name == 'BOOKING_STATUS_COMPLETED');
    return this.bookingService.updateBookingState( this.booking.id, complete.id ).subscribe(
      res => {
        this.endLoading();           
        this.booking.status = complete.id;
        this.actions.showSuccess( res.message );
        this.actions.toggleBookingAction( BookingAction.ReSet );
      }, 
      err => {
        this.endLoading();
        this.actions.showErrorMsg( err.error.data );
      });    
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

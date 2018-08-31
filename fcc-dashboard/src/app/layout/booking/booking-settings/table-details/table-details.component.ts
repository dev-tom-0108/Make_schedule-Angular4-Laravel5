import { Component, OnInit, OnDestroy } from '@angular/core';
import { Moment } from 'moment';
import { Subject } from 'rxjs/Subject';

import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { HeaderService, MainPageState, SubPageState, PageState } from 'app/layout/header.service';
import { TableStatus } from 'app/layout/tableService';
var moment = require('moment');

@Component({
  selector: 'app-table-details',
  templateUrl: './table-details.component.html',
  styleUrls: ['./table-details.component.scss']
})
export class TableDetailsComponent implements OnInit, OnDestroy {

  isShow:boolean = false;
  componetDestroyed = new Subject();
  page: PageState = { main: MainPageState.None, sub:SubPageState.None };
  table:any = {};
  upcoming:any = {};
  isShowMore:boolean = false;
  isShowBlock = false;
  constructor(
    private actions: ActionsService,
    private header : HeaderService) {
      this.header.getPage().takeUntil(this.componetDestroyed).subscribe( 
        page => { 
          if ( !this.header.compare( page, this.page ) ){
            this.isShow = false;
            this.page = page;
          }
        });

    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
      action => {
        switch ( action.action ){
          case BookingAction.SelectTable:
            this.afterSelectTable( action.param1 );
            break;
          case BookingAction.DeselectTable:
            this.isShow = false;
            break;
          case BookingAction.Updated:
            this.afterUpdated( action.param1 );
            break;
          case BookingAction.Block:
            this.isShowBlock = true;
            break;
          case BookingAction.Blocked:
            this.isShowBlock = false;
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
  initialize(){
   
  }
  afterGetBookings(bookings){
    //let selupcoming = bookings.find( booking => )
  }
  afterSelectTable(table){
    console.log( table );
    this.table = { ...table };
    this.upcoming = this.table.upcoming;
    this.isShow = true;
    this.isShowMore = false;
    this.isShowBlock = false;
  }
  afterUpdated(upcoming:any){
    this.upcoming = { ...upcoming };
    this.actions.toggleBookingAction( BookingAction.ReSet );
  }
  getStringofStatus(){
    switch ( this.table.status ){
      case TableStatus.Available:
      case TableStatus.Upcoming:
        return 'BOOKING_TABLE_AVAILABLE';
      case TableStatus.Overlapping:
        return 'BOOKING_TABLE_OVERLAPPED';
      case TableStatus.Block:
        return 'BOOKING_TABLE_BLOCKED';
    }
  }
  getTablesNameString( tables:Array<any> ){
    return tables.map( table => { return table.name }).join(" | ");
  }
  convertTimeString( time: string ){
    return moment( time, "hh:mm").format("hh:mm A")
  }  
  
  close() {
    this.actions.toggleBookingAction( BookingAction.DeselectTable );
  }
  toggleMoreDetails(booking) {
    if ( !this.isShowMore ){
      this.actions.toggleBookingAction( BookingAction.ShowMoreDetails, booking, false );
      this.isShowMore = true;
    }else{
      this.actions.toggleBookingAction( BookingAction.HideMoreDetails );
      this.isShowMore = false;
    }
  }
  showBlock(){
      //this.isShowBlock = true;
      this.actions.toggleBookingAction( BookingAction.Block, this.table );
  }
  showAddBooking() {
    this.actions.toggleBookingAction( BookingAction.Create );  
  }
  isOverlap(){
    return this.table.status == TableStatus.Overlapping;
  }
  isBlock(){
    return this.table.status == TableStatus.Block;
  }  
}

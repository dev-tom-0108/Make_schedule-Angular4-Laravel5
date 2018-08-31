import { Component, OnInit,OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/of';
import * as moment from 'moment';

import { Guest } from './../guest';
import { GuestsService } from './../guests.service';

import { ActionsService, ActionState } from 'app/layout/actions.service';
import { TokenStorage } from 'app/shared/authentication/token-storage.service';
import { BookingStates } from 'app/layout/booking/booking.service';

@Component({
  selector: 'app-guests-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class GuestsDetailsComponent implements OnInit, OnDestroy {

  private componetDestroyed = new Subject(); 

  guest: Guest;
  bookings = [];
  loading:boolean = false;

  sizeOfTotalBookings: number;
  sizeOfNoShows: number;
  sizeOfCanceledBookings: number;
  displayedColumns;
  dataSource;
  bookingEditMenu;
  enableEdit = false;

  constructor(
    private actions       : ActionsService, 
    private tokenStorage  : TokenStorage,
    private guestService  : GuestsService) {

      this.actions.getGuestAction().takeUntil(this.componetDestroyed).subscribe ( 
        action => { 
          switch ( action.action ) {
            case ActionState.Select:
              this.showView( action.param1 as Guest );
              break;
          }
        });

  }

  ngOnInit() {
    this.displayedColumns = ['id', 'date', 'time', 'guests', 'status'/*, 'link'*/];
    this.checkPermission( 1 ); // check write permission
  }

  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();     
  }

  getBookings() {
    this.startLoading();
    this.guestService.getBookingsByGuest(this.guest).subscribe(
      res => {
        const data:Booking[] = res.data.map(v => {
          return {
            ...v,
            time: moment(v.time, 'hh:mm:ss').format('hh:mm A')
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
  getBookingStatusName( statusId: string ){
    let  state = BookingStates.find( status => status.id == statusId );
    return state? state.name : "";
  }
  showEdit() {
    this.actions.toggleGuestAction( ActionState.Edit, this.guest );
  }

  showView( guest: Guest ){
    if ( guest ){
      this.guest = { ...guest };
      console.log( this.guest );
      this.getBookings();
    } else{
      this.guest = null;
    } 

  }

//------- Spinner start -----------------
  private startLoading() {
    this.loading = true;
  }

  private endLoading() {
    this.loading = false;
  }
//------- Spinner start -----------------    
  
  checkPermission( is_write = 0 )
  {
    this.tokenStorage.getUserInfo().takeUntil(this.componetDestroyed).subscribe( 
      user => { 
        let result = false;
        let permissions = user.permissions;
        permissions.forEach( permission =>{

          if( permission.name == 'guests' && permission.is_read ){
            if( is_write == 0 )
              result = true;
            else
            {
              if( permission.is_write == 1 )
                result = true;
            }
          }
        })

        if( permissions.length == 0 || user.role == 0 )
          result = true;

        this.enableEdit = result;
    });
  }
}
export interface Booking {
  id: string;
  booking_number: number,
  date: string;
  time: string;
  number_of_people: number;
  status: string;
  /*link: string;*/
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

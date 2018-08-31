import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { HeaderService, MainPageState, SubPageState, PageState } from '../header.service';
import { ActionsService } from '../actions.service';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit, OnDestroy {

  private componetDestroyed = new Subject();
  private page: PageState = { main: MainPageState.None, sub:SubPageState.None };

  constructor(private header: HeaderService, private actions: ActionsService) {

    this.header.getPage().takeUntil(this.componetDestroyed).subscribe( 
      page => {
        this.page = page;
      });
  }

  ngOnInit() {
    this.header.setPage(MainPageState.Booking, SubPageState.Booking_TimeLine );
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }

  isBookingTimeLine(){
    return this.header.isBookingTimeLine( this.page );
  }
  isBookingFloorView(){
    return this.header.isBookingFloorView( this.page );
  }
  isBookingList(){
    return this.header.isBookingList( this.page );
  }
}

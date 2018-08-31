import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BookingAction, ActionsService } from 'app/layout/actions.service';
import { BookingStates, BookingService } from '../../booking.service';
@Component({
  selector: 'app-booking-status',
  templateUrl: './booking-status.component.html',
  styleUrls: ['./booking-status.component.scss']
})
export class BookingStatusComponent implements OnInit, OnDestroy {
  loading:boolean = false;
  isShow:boolean = false;
  private componetDestroyed = new Subject();
  private bookingStates = BookingStates;
  private bState;
  private booking;

  constructor(
    private actions: ActionsService,
    private bookingService: BookingService ) {

    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
      action => {
        switch ( action.action ){
          case BookingAction.ShowStatus:
            this.booking = action.param1;
            this.bState = this.booking.status;
            this.isShow = true;
            break;
          case BookingAction.HideStatus:
          case BookingAction.Select:
          case BookingAction.SelectTable:
            this.isShow = false;
        }
      });

  }

  ngOnInit() {
  }

  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }
  isShowStatus( bookingState ){
    return (bookingState.id != this.bookingStates[1].id) && (bookingState.id != this.bookingStates[0].id);// && bookingState.id != this.bookingStates[10].id;
  }
  close() {
    this.actions.toggleBookingAction( BookingAction.HideStatus, this.booking );
  }
  save(){
    this.startLoading();
    return this.bookingService.updateBookingState( this.booking.id, this.bState ).subscribe(
      res => {
        this.endLoading();           
        this.booking.status = this.bState;
        this.actions.showSuccess( res.message );
        this.actions.toggleBookingAction( BookingAction.ReSet );
        this.close();
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

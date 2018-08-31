import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'app-booking-settings',
  templateUrl: './booking-settings.component.html',
  styleUrls: ['./booking-settings.component.scss']
})
export class BookingSettingsComponent implements OnInit {

  isShow:boolean = false;
  isShowBooking:boolean = false;
  isShowTable:boolean = false;
  isShowMore:boolean = false;
  isShowAddBooking:boolean = false;
  private componetDestroyed = new Subject();

  constructor(private actions: ActionsService) {
    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
      action => {
        switch ( action.action ){
          case BookingAction.Select:
            this.isShow = true;
            this.isShowMore = false;
            this.isShowTable = false;
            break;
          case BookingAction.SelectTable:
            this.isShow = this.isShowTable = true;
            this.isShowMore = false;
            break;
          case BookingAction.Deselect:
          case BookingAction.DeselectTable:
            this.isShow = this.isShowTable = false;
            break; 
          case BookingAction.ShowMoreDetails:
            this.isShowMore = true;
            break;
          case BookingAction.HideMoreDetails:
            this.isShowMore = false;
            break;           
          case BookingAction.SelectStaff:
            this.isShowAddBooking = true;
            break;
          case BookingAction.DeSelectStaff:
            this.isShowAddBooking = false;
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
  getStyle() {
    if(this.isShowAddBooking) {
      return "hidden";
    } else {
      return "visible";
    }
  }
}

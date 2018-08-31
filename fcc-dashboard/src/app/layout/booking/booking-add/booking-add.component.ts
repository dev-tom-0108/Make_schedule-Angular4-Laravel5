import { Component, OnInit, OnDestroy } from '@angular/core';
import { IDatePickerConfig } from 'ng2-date-picker';
import { Subject } from 'rxjs/Subject';

import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { BookingService } from 'app/layout/booking/booking.service';

@Component({
  selector: 'app-booking-add',
  templateUrl: './booking-add.component.html',
  styleUrls: ['./booking-add.component.scss']
})
export class BookingAddComponent implements OnInit, OnDestroy {
  state = false
  private componetDestroyed = new Subject();

  public isShow:boolean = false;
  selectedIndex = 0;
  constructor(
    private actions: ActionsService,
    private bookingService  : BookingService) {

    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
      action => {
        switch ( action.action ){
            case BookingAction.Create:
                this.isShow = true;
                this.ngOnInit();
                this.selectedIndex = 0;
                break;
            case BookingAction.Created:
                this.isShow = false;
                break;
            case BookingAction.ChangeTabIndex:
                console.log(action.param1);
                this.selectedIndex = action.param1;
                break;
            
        }
      });

    
  }

    ngOnInit() {
        // all new booking status clear
        this.bookingService.booking.clearStatus();
        // get all settings(rules & general) from server
        this.bookingService.getRulesAndGeneral().takeUntil(this.componetDestroyed).subscribe(
            result=> {
                console.log(result.data);
                this.bookingService.booking.setRules(result.data.rules);
                this.bookingService.booking.setGeneral(result.data.general);
                this.bookingService.updateBookingSettings(result.data);
            },
            err => {
                console.log(err);
                this.actions.showErrorMsg( err.error.data );
            }
        );
    }

    closeAddBooking() {
        this.isShow = false;
    }
    ngOnDestroy(){
        this.componetDestroyed.next();
        this.componetDestroyed.unsubscribe();
    }

}

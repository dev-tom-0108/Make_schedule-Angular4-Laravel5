import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from 'app/layout/booking/booking.service';
import { Subject } from 'rxjs/Subject';
import { DatePipe } from '@angular/common';
import { ActionsService, BookingAction } from 'app/layout/actions.service';

@Component({
  selector: 'app-step-guests',
  templateUrl: './step-guests.component.html',
  styleUrls: ['./step-guests.component.scss']
})
export class StepGuestsComponent implements OnInit, OnDestroy {
    public persons: any[];
    public person = 0;
    public inputGuest = "";
    private componetDestroyed = new Subject();
  constructor(
    private bookingService: BookingService,
    private datepipe: DatePipe,
    private actionService: ActionsService
  ) { }

  ngOnInit() {
        // Set Persons
        if (this.bookingService.booking.general !== null && this.bookingService.booking.general.MaximumNumberofPeoplePerBooking !== null) {
            this.persons = [this.bookingService.booking.general.MaximumNumberofPeoplePerBooking];
            for (let i = 0; i < this.bookingService.booking.general.MaximumNumberofPeoplePerBooking; i++) {
                this.persons[i] = i + 1;
            }
        }
        this.bookingService.getBookingSettings().takeUntil(this.componetDestroyed).subscribe(res=>{
            console.log(res);
            if (res.general !== null && res.general.MaximumNumberofPeoplePerBooking !== null) {

                this.persons = [res.general.MaximumNumberofPeoplePerBooking];
                for (let i = 0; i < res.general.MaximumNumberofPeoplePerBooking; i++) {
                    this.persons[i] = i + 1;
                }
            }
        });

        // set default guest_num
        this.person = 1;
    }

    selectedPerson(index) {
        this.person = this.persons[index];
        console.log(this.person);
        // this.bookingService.booking.setStatus({seats: this.person});
        // this.tables = 0;

        // const data = {
        //     date: this.date,
        //     time: this.time,
        //     seats: this.persons[index]
        // };
        // this.api.getAvailableTableCount(data).subscribe(
        //     result => {
        //         this.tables = result.data;
        //         this.person = this.persons[index];
        //     },
        //     error => {
        //         // console.log(error);
        //         this.router.navigate(['/error']);
        //     }
        // );
    }

    onlyNumberKey(event) {

        if (event.charCode == 43 || event.charCode == 32) {
            return true;
        }

        return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
    }

    ngOnDestroy(){
        this.componetDestroyed.next();
        this.componetDestroyed.unsubscribe();
    }

    next() {
        if (Number(this.inputGuest))
            this.person = Number(this.inputGuest);
        this.bookingService.booking.setStatus({seats: this.person});
        this.actionService.toggleBookingAction(BookingAction.ChangeTabIndex, 3);
    }

    prev() {
        if (Number(this.inputGuest))
            this.person = Number(this.inputGuest);
        this.bookingService.booking.setStatus({seats: this.person});
        this.actionService.toggleBookingAction(BookingAction.ChangeTabIndex, 1);        
    }
}

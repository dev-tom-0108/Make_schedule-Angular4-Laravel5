import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { BookingService } from 'app/layout/booking/booking.service';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-step-time',
  templateUrl: './step-time.component.html',
  styleUrls: ['./step-time.component.scss']
})
export class StepTimeComponent implements OnInit, OnDestroy {

    public shifts: any[];
    public timeslots: any[];
    private time = '';
    private shift_id;
    private isShow = false;
    private date;
    public isHoliday = false;
    public loading = false;
    private componetDestroyed = new Subject();
    constructor(
        private bookingService: BookingService,
        private datepipe: DatePipe,
        private actionService: ActionsService
    ) { }
    ngOnDestroy(){
        this.componetDestroyed.next();
        this.componetDestroyed.unsubscribe();
    }
    ngOnInit() {
        
        this.bookingService.getBookingStatus().takeUntil(this.componetDestroyed).subscribe((date)=>{
            this.startLoading();
            let status = this.bookingService.booking.getStatus();
            if (status.date && this.date != status.date) {
                this.date = status.date;
                    this.bookingService.getTimeSlots(this.date).takeUntil(this.componetDestroyed).subscribe(
                        result => {
                            this.shifts = result.data;
                            this.bookingService.booking.shifts = this.shifts;

                            if (this.bookingService.booking.shifts.length == 0) {
                                this.actionService.showNotification(this.date + ' is holiday');
                                this.isHoliday = true;
                                this.endLoading();
                                this.prev();
                                return;
                            }

                            for (let i = 0; i < this.shifts.length; i++) {
                                this.shifts[i].options = [this.shifts[i].time_slots.length];
                                for (let j = 0; j < this.shifts[i].time_slots.length; j++) {
                                    if (i === 0 && j === 0) {
                                        this.time = this.shifts[i].time_slots[j];
                                        this.shift_id = this.shifts[i].id;
                                    }
                                }
                            }
                            // // if time is in status params, set the time as initial value
                            // if (status && status.time) {
                            //     this.time = status.time;
                            //     this.shift_id = status.shift_id;
                            // }
                            this.isHoliday = false;   
                            this.endLoading();                     
                        },
                        error => {
                            // console.log(error);
                            this.endLoading();
                        }
                    );
            } else {
                if (this.bookingService.booking.shifts == null || this.bookingService.booking.shifts.length == 0) {
                    this.isHoliday = true;
                    this.actionService.showNotification(this.date + ' is holiday');
                    this.endLoading();
                    this.prev();
                } else {
                    this.endLoading();
                }
            }
        });
    }
    private startLoading() {
        this.loading = true;
    }
    private endLoading() {
        this.loading = false;
    }
    next() {
        this.actionService.toggleBookingAction(BookingAction.ChangeTabIndex, 2);
        this.bookingService.booking.setStatus({time:this.time, shift_id: this.shift_id});
    }

    prev() {
        this.actionService.toggleBookingAction(BookingAction.ChangeTabIndex, 0);
        this.bookingService.booking.setStatus({time:this.time, shift_id: this.shift_id});      
    }

    // timeslot select
    selectedTimeSlot(shift_index, timeslot_index) {
        this.time = this.shifts[shift_index].time_slots[timeslot_index];
        this.shift_id = this.shifts[shift_index].id;        
    }
}

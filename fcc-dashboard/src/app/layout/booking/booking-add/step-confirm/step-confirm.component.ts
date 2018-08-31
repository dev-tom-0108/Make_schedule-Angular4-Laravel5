import { FormGroup, FormControl, FormArray, Validators, NgForm } from '@angular/forms';
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { Subject } from 'rxjs/Subject';
import { Guest } from 'app/layout/guests/guest';
import { BookingService } from 'app/layout/booking/booking.service';
import { ApiService } from 'app/api.service';

@Component({
  selector: 'app-step-confirm',
  templateUrl: './step-confirm.component.html',
  styleUrls: ['./step-confirm.component.scss']
})
export class StepConfirmComponent implements OnInit, OnDestroy {
    loading: boolean = false;
    items: Array<any> = [];
    private componetDestroyed = new Subject(); 
    public guest:Guest;
    public note;
    guestForm: FormGroup;
    constructor(
        private actions: ActionsService,
        private apiService: ApiService,
        private bookingService: BookingService
        ) {

    }

    ngOnInit() {
        this.guest = new Guest();
        this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
        action => {
            switch ( action.action ){
                case BookingAction.BookingStaff:
                    this.guest = action.param1;
                    this.note = '';
                    break;
            }
        });

        this.guestForm = new FormGroup(
        {
            "name"          : new FormControl('', [Validators.required]),
            "email"         : new FormControl('', [Validators.required]),
            "phone"         : new FormControl('', [Validators.required]),
            "note"         : new FormControl('')
        }
        ); 
    }

    ngOnDestroy() {
        this.componetDestroyed.next();
        this.componetDestroyed.unsubscribe();
    }

    private startLoading() {
        this.loading = true;
    }

    private endLoading() {
        this.loading = false;
    }

    private createBooking() {

        // create booking
        const booking = this.bookingService.booking.getStatus();
        const shifts = this.bookingService.booking.shifts;
        let cur_shift: any;
        for (let i = 0; i < shifts.length; i++) {
            if (shifts[i].id == booking.shift_id) {
                cur_shift = shifts[i];
                break;
            }
        }

        const data = {
            date: booking.date,
            time: booking.time,
            hours: cur_shift.shift_atb,
            number_of_people: booking.seats,
            guest_id: this.guest.id,
            status: 'Booked',
            shift_package_id: cur_shift.shift_package_id,
            shift_id: cur_shift.id,
            floor_package_id: cur_shift.floor_package_id,
            notes_by_guest:this.note ? this.note :'',
        };

        console.log(data);

        this.startLoading();
        this.apiService.createBooking(data).takeUntil(this.componetDestroyed).subscribe(
            result => {
                this.endLoading();
                this.actions.showSuccess(result.message);
                this.actions.toggleBookingAction( BookingAction.Created );
                this.actions.toggleBookingAction( BookingAction.ReSet );
                console.log(result);
            },
            error => {
                this.endLoading();
                this.actions.toggleBookingAction( BookingAction.Created );
                this.actions.toggleBookingAction( BookingAction.ReSet );
                console.log(error);
                // this.actions.showErrorMsg( error.error.data );
            }
        );
    }

    addBooking() {
        console.log(this.guest);
        
        if (!this.guest.id) {
            // create guest
            this.bookingService.createGuest(this.guest).takeUntil(this.componetDestroyed).subscribe(
                result => {
                    this.endLoading();
                    this.guest = result.data;
                    this.createBooking();
                    console.log(result);
                },
                error => {
                    this.endLoading();
                    console.log(error);
                    this.actions.showErrorMsg( error.error.data );
                }
            );
        } else {
            this.createBooking();
        }

    }
}

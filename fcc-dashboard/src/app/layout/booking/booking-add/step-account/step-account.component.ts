import { Component, OnInit } from '@angular/core';
import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { Guest } from 'app/layout/guests/guest';
import { GuestsService } from 'app/layout/guests/guests.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-step-account',
  templateUrl: './step-account.component.html',
  styleUrls: ['./step-account.component.scss']
})
export class StepAccountComponent implements OnInit {
    loading: boolean = false;
    state = false;
    guests: Guest[] = [];
    private componetDestroyed = new Subject(); 
    searchText:string;
    selector: string = '.step-account__accounts';
    offset: number = 0;
    all_count: number = 0;
    constructor(
        private actionService:ActionsService,
        private guestService: GuestsService
    ) { 

    }

    ngOnInit() {
        this.searchText = '';
        this.search( this.searchText ); // Get list of all guests
    }

    addNewGuest() {
        this.state = true;
        this.actionService.toggleBookingAction( BookingAction.BookingStaff,  new Guest());        
    }

    next() {
        // this.actionService.toggleBookingAction(BookingAction.ChangeTabIndex, 3);
    }

    prev() {
        if (this.state)
            this.state = false;
        else {
            this.actionService.toggleBookingAction(BookingAction.ChangeTabIndex, 2);
        }
    }
    private startLoading() {
        this.loading = true;
    }
    private endLoading() {
        this.loading = false;
    }
    onScrollDown(){

        console.log("Scrolled");
    
        if (this.offset == -1 || this.loading)
            return;
        
        this.search(this.searchText, false);
    }
    search(term: string, select: boolean = true): void {
        this.startLoading();
        if(term != ''){
            if(select == true){
              this.offset = 0;
              this.guests = [];
            } 
        }else{
            if(select == true){
              this.offset = 0;
              this.guests = [];
            } 
        }
		
        this.guestService.searchGuests(term, this.offset).takeUntil(this.componetDestroyed).subscribe(
          res => {
            this.endLoading();        
            let guests_all = res.data.data;
            this.offset = res.data.next_offset;
            this.all_count = res.data.all_count;
            this.guests = guests_all;
            console.log(this.searchText);
            console.log(this.guests);
          },
          err => {
            this.endLoading();
            this.guests = [];        
          }
        );
    }
    
    ngOnDestroy(){
        this.componetDestroyed.next();
        this.componetDestroyed.unsubscribe();
    }

    selectGuest(guest: Guest) {
        this.actionService.toggleBookingAction( BookingAction.BookingStaff,  guest);
        this.state = true;
    }
}

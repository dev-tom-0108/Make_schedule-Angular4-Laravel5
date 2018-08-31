import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { Guest } from './../guest';
import { GuestsService } from './../guests.service';

import { ApiService } from 'app/api.service';
import { ActionsService, ActionState } from 'app/layout/actions.service';


const STATUS_NOT_FOUND = 'STATUS_NOT_FOUND';

@Component({
  selector: 'app-guests-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class GuestsListComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  private componetDestroyed = new Subject();

  guests: Guest[] = [];
  selectedId: number = -1;
  selectedGuest: Guest;
  searchText:string = "";
  selector: string = '.guest-list__guests';
  offset: number = 0;
  all_count: number = 0;
  constructor(
    private apiService    : ApiService,
    private guestService  : GuestsService,
    private actions       : ActionsService) {

      this.actions.getGuestAction().takeUntil(this.componetDestroyed).subscribe (
        action => {
          switch ( action.action ) {
            case ActionState.Created:
              this.all_count++;
            case ActionState.Updated:
              this.selectedId = action.param1.id;

              // keep search and show detail once update
              this.search( this.searchText );
              this.actions.toggleGuestAction( ActionState.Select, action.param1 );
              break;
            case ActionState.Deleted:
              this.selectedId = -1;
              this.search( this.searchText );
              break;
          }
        });
  }

  ngOnInit() {
    this.search( this.searchText ); // Get list of all guests
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }

  selectGuest(guestId: number) {
    this.selectedId = guestId;
    this.selectedGuest = this.guests.find( guest => guest.id == this.selectedId );
    this.actions.toggleGuestAction( ActionState.Select, this.selectedGuest );
  }
  onScrollDown(){

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

    this.guestService.searchGuests(term, this.offset).subscribe(
      res => {
        this.endLoading();
        let guests_all = this.guests.slice(0);
        guests_all = guests_all.concat(res.data.data);
        this.offset = res.data.next_offset;
        this.all_count = res.data.all_count;
        this.guests = guests_all;
        if (select)
          this.saveGuests( this.guests );
      },
      err => {
        this.endLoading();
        this.guests = [];
        if (select)
          this.saveGuests( this.guests );
      }
    );
  }
  saveGuests( guests: Guest[]){
    this.guests = guests;
    if ( this.guests.length > 0 ){
     if ( this.selectedId == -1 ) this.selectedId = this.guests[0].id;
    }else{
      this.selectedId = -1;
    }
    this.selectGuest( this.selectedId );
  }
  private startLoading() {
    this.loading = true;
  }

  private endLoading() {
    this.loading = false;
  }
}

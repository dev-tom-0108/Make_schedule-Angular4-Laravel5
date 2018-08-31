
import { Component, OnInit,OnDestroy } from '@angular/core';

import { GuestsService } from './guests.service';

import { HeaderService, MainPageState, SubPageState } from '../header.service';

@Component({
  selector: 'app-guests',
  templateUrl: './guests.component.html',
  styleUrls: ['./guests.component.scss']
})
export class GuestsComponent implements OnInit, OnDestroy {

  constructor(private header: HeaderService, private guestService: GuestsService) { }

  ngOnInit() {
    this.header.setPage( MainPageState.Guests, SubPageState.None );
  }

  ngOnDestroy() {
  }

}

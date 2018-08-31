import { Component, OnInit } from '@angular/core';

import { HeaderService, MainPageState, SubPageState } from '../header.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(private header: HeaderService) { }
  ngOnInit() {
    this.header.setPage( MainPageState.Profile, SubPageState.None );
  }
}

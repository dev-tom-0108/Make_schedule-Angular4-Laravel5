import { Component, OnInit } from '@angular/core';

import { HeaderService, MainPageState, SubPageState } from '../header.service';

@Component({
  selector: 'app-staffs',
  templateUrl: './staffs.component.html',
  styleUrls: ['./staffs.component.scss']
})
export class StaffsComponent implements OnInit {

  constructor(private header: HeaderService) { }

  ngOnInit() {
    this.header.setPage(MainPageState.Staffs, SubPageState.None );
  }

}

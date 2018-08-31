import { Component, OnInit } from '@angular/core';

import { HeaderService, MainPageState, SubPageState } from '../header.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private header: HeaderService) { }

  ngOnInit() {
    this.header.setPage( MainPageState.Settings, SubPageState.Setting_Generals );
  }
}

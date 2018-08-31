import { Component, OnInit,OnDestroy } from '@angular/core';
import { ActionsService } from '../../actions.service';
import { HeaderService, MainPageState, SubPageState } from '../../header.service';
import { ApiService } from 'app/api.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss']
})
export class SettingsListComponent implements OnInit, OnDestroy {
  constructor(private header:HeaderService, private actions: ActionsService) { 
  }
  
  ngOnInit() {
  }
  ngOnDestroy(){

  }
  showFloorPackageSettings() {
    this.header.setPage( MainPageState.Settings, SubPageState.Setting_FloorPackages );
    
  }
  showShiftPackageSettings() {
    this.header.setPage( MainPageState.Settings, SubPageState.Setting_ShiftPackages );
  }
  showRulesSettings() {
    this.header.setPage( MainPageState.Settings, SubPageState.Setting_Rules );
  }
  showFloorsSettings(){
    
  }
}

import { Component, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { ActionsService } from 'app/layout/actions.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']

})
export class AppComponent {
  constructor(
    private actions       : ActionsService,    
    private vcr           : ViewContainerRef){
      this.actions.setToastrVCR( vcr );
  }
}

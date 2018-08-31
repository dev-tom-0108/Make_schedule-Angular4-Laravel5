import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'app-floorview',
  templateUrl: './floorview.component.html',
  styleUrls: ['./floorview.component.scss']
})
export class FloorviewComponent implements OnInit {

  isShow:boolean = false;
  private componetDestroyed = new Subject();

  constructor(private actions: ActionsService) {
    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
      action => {
        switch ( action.action ){

        }
      });
  }

  ngOnInit() {
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }  
}

import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { DefaultAvatarImg } from 'app/layout/header.service';

import { ConfirmationDialogsService } from 'app/shared/services/dialog/confirmation-dialog.service';
import { BookingService } from 'app/layout/booking/booking.service';

@Component({
  selector: 'app-table-assign',
  templateUrl: './table-assign.component.html',
  styleUrls: ['./table-assign.component.scss'],
  encapsulation: ViewEncapsulation.None  
})
export class TableAssignComponent implements OnInit {

  loading:boolean = false;
  isShow:boolean = false;
  private componetDestroyed = new Subject();
  private defaultAvatar = DefaultAvatarImg;

  private staff:any = {};
  color:string ='#00FF00';
  private selectTableIds = [];
  private isChangeColor = false;
  private canDisableBtn: boolean;

  constructor(
    private actions         : ActionsService,
    private bookingService  : BookingService,
    private dialogService   : ConfirmationDialogsService) {

      this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
        action => {
          switch ( action.action ){
            case BookingAction.SelectStaff:
              this.staff = { ...action.param1};
              this.isShow = true;
              break;
            case BookingAction.DeSelectStaff:
              this.isShow = false;
              break;

            case BookingAction.SelectTable:
              if ( this.isShow ){
                this.selectTableIds = action.param2;
              }
              break;
            case BookingAction.UpdatedTables:
            case BookingAction.DeletedTables:
              this.staff.tables = action.param1;
              break;            
          }
      });
      //control about disable clearbtn
      this.bookingService.getDisableClearBtnFlag().subscribe(action =>{ 
        this.canDisableBtn = action;
      });
  
    }

  ngOnInit() {
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }

  close() {
    this.actions.toggleBookingAction( BookingAction.DeSelectStaff );
    this.actions.toggleBookingAction( BookingAction.DeselectTable );
    this.actions.toggleBookingAction( BookingAction.ReSet );
  }
  changeAssign(){
    this.actions.toggleBookingAction( BookingAction.SaveTables, this.staff.id );
  }
  clearAllAssign(){
    this.actions.toggleBookingAction( BookingAction.DeleteTables, this.staff.id );
  }
  showColor(){
    this.isChangeColor = true;
  }
  closeColor(){
    this.isChangeColor = false;
  }
  saveColor(){
    this.startLoading();
    return this.bookingService.updateStaffColor( this.staff.id, this.color ).subscribe(
      res => {
        this.endLoading();           
        this.staff.table_color = this.color;
        this.closeColor();
        this.actions.showSuccess( res.message );
      }, 
      err => {
        this.endLoading();
        this.actions.showErrorMsg( err.error.data );
      });
  }
  getTablesNameString( tables ){
    return tables.map( table => { return table.name }).join(" | ");    
  }
 //------- Spinner start -----------------
 private startLoading() {
  this.loading = true;
  }

  private endLoading() {
    this.loading = false;
  }
  //------- Spinner start -----------------    
}

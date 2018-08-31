import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

import { Lang } from 'app/shared/services';
import { PageState, HeaderService, MainPageState, SubPageState } from 'app/layout/header.service';
import { FPViewState, ActionsService, ActionState } from 'app/layout/actions.service';
import { ApiService } from 'app/api.service';
import { ConfirmationDialogsService } from 'app/shared/services/dialog/confirmation-dialog.service';



@Component({
  selector: 'app-floor-package-menu',
  templateUrl: './floor-package-menu.component.html',
  styleUrls: ['./floor-package-menu.component.scss']
})
export class FloorPackageMenuComponent implements OnInit, OnDestroy {

  loading = false;
  private componetDestroyed = new Subject();
  private page: PageState = { main: MainPageState.None, sub:SubPageState.None };

  fpViewState: FPViewState = FPViewState.View;
  oldFpViewState: FPViewState = FPViewState.None;

  private defaultFp:any={};
  private selectFp:any={};
  private createFp:any={};
  private editFp:any={};  

  private editForm:FormGroup;
  private createForm:FormGroup;
  private tableEditForm:FormGroup;

  selectedTable: any = {};

  tableNumber: number = 0;
  tableSeat :number = 0;
  tableSeatable :number = 0;

  constructor(
    private actions      : ActionsService, 
    private header       : HeaderService, 
    private apiService   : ApiService,
    private lang         : Lang,
    private dialogService: ConfirmationDialogsService ) {

    this.header.getPage().takeUntil(this.componetDestroyed).subscribe(
      obj => this.page = obj
    );

    this.actions.getFloorPackageAction().takeUntil(this.componetDestroyed).subscribe ( 
      action => { 
        switch ( action.action ) {
          case ActionState.Create:
            this.showCreate();
            break;
          case ActionState.Select:
            this.onChangePackage( action.param1, action.param2 ); 
            break;
          case ActionState.ItemSelect:
            this.showItemEdit( action.param1 );
            break;
          case ActionState.ItemsUpdated:
            if ( action.param1 ){
              this.actions.showSuccess ( action.param2 );  
              this.showView();
            }else{
              this.actions.showErrorMsg ( action.param2 );
            }
            break;
        }
      });

  }


  ngOnInit() {
    this.editForm = new FormGroup(
      { "input_floor_package_name"      : new FormControl('', [ Validators.required ]),
        "radio_floor_publish"           : new FormControl('', [])
      }
    );
    this.createForm = new FormGroup(
      { "input_floor_package_name"      : new FormControl('', [ Validators.required ]),
        "radio_floor_publish"             : new FormControl('', []) 
      }
    );
    this.tableEditForm = new FormGroup(
      {
        "input_table_name"         : new FormControl('', [ Validators.required ]),
        "input_table_seats"        : new FormControl('', [ Validators.required ]),
        "input_table_seat_from"    : new FormControl('', [ Validators.required ]),
        "input_table_seat_to"      : new FormControl('', [ Validators.required ]),        
        "input_table_style"        : new FormControl('', []),        
        "input_table_allow_online" : new FormControl('', [])       
      }
    );
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();    
  }
  closeFloorPackageSettings() {
    this.header.setPage( MainPageState.Settings, SubPageState.Setting_Generals );
  }

  onChangePackage( s_package, d_package ){
    this.selectFp = { ...s_package };
    this.defaultFp = { ...d_package };
    this.showView();
  }
  //---- Save data To API Start  ----------
  setAsDefault(){
    this.startLoading();
    this.apiService.PutDefaulFloorPackage( this.selectFp.id ).subscribe(
      res => {
        this.endLoading();
        this.actions.showSuccess( res.message );
        this.defaultFp = this.selectFp;
        this.actions.toggleFloorPackageAction( ActionState.SetDefault, this.defaultFp.id );     
      },
      err => {
        this.endLoading();
        this.actions.showErrorMsg( err.error.data );
      }
    );
  }
  saveEdit(){
    this.startLoading();
    if ( JSON.stringify( this.editFp ) != JSON.stringify( this.selectFp ) ){
      this.editFp.is_publish = this.editFp.is_publish ? 1 : 0;
      this.apiService.putFloorPackage ( this.selectFp.id, this.editFp ).subscribe( 
        res => {
        this.selectFp = this.editFp;
        this.actions.toggleFloorPackageAction( ActionState.Updated, this.selectFp.id );      
        this.endLoading();
        //this.actions.showSuccess( res.message );         
        },
        err => {
          this.endLoading();          
          //this.actions.showErrorMsg( err.error.data );
        }
    );
    }else{
      this.actions.toggleFloorPackageAction( ActionState.Updated, this.selectFp.id );      
      this.endLoading();
    }
  }
  saveCreate(){
    this.startLoading();
    this.createFp.is_publish = this.createFp.is_publish ? 1 : 0;        
    this.apiService.postFloorPackage ( this.createFp ).subscribe(
       res => {
        this.selectFp = res.data;
        this.actions.toggleFloorPackageAction( ActionState.Created, this.selectFp.id );
        this.endLoading();
        //this.actions.showSuccess( res.message );   
      },
      err => {
        this.endLoading();
        //this.actions.showErrorMsg( err.error.data );
      }
    );
  }
  deletePackage(){
    let confirm = this.dialogService.confirmWithoutContainer(
      'CONFIRM', 
      'CONFIRM_CONTENT_DELETE_FLOOR_PACKAGE').subscribe( ( ret )=>{
        if ( ret ){
          this.startLoading();
          this.apiService.deleteFloorPackage( this.selectFp.id ).subscribe(
            res => {
              this.actions.toggleFloorPackageAction( ActionState.Deleted );
              this.endLoading();
              this.actions.showSuccess( res.message );
            },
            err =>{
              this.endLoading();
              this.actions.showErrorMsg( err.error.data );
            }
          );
        }
      });
  }
  //---- Save data To API End  ----------
  //------ Change Table Information State  Start ---------
  changeTableName( e ) {
    this.selectedTable.tableObj.table_name = e.target.value;
    this.actions.toggleFloorPackageAction( ActionState.ItemChange, this.selectedTable );  
  }
  changeSeats(e) {
    //this.selectedTable.tableObj.seats = e.target.value;//number.id;
    let seats:number = e.target.value;
    if ( seats < 1 ){
      e.target.value = 1;
      this.selectedTable.tableObj.seats = e.target.value;
    }

    this.actions.toggleFloorPackageAction( ActionState.ItemChange, this.selectedTable );  
  }
  changeSeatFrom( e ){
    let seatFrom:number = e.target.value;
    if ( seatFrom > this.selectedTable.tableObj.seat_to ){
      e.target.value = this.selectedTable.tableObj.seat_to;
      this.selectedTable.tableObj.seat_from = e.target.value;
    } else if ( seatFrom < 1 ){
      e.target.value = 1;
      this.selectedTable.tableObj.seat_from = e.target.value;
    }

    this.actions.toggleFloorPackageAction( ActionState.ItemChange, this.selectedTable );    
  }
  changeSeatTo( e ){
    let seatTo:number = e.target.value;
    if ( seatTo < this.selectedTable.tableObj.seat_from ){
      e.target.value = this.selectedTable.tableObj.seat_from;
      this.selectedTable.tableObj.seat_to = e.target.value;
    }
    this.actions.toggleFloorPackageAction( ActionState.ItemChange, this.selectedTable );      
  }  
  changeTableStyle() {
    this.actions.toggleFloorPackageAction( ActionState.ItemChange, this.selectedTable );   
  }
  changeOnlineBookingState(){
    this.actions.toggleFloorPackageAction( ActionState.ItemChange, this.selectedTable );  
  }
  //------ Change Table Information State  End ---------

 //------ Show Floor Package State  start ---------

  duplicate(){
    if (this.createForm) this.createForm.reset();
    this.createFp = { ...this.selectFp };
    delete this.createFp['id'];
    this.fpViewState = FPViewState.Create;
    this.actions.toggleFloorPackageAction( ActionState.Duplicate );  
  }
  showView() {  
    this.fpViewState = FPViewState.View;
    this.actions.toggleFloorPackageAction( ActionState.View, this.selectFp.id );    
  }
  showEdit(){
    if (this.editForm) this.editForm.reset();
    this.editFp = { ...this.selectFp };
    this.fpViewState = FPViewState.Edit;
    this.actions.toggleFloorPackageAction( ActionState.Edit );
  }
  showCreate() {
    if (this.createForm) this.createForm.reset();
    this.createFp = {};
    this.fpViewState = FPViewState.Create;
    //this.actions.toggleFloorPackageAction( ActionState.Create );
  }
  showItemEdit( item: any ){
    if ( this.fpViewState != FPViewState.ItemEdit ) this.oldFpViewState = this.fpViewState;
    this.selectedTable = item;
    this.fpViewState = FPViewState.ItemEdit;
  }
  closeItemEdit(){
    this.fpViewState = this.oldFpViewState;
  }
//------ Show Floor Package State  end ----------------
//------ Compare Floor Package State  start -----------
  isSettingFloorPackages(){
    return this.header.isSettingFloorPackages( this. page );
  }
  isView() {
    return this.fpViewState == FPViewState.View;
  }
  isEdit(){
    return this.fpViewState == FPViewState.Edit;
  }
  isCreate() {
    return this.fpViewState == FPViewState.Create;
  }
  isItemEdit(){
    return this.fpViewState == FPViewState.ItemEdit;
  }
//------ Compare Floor Package State  end  ------------
  //------- Spinner start -----------------
  private startLoading() {
    this.loading = true;
  }

  private endLoading() {
    this.loading = false;
  }
  //------- Spinner start -----------------
       
}

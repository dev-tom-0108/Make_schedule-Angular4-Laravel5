import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ApiService } from 'app/api.service';
import { Lang } from 'app/shared/services';
import { PageState, HeaderService, MainPageState, SubPageState } from 'app/layout/header.service';
import { ConfirmationDialogsService } from 'app/shared/services/dialog/confirmation-dialog.service';
import { SPViewState, ActionsService, ActionState } from 'app/layout/actions.service';

@Component({
  selector: 'app-shift-package-menu',
  templateUrl: './shift-package-menu.component.html',
  styleUrls: ['./shift-package-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ShiftPackageMenuComponent implements OnInit, OnDestroy {
  loading = false;
  private componetDestroyed = new Subject();

  private page: PageState = { main: MainPageState.None, sub:SubPageState.None };
  private spViewState: SPViewState = SPViewState.None;

  private defaultSp:any={};
  private selectSp:any={};
  private createSp:any={};
  private editSp:any={};
  
  private editForm:FormGroup;
  private createForm:FormGroup;
  private editItemValid = true;
  private createItemValid = false;

  constructor(
    private actions      : ActionsService, 
    private header       : HeaderService, 
    private apiService   : ApiService,
    private lang         : Lang,
    private dialogService: ConfirmationDialogsService   ) {

      this.header.getPage().takeUntil(this.componetDestroyed).subscribe(
        obj => { 
          this.page = obj;
        });

      this.actions.getShiftPackageAction().takeUntil(this.componetDestroyed).subscribe ( 
        action => { 
          switch ( action.action ) {
            case ActionState.Create:
              this.showCreate();
              break;
            case ActionState.Select:
              this.changePackage( action.param1, action.param2 ); 
              break;
            case ActionState.ItemsUpdated:        
              if ( action.param1 ){
                this.actions.showSuccess ( action.param2.message );  
                this.showView();
              }else{
                this.actions.showErrorMsg ( action.param2.message );
              }
              break;
            case ActionState.ItemsEditValid:
              this.editItemValid = action.param1;
              break;
              case ActionState.ItemsCreateValid:
              this.createItemValid = action.param1;
              break;              
          }
        });
 
  }

  ngOnInit() {
    this.editForm = new FormGroup(
      { "input_shift_package_name"      : new FormControl('', [ Validators.required ]),
        "radio_shift_publish"           : new FormControl('', [])
      }
    );
    this.createForm = new FormGroup(
      { "input_shift_package_name"      : new FormControl('', [ Validators.required ]),
      "radio_shift_publish"             : new FormControl('', []) 
      }
    );
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();  
  }
  closeShiftPackageSettings() {
    this.header.setPage( MainPageState.Settings, SubPageState.Setting_Generals );
  }
  changePackage( s_package, d_package ){
    this.selectSp = { ...s_package };
    this.defaultSp = { ...d_package };
    this.showView();

  }
  //---- Save data To API Start  ----------
  setAsDefault(){
    this.startLoading();
    this.apiService.PutDefaultShiftPackage( this.selectSp.id ).subscribe(
      res => {
        this.endLoading();
        this.actions.showSuccess( res.message );
        this.defaultSp = this.selectSp;
        this.actions.toggleShiftPackageAction( ActionState.SetDefault, this.defaultSp.id );     
      },
      err => {
        this.endLoading();
        this.actions.showErrorMsg( err.error.data );
      }
    );
  }

  saveEdit(){
    this.startLoading();
    if ( JSON.stringify( this.editSp ) != JSON.stringify( this.selectSp ) ){
      this.editSp.is_publish = this.editSp.is_publish ? 1 : 0;
      this.apiService.putShiftPackage ( this.selectSp.id, this.editSp ).subscribe( 
        res => {
          this.selectSp = this.editSp;
          this.actions.toggleShiftPackageAction( ActionState.Updated, this.selectSp.id );      
          this.endLoading();
          //this.showSuccess( res.message );         
        },
        err => {
          this.endLoading();          
          // this.actions.showErrorMsg( err.error.data );
        }
    );
    }else{
      this.actions.toggleShiftPackageAction( ActionState.Updated, this.selectSp.id );      
      this.endLoading();
    }
  }
  saveCreate(){
    this.startLoading();
    this.createSp.is_publish = this.createSp.is_publish ? 1 : 0;        
    this.apiService.postShiftPackage ( this.createSp ).subscribe(
       res => {
        this.selectSp = res.data;
        this.actions.toggleShiftPackageAction( ActionState.Created, this.selectSp.id );
        this.endLoading();
        //this.showSuccess( res.message );   
      },
      err => {
        this.endLoading();
        // this.actions.showErrorMsg( err.error.data );
      }
    );
  }
  deletePackage(){
    let confirm = this.dialogService.confirmWithoutContainer(
      'CONFIRM', 
      'CONFIRM_CONTENT_DELETE_SHIFT_PACKAGE').subscribe( ( ret )=>{
        if ( ret ){
          this.startLoading();

          this.apiService.deleteShiftPackage( this.selectSp.id ).subscribe(
            res => {
              this.actions.toggleShiftPackageAction( ActionState.Deleted );
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
//------ Show Shift Package State  start ---------
  duplicate(){
    if (this.createForm) this.createForm.reset();    
    this.createSp = { ...this.selectSp };
    delete this.createSp['id'];
    this.spViewState = SPViewState.Create;
    this.actions.toggleShiftPackageAction( ActionState.Duplicate );   
  }
  showView() {  
    this.spViewState = SPViewState.View;
    this.actions.toggleShiftPackageAction( ActionState.View, this.selectSp.id );    
  }
  showEdit(){
    if (this.editForm) this.editForm.reset();
    this.editSp = { ...this.selectSp };
    this.spViewState = SPViewState.Edit;
    this.actions.toggleShiftPackageAction( ActionState.Edit );
  }
  showCreate() {
    if (this.createForm) this.createForm.reset();
    this.createSp = {};
    this.spViewState = SPViewState.Create;
    //this.actions.toggleShiftPackageAction( ActionState.Create );
  }
//------ Show Shift Package State  end ---------------- 
//------ Compare Shift Package State  start -----------
  isSettingsShiftPackages(){
    return this.header.isSettingShiftPackages( this.page );
  }
  isView() {
    return this.spViewState == SPViewState.View;
  }
  isEdit(){
    return this.spViewState == SPViewState.Edit;
  }
  isCreate() {
    return this.spViewState == SPViewState.Create;
  }
//------ Compare Shift Package State  end  ------------
//------- Spinner start -----------------
  private startLoading() {
    this.loading = true;
  }

  private endLoading() {
    this.loading = false;
  }
  //------- Spinner start -----------------
  
}

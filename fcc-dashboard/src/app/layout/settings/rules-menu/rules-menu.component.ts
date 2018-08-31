import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { IDatePickerConfig } from 'ng2-date-picker';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DatePickerComponent } from 'ng2-date-picker';
import { ColorPickerComponent } from 'ngx-color-picker';

import { Subject } from 'rxjs/Subject';
import { Moment } from 'moment';

import { PageState, HeaderService, MainPageState, SubPageState } from 'app/layout/header.service';
import { RuleViewState, ActionsService, ActionState } from 'app/layout/actions.service';
import { ApiService } from 'app/api.service';
import { ConfirmationDialogsService } from 'app/shared/services/dialog/confirmation-dialog.service';
import { Lang } from 'app/shared/services';

var moment = require('moment');

@Component({
  selector: 'app-rules-menu',
  templateUrl: './rules-menu.component.html',
  styleUrls: ['./rules-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RulesMenuComponent implements OnInit, OnDestroy {

  dateTimePickerConfig: IDatePickerConfig = {
    firstDayOfWeek: 'su',
    monthFormat: 'MMMM YYYY',
    closeOnSelect: true,
    disableKeypress: true,
    allowMultiSelect: false,
    onOpenDelay: 0,
    weekDayFormat: 'dd',
    showNearMonthDays: false,
    showWeekNumbers: false,
    enableMonthSelector: false,
    yearFormat: 'YYYY',
    format: "D MMM, YYYY, hh:mm A",
    showGoToCurrent: false,
    dayBtnFormat: 'D',
    timeSeparator: ':',
    multipleYearsNavigateBy: 10
  };
  dateEndTimePickerConfig: IDatePickerConfig = { ...this.dateTimePickerConfig, disableKeypress:false };  
  repeatType = [ 
                 { id: 'everyDay',  name : 'Every Day'},
                 { id: 'everyWeek', name : 'Every Week'},
                 { id: 'everyMonth',name : 'Every Month'},
                 { id: 'everyYear', name : 'Every Year'}
               ];

  private componetDestroyed = new Subject();
  private loading:boolean = false;
  private page: PageState = { main: MainPageState.None, sub:SubPageState.None };

  rulesItemState: RuleViewState = RuleViewState.List;

  rules:Array<any> =[];

  select_rule:any={};
  edit_rule:any = {};
  create_rule:any = {};  

  select_rule_shifts:Array<any> = [];
  floor_packages: Array<any> = [];
  shift_packages: Array<any> = [];
  defaultSpId = -1;
  defaultFpId = -1;
  editRulesForm: FormGroup;
  createRulesForm: FormGroup;

  constructor(  private actions     : ActionsService, 
                private header      : HeaderService,  
                private apiService  : ApiService, 
                private lang        : Lang,
                private dialogService: ConfirmationDialogsService ) {

    this.header.getPage().takeUntil(this.componetDestroyed).subscribe(
      obj => {
        this.page = obj;
        if ( this.header.isSettingRules( obj ) ){
          this.showList();
        } 

      });

    this.actions.getRulesAction().takeUntil(this.componetDestroyed).subscribe( 
      action => { 
        switch ( action.action ) {
          case ActionState.Create:
            this.showCreate();
            break;          
        }
      });

  }

  ngOnInit() {
    this.editRulesForm = new FormGroup({
        "input_rule_name"         : new FormControl('', [Validators.required]),
        "dtpicker_rule_start"     : new FormControl('', []),
        "dtpicker_rule_end"       : new FormControl('', []),
        "select_repeat"           : new FormControl('', []),
        "dtpicker_rule_repeat_end": new FormControl('', []),
        "select_shift_package"    : new FormControl('', []),       
        "input_rule_color"        : new FormControl('', [])
    });
    this.createRulesForm = new FormGroup({ 
      "input_rule_name"         : new FormControl('', [Validators.required]),
      "dtpicker_rule_start"     : new FormControl('', []),
      "dtpicker_rule_end"       : new FormControl('', []),
      "select_repeat"           : new FormControl('', []),
      "dtpicker_rule_repeat_end": new FormControl('', []),
      "select_shift_package"    : new FormControl('', []),       
      "input_rule_color"        : new FormControl('', [])
    });   
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }
  @ViewChild('editEndDp')   editEndDp: DatePickerComponent;
  @ViewChild('createEndDp') createEndDp: DatePickerComponent;
  closeDatePickers() {
    if ( this.editEndDp )   this.editEndDp.api.close();
    if ( this.createEndDp ) this.createEndDp.api.close();
  }

  reloadInitialInformation(){
    this.getGeneralInfo();
    this.getShiftPackages();
    this.getFloorPackages();
    this.getRules();
  }
  //---- Get data from API Start----------
  getShiftPackages(){
    this.startLoading();
    this.apiService.getShiftPackages().subscribe( 
      res => { 
        this.shift_packages = res.data;
        this.shift_packages = this.shift_packages.filter( p => p.is_publish == 1 );
        this.endLoading();
      },
      err => {
        this.endLoading();
      }
    );
  }
  getFloorPackages(){
    this.startLoading();    
    this.apiService.getFloorPackages().subscribe( 
      res => { 
        this.floor_packages = res.data;
        this.endLoading();
      },
      err =>{
        this.endLoading();
      }
    );    
  }  
  getRules(){
    this.startLoading();   
    this.apiService.getRules().subscribe( 
      res => { 
        this.rules = res.data;
        this.rules.forEach((item ) =>{
          item.updated_at = moment( item.updated_at ).format("YYYY-MM-DD");
        });
        this.endLoading();
      },
      err =>{
        this.endLoading();
      }
    );
  }
  getShifts( shift_package_id ){
    this.select_rule_shifts = [];
    if ( !shift_package_id ) return;
    this.startLoading(); 
    this.apiService.getShifts( shift_package_id ).subscribe( 
      res => { 
        this.select_rule_shifts = res.data;
        this.endLoading();
      },
      err => {
        this.endLoading();
      }
    );
  }
  getGeneralInfo(){
    this.startLoading();
    this.apiService.getSettingsGeneral().subscribe(
      res => { 
        this.defaultFpId = parseInt( res.data.DefaultFloorPackage );
        this.defaultSpId = parseInt( res.data.DefaultShiftPackage );
        this.endLoading();
      },
      err => {
        this.endLoading();
      });
  }
  //---- Get data from API End   ----------
  //---- Save data To API Start  ----------
  saveRule( isCreate:boolean ){
    this.startLoading();
    let saveData = isCreate ? {...this.create_rule} : {...this.edit_rule };
    if ( saveData.start > saveData.end ){
      this.endLoading();
      this.actions.showError('VALIDATE_INCORRECT_RANGE_DATE');
      return;
    }
    saveData.start = saveData.start.format('YYYY-MM-DD hh:mm:ss');
    saveData.end = saveData.end.format('YYYY-MM-DD hh:mm:ss'); 
    saveData.repeat_end = saveData.repeat_end ? moment( saveData.repeat_end, 'D MMM, YYYY, hh:mm A' ).format('YYYY-MM-DD hh:mm:ss') : null;   
    saveData.repeat = saveData.repeat ? saveData.repeat : "none";

    if ( isCreate ){
      this.apiService.postRule( saveData ).subscribe(
        res => {
          this.getRules();
          this.showList();
          this.actions.toggleRulesAction( ActionState.Created );
          this.endLoading();
          this.actions.showSuccess( res.message );          
        },
        err =>{
          this.endLoading();
          this.actions.showErrorMsg( err.error.data );
        }
      );
    }else{
      this.apiService.putRule( this.edit_rule.id, saveData ).subscribe( 
        res =>{
          this.getRules();
          this.select_rule = { ...this.edit_rule };          
          this.showView();
          this.actions.toggleRulesAction(ActionState.Updated );

          this.endLoading(); 
          this.actions.showSuccess( res.message );                             
        },
        err =>{
          this.endLoading();
          this.actions.showErrorMsg( err.error.data );       
        }
      );
    }
  }
  deleteRule(){
    let confirm = this.dialogService.confirmWithoutContainer(
      'CONFIRM', 
      'CONFIRM_CONTENT_DELETE_RULE').subscribe( ( ret )=>{
        if ( ret ){
          this.startLoading();
          this.apiService.deleteRule( this.select_rule.id ).subscribe(
            res =>{
              this.getRules();
              this.rulesItemState = RuleViewState.List;
              this.actions.toggleRulesAction(ActionState.Deleted );
              this.actions.showSuccess( res.message );
              this.endLoading();
            },
            err =>{
              this.actions.showErrorMsg( err.error.data );     
              this.endLoading();
            }
          );
        }
      });
  }
 //---- Save data To API End     ----------

  convertArrayOfTimeToString( timeStrArray:Array<string> ){
    var convertArray:Array<string> = [];
    timeStrArray.forEach( (item ) =>{
      convertArray.push ( moment( item, "hh:mm").format("hh:mm A") );
    });
    return convertArray.join(",");
  }

  getFloorPackageNamebyId( id ){
    let item = this.floor_packages.find( item => item.id == id );
    // if ( !item ) {
    //    item = this.floor_packages.find( item => item.id == this.defaultFpId );
    // } 
    return item ? item.name : "";
  }
  getShiftPackageNamebyId( id ){
    let item = this.shift_packages.find( item => item.id == id );
    // if ( !item ) {
    //   item = this.shift_packages.find( item => item.id == this.defaultSpId );
    // }     
    return item ? item.name : "";    
  }
  

  closeRulesSettings() {
    this.header.setPage( MainPageState.Settings, SubPageState.Setting_Generals );
  }

  showRulesItem( rule: any ) {
    this.select_rule = rule;
    this.edit_rule = {};
    this.select_rule.start = moment( this.select_rule.start, 'YYYY-MM-DD hh:mm:ss' );
    this.select_rule.end = moment( this.select_rule.end, 'YYYY-MM-DD hh:mm:ss' );
    this.select_rule.repeat_end = this.select_rule.repeat_end ?  moment( this.select_rule.repeat_end, 'YYYY-MM-DD hh:mm:ss' ) : undefined;
    this.getShifts( this.select_rule.shift_package_id ); 

    this.showView();
  }
  //------ Show Rule State  start ----------
  showList(){
    this.reloadInitialInformation();     
    this.rulesItemState = RuleViewState.List;
  }
  showView() {
    this.rulesItemState = RuleViewState.View; 
  }
  showEdit(){
    if (this.editRulesForm ) this.editRulesForm.reset();
    this.edit_rule = {...this.select_rule };
    this.rulesItemState = RuleViewState.Edit;
  }
  showCreate() {
    this.create_rule = {};
    if (this.createRulesForm ) this.createRulesForm.reset();
    this.rulesItemState = RuleViewState.Create; 
  }
  //------ Show Rule State  end -----------
  isSettingRules(){
    return this.header.isSettingRules( this.page );
  }
  isList(){
    return this.rulesItemState == RuleViewState.List;
  }  
  isView() {
    return this.rulesItemState == RuleViewState.View;
  }
  isEdit(){
    return this.rulesItemState == RuleViewState.Edit;
  }
  isCreate() {
    return this.rulesItemState == RuleViewState.Create;
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

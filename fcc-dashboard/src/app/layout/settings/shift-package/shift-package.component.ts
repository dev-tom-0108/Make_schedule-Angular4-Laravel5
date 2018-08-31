import { FormGroup, FormControl, FormBuilder, FormArray, Validators, NgForm } from '@angular/forms';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Moment } from 'moment';

import { PageState, HeaderService, MainPageState, SubPageState } from 'app/layout/header.service';
import { SPViewState, ActionsService, ActionState } from 'app/layout/actions.service';
import { ApiService } from 'app/api.service';
import { CustomValidators } from 'app/shared/validators/custom-validators';


var moment = require('moment');
const strDefault:string = "DEFAULT";

@Component({
  selector: 'app-shift-package',
  templateUrl: './shift-package.component.html',
  styleUrls: ['./shift-package.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ShiftPackageComponent implements OnInit, OnDestroy {
  loading = false;
  private componetDestroyed = new Subject();


  timePickerConfig: any = {};
  private page: PageState = { main: MainPageState.None, sub:SubPageState.None };

  private selectSpId:number = -1;
  private spViewState:SPViewState = SPViewState.None;
  
  private selectShifts: Array<any>=[];
  private editShifts:Array<any>=[];
  private createShifts:Array<any>=[];
  private floorPackages:Array<any>=[];
  private selectedTime:Moment;

  editShiftsForm:FormGroup;
  editItems:FormArray;
  createShiftsForm:FormGroup;
  createItems:FormArray;

  constructor(private actions: ActionsService, private header: HeaderService, private apiService:ApiService, private formBuilder:FormBuilder ) {
    this.header.getPage().takeUntil(this.componetDestroyed).subscribe(
      obj => { 
        this.page = obj;
        if ( this.isSettingsShiftPackages() ) this.getFloorPackages();
      });
      this.actions.getShiftPackageAction().takeUntil(this.componetDestroyed).subscribe ( 
        action => { 
          switch ( action.action ) {
            case ActionState.View:
              this.changePackage( action.param1 );
              break;
            case ActionState.Create:
              this.showCreate();
              break;
            case ActionState.Edit:
              this.showEdit();
              break;
            case ActionState.Duplicate:
              this.duplicate();
              break;
            case ActionState.Created:
            this.saveShifts( action.param1 , true );  
              break;          
            case ActionState.Updated:
              this.saveShifts( action.param1, false );
              break; 
            case ActionState.Deleted:
              this.selectSpId = -1;
              break;
          }
        });
  }

  ngOnInit() {


    this.editShiftsForm = this.formBuilder.group({
      editShifts: this.formBuilder.array([])
    });
    this.createShiftsForm = this.formBuilder.group({
      createShifts: this.formBuilder.array([])
    });


    this.editShiftsForm.valueChanges.takeUntil(this.componetDestroyed).subscribe ( 
      form => {
        setTimeout(() => this.actions.toggleShiftPackageAction( ActionState.ItemsEditValid, this.editShiftsForm.valid && this.editShifts.length > 0  ) ) 
      });
    this.createShiftsForm.valueChanges.takeUntil(this.componetDestroyed).subscribe ( 
      form => {
        setTimeout(() => this.actions.toggleShiftPackageAction( ActionState.ItemsCreateValid, this.createShiftsForm.valid && this.createShifts.length > 0 ) ) 
      });
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();     
  }
  saveShifts( s_package_id:number, isCreate:boolean ){
      this.startLoading();
      let shifts = [];
      if ( isCreate ){
        shifts = this.createShifts.map( shift => {
          shift.shift_package_id = s_package_id; 
          return shift; 
        });
      }else {
        shifts = this.editShifts.map( shift => {
          shift.shift_package_id = s_package_id; 
          return shift; 
        });        
      }

   
      this.apiService.putShiftsOfPackage( s_package_id, shifts ).subscribe(
        res  => {
          this.actions.toggleShiftPackageAction( ActionState.ItemsUpdated, true, res );
          this.endLoading();
        },
        err=> {
          this.actions.toggleShiftPackageAction( ActionState.ItemsUpdated, false, err );
          this.endLoading();
        }
      );
  }


  createFormItem(): FormGroup {
    return this.formBuilder.group({
      input_shift_name: ['', Validators.required ],
      timepicker_addTime:[],
      select_floor_package:[null, [Validators.required, Validators.minLength(1)] ],
      input_timeslots_length:['', [Validators.required,  CustomValidators.isExistTimeSlot ] ],
      input_avg_time:['', Validators.required  ],
      input_deposit:['', Validators.required ],
      check_is_enabled:[],
    } );
  }

  getCreateFormArray(){
    this.createItems = this.createShiftsForm.get('createShifts') as FormArray;
    for (let i = this.createItems.length - 1; i >=0; i--){
      this.createItems.removeAt( 0 );
    }
    for (let i = 0; i<this.createShifts.length; i++){
      this.createItems.push( this.createFormItem() );
    }       
  }
  getEditFormArray(){
    this.editItems = this.editShiftsForm.get('editShifts') as FormArray;

    for (let i = this.editItems.length - 1; i >=0; i--){
      this.editItems.removeAt( 0 );
    }
    for (let i = 0; i<this.editShifts.length; i++){
      this.editItems.push( this.createFormItem() );
    }
  }
  getFloorPackages(){
    this.startLoading();
    this.apiService.getFloorPackages().subscribe( 
      res => { 
        this.floorPackages = res.data;
        this.showView(); 
        this.endLoading();            
      },
      err =>{
        this.endLoading();
        this.showView(); 
      });    
  }
  getShiftsFromPackage( s_package_id:number ){
    this.startLoading();
    this.apiService.getShifts( s_package_id ).subscribe( 
      res => {
        this.selectShifts = res.data;
        this.getFloorPackages();
        this.endLoading();
      },
      err => {
        this.selectShifts = [];
        this.endLoading();
        this.showView(); 
      }
    );
  }


  public getFloorPackageNamebyId( id ){
    let selFp = this.floorPackages.find( item => item.id === id );
    return selFp? selFp.name : strDefault;
  }
  public convertArrayOfTimeToString( timeStrArray:Array<string> ){
    var convertArray:Array<string> = [];
    timeStrArray.forEach( (item ) =>{
      convertArray.push ( moment( item, "hh:mm").format("hh:mm A") );
    });
    return convertArray.join(",");
  }

  public convertStrToTimeSlot( timeStr:string ){
    return moment( timeStr, "hh:mm").format("hh:mm A")
  }

  public convertTimeSlotsToStrArray( timeSlots:Array<Moment> ){
    var timeStrArray :Array<string>= [];
    timeSlots.forEach ( ( item ) => {
      timeStrArray.push( item.format("hh:mm") );
    });
    return timeStrArray;
  }
  
  public addShift( isCreating : boolean ){
    if ( isCreating ){
      let obj = {id:'', name: "", time_slots: [], floor_package_id: null, shift_package_id: this.selectSpId, is_enabled: 0, shift_atb: 0, deposit_amount: 0 };
      this.createShifts.push( obj );
      this.createItems.push( this.createFormItem() );
    }else{
      let obj = {id:'', name: "", time_slots: [], floor_package_id: null, shift_package_id: -1, is_enabled: 0, shift_atb: 0, deposit_amount: 0 };
      this.editShifts.push( obj );
      this.editItems.push( this.createFormItem() );
    }
  }
  public removeShift( isCreating :boolean,shift ){
    if ( !isCreating ){
      const index: number = this.editShifts.indexOf( shift );
      this.editShifts.splice( index, 1 );

      this.editItems.removeAt( index );

    }else{
      const index: number = this.createShifts.indexOf( shift );
      this.createShifts.splice( index, 1 );   
      
      this.createItems.removeAt( index );
    }
  }
   public showTimePicker(isCreating:boolean,  i:number){
     //console.log( i );
     //debugger;
  //   isCreating ? this.createShiftsForm.get('createShifts')[i].input_timeslots_length.setfocus() : this.editShiftsForm.get    ('editShifts')[i].input_timeslots_length.setfocus();
   }
   public blurSelect( isCreating:boolean, i:number){
    if ( isCreating ){

    }
  }
  public addTime( isCreating:boolean,  i:number, el ){
    if (el.selected[0]){
      isCreating ? this.createShifts[i].time_slots.push(el.selected[0].format("hh:mm") ) : this.editShifts[i].time_slots.push(el.selected[0].format("hh:mm") );
    }
  }

  removeSlot( isCreating:boolean, i:number, j:number ) {   
    isCreating ? this.createShifts[i].time_slots.splice(j, 1) : this.editShifts[i].time_slots.splice(j, 1);
    return;
  } 
  changePackage( s_pakcage_id:number ){
    this.selectSpId = s_pakcage_id;
    this.getShiftsFromPackage( this.selectSpId );
  }

//------ Show Shift Package State  start ---------
duplicate(){
  if ( this.createShiftsForm ) this.createShiftsForm.reset();
  this.createShifts = this.selectShifts.map( shift => { delete shift['id']; return shift;});
  this.getCreateFormArray();
  this.spViewState = SPViewState.Create;  
}
showView() {  
  this.spViewState = SPViewState.View;
}
showEdit(){
  if (this.editShiftsForm) this.editShiftsForm.reset();
  this.editShifts = this.selectShifts.map(shift => Object.assign({}, shift));
  //this.editShifts = JSON.parse( JSON.stringify( this.selectShifts ));
  this.getEditFormArray();
  this.spViewState = SPViewState.Edit;
}
showCreate() {
  if ( this.createShiftsForm ) this.createShiftsForm.reset();
  this.createShifts = [];
  this.getCreateFormArray();
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

import { FormGroup, FormControl, FormArray, Validators, NgForm } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IDatePickerConfig, DatePickerComponent } from 'ng2-date-picker';
import { Subject } from 'rxjs/Subject';

import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { BookingStates } from 'app/layout/booking/booking.service';
import { ApiService } from 'app/api.service';


var moment = require('moment');

@Component({
  selector: 'app-booking-edit',
  templateUrl: './booking-edit.component.html',
  styleUrls: ['./booking-edit.component.scss']
})

export class BookingEditComponent implements OnInit, OnDestroy {
  datePickerConfig: IDatePickerConfig = {
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
    format: "D MMM YYYY",
    showGoToCurrent: false,
    dayBtnFormat: 'D',
    timeSeparator: ':',
    multipleYearsNavigateBy: 10
  };
  loading:boolean = false;
  private componetDestroyed = new Subject();

  public status: Array<string> = BookingStates;

  public isCurrent = true;
  public booking:any={};
  public floors: Array<any> = [];
  public tables: Array<any>;
  public shifts: Array<any> =[];
  public timeSlots: Array<any> = [];
  public editForm:FormGroup;
  public viewStatus: Array<any> = [];

  constructor(
    private actions: ActionsService,
    private apiService: ApiService
  ) {

    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
      action => {
        switch ( action.action ){
          case BookingAction.Edit:
            this.booking = { ...action.param1 };
            this.isCurrent = action.param2;
            this.getInformation();
            break;
        }
      });
  }

  ngOnInit() {
    // this.status.splice( 1, this.status.length );
    this.status.forEach(status =>{
      if( status['class'] != "")
        this.viewStatus.push( status );
    })

    this.editForm = new FormGroup(
      {
        "date"                : new FormControl('', [Validators.required]),
        "shift_id"            : new FormControl('', []),
        "time"                : new FormControl('', []),
        "number_of_people"    : new FormControl('', [Validators.required]),
        "tables"              : new FormControl('', []),
        "status"              : new FormControl('', []),
        "hours"               : new FormControl('', [Validators.required]),
        "referenced_by"       : new FormControl('', []),
        "notes_by_staff"      : new FormControl('', []),                        
      }
    );
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }
  getInformation(){
    this.booking.date =  moment( this.booking.date, 'YYYY-MM-DD' );
    this.booking.time = moment( this.booking.time, 'hh:mm:ss' ).format('hh:mm');
    this.booking.tables = this.booking.tables.map( table => table.id );
    this.getShifts( this.booking.date );
    this.getFloors();
    this.getTables( this.booking.floor_package_id ); 
  }
  getFloors(){
    this.startLoading();
    this.apiService.getFloors().subscribe( 
      res => { 
        this.floors = res.data;     
        this.endLoading();  
      },
      err =>{
        this.endLoading();
      }
    );    
  }
  public getShifts( date ){
    this.startLoading();
    this.apiService.getShiftsFromDate( date.format('YYYY-MM-DD') ).subscribe( 
      res => { 
        this.shifts = res.data;    
        this.changeShift();
        this.endLoading();  
      },
      err =>{
        this.shifts =[];
        this.endLoading();
      }
    );      
  }
  getTables( f_package_id:number ){
    this.startLoading();
    this.apiService.getTables( f_package_id ).subscribe(
      res => { 
        this.tables = res.data;    
        this.endLoading();
      },
      err => {
        this.tables = [];
        this.endLoading();
      }
    )
  } 
  save(){
    this.startLoading();
    let saveData = { ...this.editForm.value,
      date: this.booking.date.format('YYYY-MM-DD'),
      shift_package_id: this.booking.shift_package_id, 
      floor_package_id: this.booking.floor_package_id,
      shift_id: this.booking.shift_id,
      guest_id: this.booking.guest_id };

    this.apiService.putBooking( this.booking.id, saveData ).subscribe(
      res => {
        saveData = {...this.booking,
          date:this.booking.date.format('YYYY-MM-DD'),
          time:moment( this.booking.time, 'hh:mm').format('hh:mm:ss')
         };
        saveData.tables = this.booking.tables.map( 
          table => { 
            return { id: table, name: this.tables.find(t => t.id == table ) ? this.tables.find(t => t.id == table ).table_name : "" };
          });

        this.actions.toggleBookingAction( BookingAction.Updated, saveData, this.isCurrent );
        this.endLoading();
        this.actions.showSuccess( res.message );          
      },
      err =>{
        this.endLoading();
        this.actions.showErrorMsg( err.error.data );
      }
    );
  }

  changeDate(){
    if ( !this.booking.date ) this.booking.date = moment( new Date() );
    this.getShifts( this.booking.date );
  }
  changeShift(){
    this.timeSlots = this.shifts.find( shift => shift.id == this.booking.shift_id )
                         .time_slots.map( time_slot => { 
                           return { id:time_slot, name:moment( time_slot, "hh:mm").format("hh:mm A") } 
                          } );
  }
  changeTimeSlot(){
  }
  convertTimeString( time: string ){
    return moment( time, "hh:mm").format("hh:mm A")
  }
  close() {
    this.actions.toggleBookingAction( BookingAction.HideEdit);
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

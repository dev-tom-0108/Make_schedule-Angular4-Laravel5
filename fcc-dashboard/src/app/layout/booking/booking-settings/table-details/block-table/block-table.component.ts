import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Moment } from 'moment';
import { Subject } from 'rxjs/Subject';

import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { HeaderService, MainPageState, SubPageState, PageState } from 'app/layout/header.service';
import { TableStatus } from 'app/layout/tableService';
import { IDatePickerConfig } from 'ng2-date-picker/date-picker/date-picker-config.model';
import { ApiService } from 'app/api.service';
var moment = require('moment');

@Component({
  selector: 'app-block-table',
  templateUrl: './block-table.component.html',
  styleUrls: ['./block-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BlockTableComponent implements OnInit, OnDestroy {

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
      
    isShow:boolean = false;
    loading = false;

    private componetDestroyed = new Subject();
    private page: PageState = { main: MainPageState.None, sub:SubPageState.None };
    
    table:any ={};
    is_all_day = false;
    date;
    start_time;
    end_time;

  constructor(
    private actions: ActionsService,
    private apiService:ApiService,
    private header : HeaderService) {


    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
      action => {
        switch ( action.action ){
            case BookingAction.Block:
                this.table = {...action.param1 };
                console.log( this.table );
                if (this.table.current) {
                    let block = this.table.current;
                    this.date = moment( block.block_date, 'YYYY-MM-DD' );
                    this.is_all_day = block.is_allday;
                    this.start_time = moment( block.time_range_from, 'HH:mm:ss' );
                    this.end_time = moment( block.time_range_to, 'HH:mm:ss' );
                }
                break;         
            case BookingAction.Search:
                this.date = moment( action.param1.date, 'YYYY-MM-DD' );
                this.start_time = moment( '00:00:00', 'HH:mm:ss' );
                this.end_time = moment( '00:00:00', 'HH:mm:ss' );
                break;
        }
      });

  }

  ngOnInit() {
    this.start_time = moment( '00:00:00', 'HH:mm:ss' );
    this.end_time = moment( '00:00:00', 'HH:mm:ss' );
  }

  close() {
    this.actions.toggleBookingAction( BookingAction.Blocked );
  }

  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }
  initialize(){
   
  }
    private startLoading() {
        this.loading = true;
    }
    private endLoading() {
        this.loading = false;
    }
  save() {
    console.log(this.start_time);
    console.log(this.end_time);
    console.log(this.date);
    console.log(this.is_all_day);

    // 
    this.startLoading();
    const data = {
        table_id: this.table.id,
        block_date: this.date.format('YYYY-MM-DD'),
        is_allday: this.is_all_day ? 1 : 0,
        time_range_from: this.start_time.format('HH:mm:ss'),
        time_range_to: this.end_time.format('HH:mm:ss')
    }
    this.apiService.blockTable(data).takeUntil(this.componetDestroyed).subscribe( 
        result=> {
            console.log(result.data);
            this.actions.showSuccess( result.message );  
            this.actions.toggleBookingAction( BookingAction.ReSet );
            this.close();
            this.endLoading();
        },
        err => {
            console.log(err);
            this.actions.showErrorMsg( err.error.data );
            this.actions.toggleBookingAction( BookingAction.ReSet );
            this.close();            
            this.endLoading();
        }
    );
  }
  unBlock() {
    this.startLoading();

    this.apiService.unblockTable(this.table.id, {date: this.date.format('YYYY-MM-DD')}).takeUntil(this.componetDestroyed).subscribe( 
        result=> {
            this.actions.showSuccess( result.message );   
            this.actions.toggleBookingAction( BookingAction.ReSet );
            this.close();            
            this.endLoading();
        },
        err => {
            console.log(err);
            this.actions.showErrorMsg( err.error.data );
            this.actions.toggleBookingAction( BookingAction.ReSet );
            this.close();            
            this.endLoading();
        }
    );
  }
}

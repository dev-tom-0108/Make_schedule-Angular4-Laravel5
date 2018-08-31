import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarModule } from 'angular-calendar';
import { getMonth, 
  getDate, 
  getDay, 
  getHours,
  getMinutes, 

  startOfHour,
  endOfHour,
  startOfMinute,
  endOfMinute,   
  startOfDay, 
  endOfDay, 
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth, 
  isSameDay, 
  isSameMonth,

  subDays, 
  addDays,   
  addHours } from 'date-fns';
import *  as RRule from 'rrule';

import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { repeat } from 'rxjs/operators/repeat';
import { Moment } from 'moment';

import { ActionState, ActionsService } from 'app/layout/actions.service';
import { MainPageState, SubPageState, HeaderService, CalendarRepeatType, PageState } from 'app/layout/header.service';
import { ApiService } from 'app/api.service';

var moment = require('moment');

interface RecurringEvent {
  id:number;
  title: string;
  color: any;
  start: Date;
  end  : Date;
  repeat_end : Date;
  rrule?: {
    freq: RRule.Frequency;
    bymonth?: number;
    bymonthday?: number;
    byweekday?: number[];
    byhour?:number;
    byminute?:number;
  };
}
@Component({
  selector: 'app-rules',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit, OnDestroy {

  repeatType = CalendarRepeatType;

  private loading:boolean = false;
  private componetDestroyed = new Subject();
  private page: PageState = { main: MainPageState.None, sub:SubPageState.None };

  view: string = 'month';
  viewDate: Date = new Date();
  recurringEvents: RecurringEvent[] = [];
  NoRecEvents:Array<any>=[];
  calendarEvents: CalendarEvent[] = [];
  modalData: {
    action: string;
    event: CalendarEvent;
  };
  calactions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();
  events=[];
  
  activeDayIsOpen: boolean = true;


  constructor(
    private actions: ActionsService, 
    private header : HeaderService,
    private apiService:ApiService) {
    this.header.getPage().takeUntil(this.componetDestroyed).subscribe( 
      obj => { 
        this.page = obj;
        if ( this.header.isSettingRules( this.page )){
          this.loadEvents();    
        }
      });

    this.actions.getRulesAction().takeUntil(this.componetDestroyed).subscribe( 
      action => { 
        switch ( action.action ) {
          case ActionState.Created:
          case ActionState.Updated:
          case ActionState.Deleted:
            this.loadEvents();
            break;          
        }
      });
  }
  ngOnInit() {

  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }  
  loadEvents(){
    this.startLoading();
    this.apiService.getRules().subscribe(
      res => {
        this.endLoading();
        this.events = []; // create a new array here, angular will then be able to pick it up
        let rules = res.data;

        this.setReccurenceEvents( rules );
        this.setCalendarEvents();

        this.refresh.next();

    },
    err => {
      this.endLoading();
    });
  }
  setReccurenceEvents( rules :any ){
    this.recurringEvents = [];
    this.NoRecEvents = [];
    rules.forEach( item => {
      let temp:RecurringEvent = {
        id    :item.id,
        title : item.name,
        start : item.start,
        end   : item.end,
        repeat_end: item.repeat_end,        
        color : item.color ? { primary: item.color,secondary:item.color } :  { primary: 'green',secondary: 'green' }, 
        rrule :{ freq: null }
      };          
      switch ( item.repeat ){
        case this.repeatType[0]:
          temp.rrule.freq = RRule.DAILY;
          break;
        case this.repeatType[1]:
          temp.rrule.freq = RRule.WEEKLY;
          temp.rrule.byweekday = [ (getDay(item.start) + 6) % 7 ];              
          break;
        case this.repeatType[2]:
          temp.rrule.freq = RRule.MONTHLY;
          temp.rrule.bymonthday = getDate(moment(item.start, 'YYYY-MM-DD hh:mm').toDate());               
          break;
        case this.repeatType[3]:
          temp.rrule.freq = RRule.YEARLY;
          temp.rrule.bymonth = getMonth(moment(item.start, 'YYYY-MM-DD hh:mm').toDate() ) + 1;
          temp.rrule.bymonthday = getDate(moment(item.start, 'YYYY-MM-DD hh:mm').toDate() );                                
          break;
        default:
          //temp.rrule.freq = RRule.DAILY;
          //temp.repeat_end = temp.end;
          break;                                          
      }
      temp.rrule.byhour = getHours( moment(item.start, 'YYYY-MM-DD hh:mm').toDate() );
      temp.rrule.byminute = getMinutes( moment(item.start, 'YYYY-MM-DD hh:mm').toDate() );
      if (item.repeat != "none") {
        this.recurringEvents.push( temp );
      } else {
        this.NoRecEvents.push({
          start: item.start,
          end  : item.end,
          color: item.color ? { primary: item.color,secondary:item.color } :  { primary: 'green',secondary: 'green' }, 
          title: item.name,
          id: item.id} );
      }
    });
  }
  setCalendarEvents(){
    this.events = [];
    const startOfPeriod: any = {
      month: startOfMonth,
      week: startOfWeek,
      day: startOfDay
    };

    const endOfPeriod: any = {
      month: endOfMonth,
      week: endOfWeek,
      day: endOfDay
    };
    this.recurringEvents.forEach(event => {
      
      let rule: RRule = new RRule(
        Object.assign({}, event.rrule, {
          dtstart: startOfPeriod['day'](event.start),
          until: event.repeat_end ? endOfPeriod['day']( moment(event.repeat_end, 'YYYY-MM-DD hh:mm').toDate()) : endOfPeriod[this.view]( this.viewDate )
        })
      );
      let start = moment(event.start, 'YYYY-MM-DD hh:mm').toDate();
      let end = moment(event.end, 'YYYY-MM-DD hh:mm').toDate();

      let diff = Math.abs( start.getTime() - end.getTime() ) / ( 1000 * 3600  );
      rule.all().forEach( date => {
        this.events.push(
          Object.assign({}, event, {
            start: addHours( moment(date, 'YYYY-MM-DD hh:mm').toDate(), 0 ),
            end  : addHours( moment(date, 'YYYY-MM-DD hh:mm').toDate(), diff ),
            color: event.color,
            title: event.title,
            id: event.id
          })
        );
      });
    });
    this.NoRecEvents.forEach( event =>{
      this.events.push( {
        start: addHours( startOfDay(moment(event.start, 'YYYY-MM-DD hh:mm').toDate()), 0 ),
        end  : addHours( endOfDay(moment(event.end, 'YYYY-MM-DD hh:mm').toDate()) , 0 ),
        color: event.color,
        title: event.title,
        id: event.id
        });
    });
    this.refresh.next();        
  }
  ViewChange( ){
    this.activeDayIsOpen = false;
    console.log(this.viewDate);
    this.startLoading();
    
    this.setCalendarEvents();
    this.endLoading();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    console.log("I am clicked!");
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventTimesChanged({
      event,
    newStart,
    newEnd
    }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
    console.log( event );
  }

  handleEvent(action: string, event: CalendarEvent): void {
    //this.modalData = { event, action };
    console.log( action );
  }

  addEvent(): void {
    this.events.push({
      title: 'New event',
      start: startOfDay(moment('', 'YYYY-MM-DD hh:mm').toDate()),
      end: endOfDay(moment('', 'YYYY-MM-DD hh:mm').toDate()),
      color: { primary: 'green',secondary: 'green' },
      resizable: {
        beforeStart: true,
        afterEnd: true
      }
    });
    
    this.refresh.next();
  }
  isSettingRules(){
    return this.header.isSettingRules(this.page);
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

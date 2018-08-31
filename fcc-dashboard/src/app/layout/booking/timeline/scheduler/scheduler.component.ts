import { Component, AfterContentInit, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { BookingService, BookingStates } from 'app/layout/booking/booking.service';
import { TableStatus } from 'app/layout/tableService';
declare var Ext: any;
declare var Sch: any;
var moment = require('moment');

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit, OnDestroy {
  scheduler;
  timer;
  schWidth;
  headerHeight;
  bookingsListState: boolean = false;
  bookingSettingsState: boolean = false;
  newBookingState: boolean = false;
  view: string = 'timeline';

  loading = false;
  isShow:boolean = false;
  private componetDestroyed = new Subject();
  private tables:Array<any>= [];
  bookings:any;
  private floors:Array<any>;
  date:any;
  selectShift:any;
  selectFId:any;
  private blocktables:Array<any>= [];

  isAllShift:boolean = false;
  constructor(
    private actions       : ActionsService,
    private bookingService: BookingService) {

    this.getFloors();

    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
      action => {
        switch ( action.action ){
          case BookingAction.Search:
            if (action.param2) {
                clearInterval(this.timer);

                if (this.scheduler){
                    this.scheduler.destroy();
                }
            } else {
                this.initialize( action.param1 );
            }

            break;
          case BookingAction.ReSet:         
            this.getTables( this.selectShift.floor_package_id, this.selectFId ); 
            this.getBlockTables(this.date);
            break;
          case BookingAction.SelectTable:
            break;
          case BookingAction.DeselectTable:
            break;
        }
      });

    if (window.innerWidth < 971) {
      this.headerHeight = 56;
    }
    else {
      this.headerHeight = 74;
    }
  }
  ngOnInit() { 
    //this.renderScheduler();
    this.timer = setInterval(function () {
      if (document.querySelectorAll('.sch-header-indicator')[0])
        document.querySelectorAll('.sch-header-indicator')[0].textContent = new moment().format("hh:mm A");
    }, 10000);
  }

  ngOnDestroy(){
    clearInterval(this.timer);

    if (this.scheduler){
        this.scheduler.destroy();
    }

    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }    
  // toggleView(obj){
  //   this.view = obj.view;
  //   if(this.view == 'timeline')
  //     this.rerenderScheduler();
  // }
  getFloors(){
    this.startLoading();
    this.bookingService.getFloors().subscribe( 
      res => { 
        this.floors = JSON.parse(JSON.stringify( res.data ));
        this.selectFId = this.floors[0].id;
        this.endLoading();
      }, err =>{
        this.endLoading();
      }); 
  }
  getTables( f_package_id:number, floor_id?:number ){
    this.startLoading();
    this.bookingService.getTables( f_package_id ).subscribe(
      res => { 
        if ( floor_id)
          this.tables = res.data.filter( table => table.floor_id === floor_id);
        else
          this.tables = res.data;

        this.tables = this.tables.map( table => {
          let floor = this.floors.find( f => f.id === table.floor_id );
          table.floor_name = floor.name;
          return table;
        });
        //this.drawTables(this.tables);
        this.getBookings(this.date, this.selectShift.id, this.isAllShift ? this.selectShift.shift_package_id : null );
        this.endLoading();
      },
      err => {
        this.tables = [];
        //this.drawTables(this.tables);
        this.endLoading();
      }
    )
  }
  getBlockTables(date) {
      this.bookingService.getBlockTables(date).subscribe(
        res => { 
            this.blocktables = res.data;
            console.log(this.blocktables);
          },
          err => {
            this.blocktables = [];
          }
      );
  }
  getBookings(date:string, shift_id:number, shift_package_id:number){
    this.startLoading();
    if (this.isAllShift) {
        this.bookingService.getBookings(date, shift_id, '', null, null, shift_package_id).subscribe(
            res => { 
                this.bookings = res.data;
                console.log( res.data );
                if (this.scheduler){
                this.scheduler.destroy();
                }
                this.renderScheduler();
                this.endLoading();
            },
            err => {
                this.bookings = [];     
                this.renderScheduler(); 
                this.endLoading();
            });
    } else {
        this.bookingService.getBookings(date, shift_id, '').subscribe(
        res => { 
            this.bookings = res.data;
            console.log( res.data );
            if (this.scheduler){
            this.scheduler.destroy();
            }
            this.renderScheduler();
            this.endLoading();
        },
        err => {
            this.bookings = [];     
            this.renderScheduler(); 
            this.endLoading();
        });
    }
  }

  getCurrentAndUpcoming( table_id:number ){

    let bookingsBySelectTable = this.bookings.filter( booking => this.checkTables( booking.tables, table_id ) );
    let CurrentBooking = null;
    let UpcomingBooking = null;
    let tableStatus = TableStatus.Available;
    if ( bookingsBySelectTable.length > 0 ){

      let currentDate = moment();
      bookingsBySelectTable.forEach( booking =>{

          let bookingStartDate = moment( booking.date + " " + booking.time, 'YYYY-MM-DD hh:mm:ss');
          let bookingEndDate = moment( booking.date + " " + booking.time, 'YYYY-MM-DD hh:mm:ss').add( booking.hours, 'hours');

          if ( currentDate > bookingStartDate ){

            if ( currentDate < bookingEndDate ){

              if ( !CurrentBooking ){
                CurrentBooking = booking;
                tableStatus = TableStatus.Processing;
              }else{
                tableStatus = TableStatus.Overlapping;
              }
            }else{

            }
          }else if ( currentDate.date() == bookingStartDate.date() ){
            if ( UpcomingBooking ) {

              let UpcomingDate = moment( UpcomingBooking.date + " " + UpcomingBooking.time, 'YYYY-MM-DD hh:mm:ss');
              if ( UpcomingDate - currentDate > bookingStartDate - currentDate ) UpcomingBooking = booking;

            }else{
              UpcomingBooking = booking;
            }

            if ( tableStatus == TableStatus.Available ) tableStatus = TableStatus.Upcoming;
          }
      });
    }

    return { status: tableStatus, current: CurrentBooking, upcoming: UpcomingBooking };
  }  
  checkTables( tables:Array<any>, table_id:number ){
    return tables.filter( table => table.id == table_id).length > 0 ? true : false;
  }
  initialize( info:any){
    this.date = info.date;
    this.selectShift = info.shift;
    this.selectFId = info.floorId;
    this.isAllShift = info.isAllShift;
    //this.getFloors();
    this.getTables( this.selectShift.floor_package_id, this.selectFId );
    this.getBlockTables(this.date); 
    //this.renderScheduler();
  }

  onResize(event) { 
    this.rerenderScheduler();
  }
  rerenderScheduler(){

    if(!this.scheduler)
        return;
    
    if (window.innerWidth < 971){
      if(this.bookingSettingsState || this.bookingsListState || this.newBookingState)
        this.scheduler.width = window.innerWidth - 342;
      else 
        this.scheduler.width = window.innerWidth; 
    }
    else{
      if(this.bookingSettingsState || this.bookingsListState || this.newBookingState)
        this.scheduler.width = window.innerWidth - 342 - 74;
      else 
        this.scheduler.width = window.innerWidth - 74; 
    }
    this.scheduler.height = window.innerHeight - this.headerHeight;
    if(this.scheduler.view)
      this.scheduler.getView().refresh();

  }


  makeScedulerData(){
    let data:any ={ resources:[], events:[]};
    if ( !this.tables ) return;
    this.tables.forEach(table=>{
      data.resources.push( { ...table, Id: table.id } );
    });
    if ( !this.bookings ) return;
    
    this.bookings.forEach( booking =>{
      let bStatus = BookingStates.find( b => b.id == booking.status );

      booking.tables.forEach( table =>{
        let bookingStartDate = moment( booking.date + " " + booking.time, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD hh:mm:ss A');
        let bookingEndDate = moment( booking.date + " " + booking.time, 'YYYY-MM-DD hh:mm:ss').add( booking.hours, 'hours').format('YYYY-MM-DD hh:mm:ss A');
        let color = '#585F68';

        data.events.push( { ...booking, Id      : booking.id + ":" + table.id, 
                                        table_id: table.id, 
                                        start   : bookingStartDate, 
                                        end     : bookingEndDate,
                                        bStatus : { ...bStatus } });
      });
    });

    if (!this.blocktables) return;

    this.blocktables.forEach( blocked =>{
        let bStatus = BookingStates.find( b => b.id == 'Blocked' );
        let bookingStartDate;
        let bookingEndDate;
        console.log(blocked);
        blocked.name = 'Blocked';
        if (blocked.is_allday) {
            blocked.number_of_people = ' all day';
            bookingStartDate = moment( blocked.block_date + " 00:00:00", 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD hh:mm:ss A');
            bookingEndDate = moment( blocked.block_date + " 23:59:59", 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD hh:mm:ss A');
        } else {
            bookingStartDate = moment( blocked.block_date + " " + blocked.time_range_from, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD hh:mm:ss A');
            bookingEndDate = moment( blocked.block_date + " " + blocked.time_range_to, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD hh:mm:ss A');
            const blockStartTime = moment( blocked.block_date + " " + blocked.time_range_from, 'YYYY-MM-DD hh:mm:ss').format('hh:mm A');            
            const blockEndTime = moment( blocked.block_date + " " + blocked.time_range_to, 'YYYY-MM-DD hh:mm:ss').format('hh:mm A');
            blocked.number_of_people = blockStartTime + '-' + blockEndTime;
        }
    
        // let color = '#585F68';

        data.events.push( { ...blocked, Id      : blocked.id + ":" + blocked.table_id, 
                                        table_id: blocked.table_id, 
                                        start   : bookingStartDate, 
                                        end     : bookingEndDate,
                                        bStatus : { ...bStatus },
                                        locked  : true });
    });

    return data;  
  }
  renderScheduler() {
    if (window.innerWidth < 971){
      if(this.bookingSettingsState || this.bookingsListState || this.newBookingState)
        this.schWidth = window.innerWidth - 342;
      else 
        this.schWidth = window.innerWidth; 
    }
    else{
      if(this.bookingSettingsState || this.bookingsListState || this.newBookingState)
        this.schWidth = window.innerWidth - 342 - 74;
      else 
        this.schWidth = window.innerWidth - 76; 
    }

    Ext.define('Sch.model.Event', {
      extend          : 'Sch.model.Event',
  
      startDateField  : 'start',
      endDateField    : 'end',
  
      // just rename the fields
      resourceIdField : 'table_id',
      nameField       : 'name',

      fields          : [
                          { name : 'start', type : 'date', dateFormat : "Y-m-d H:i:s A" },
                          { name : 'end',   type : 'date', dateFormat : "Y-m-d H:i:s A" }
                        ],

    });
    
    var eventStore = Ext.create('Sch.data.EventStore', {
      model : 'Sch.model.Event',
      proxy : {
                type: 'memory'
              }
    });

    let data = this.makeScedulerData();

    var resourceStore = Ext.create('Sch.data.ResourceStore', {
      type      : 'resourcestore',
      groupField: 'floor_name'
    });
    
    resourceStore.loadData( data.resources );

    // sort floor name
    var length = resourceStore.data._groups.items.length;
    for (let i = 0; i < length; i++) {
      for (let j = i + 1; j < length; j++) {
        if ( Number( resourceStore.data._groups.items[i].items[0].id ) > Number( resourceStore.data._groups.items[j].items[0].id )) {
            var swap = resourceStore.data._groups.items[i];
            resourceStore.data._groups.items[i] = resourceStore.data._groups.items[j];
            resourceStore.data._groups.items[j] = swap;
        }
      }
    }

    eventStore.proxy.data = data.events;
    eventStore.load();

    Sch.preset.Manager.registerPreset('dayHours', {
      shiftIncrement    : 1,
      shiftUnit         : 'DAY',
      timeColumnWidth   : 100,
      timeResolution    : {
                          unit: Sch.util.Date.MINUTE,
                          increment: 30
                        },
      headerConfig      : {
                            middle: {
                              unit        : 'HOUR',
                              dateFormat  : 'g:i A'
                            }
                          }
    });

    var timeLine = Ext.create('Sch.plugin.CurrentTimeLine', { updateInterval: 10000 });



    let startDate = moment( this.date ).toDate().setHours( 0 );
    let EndDate =  moment( this.date ).toDate().setHours( 24 );


    this.scheduler = Ext.create('Sch.panel.SchedulerGrid', {
      width                     : this.schWidth,
      height                    : window.innerHeight - this.headerHeight,
      rowHeight                 : 56,
      sortableColumns           : false,
      renderTo                  : "scheduler",
      viewPreset                : 'dayHours',
      eventBodyTemplate         : `<div style='background-color:{bStatus.color}' class='event'>
                                    <div style='overflow:hidden'>{name} | {number_of_people}</div>
                                    <div class='icon {bStatus.class}'></div>
                                    <div class='eventBorder'></div>
                                  </div>`,
      startDate                 : new Date( startDate ),
      endDate                   : new Date( EndDate ),
    //   constrainDragToResource   : false,
      eventResizeHandles        : 'none',
      zoomOnTimeAxisDoubleClick : false,
      zoomOnMouseWheel          : false,
      readOnly                  : false,
      plugins                   : [timeLine],
      columns                   : [{
                                    header: 'Table',
                                    sortable: false,
                                    width: 80,
                                    dataIndex: 'table_name',
                                    menuDisabled: true
                                  },
                                  {
                                    header: '#',
                                    sortable: false,
                                    width: 60,
                                    dataIndex: 'seats',
                                    menuDisabled: true
                                  }],
      features                  : [
                                    {
                                      id: 'group',
                                      ftype: 'scheduler_grouping',
                                      groupHeaderTpl: '{name}',
                                      hideGroupedHeader: true,
                                      enableGroupingMenu: false,
                                    }
                                  ],
      viewConfig                : {
                                    getRowClass: function (resourceRecord) {
                                      // if (!resourceRecord.get('Available')) {
                                      //   return 'blocked';
                                      // }
                                      return '';
                                    }

                                  },
        // Constrain events horizontally within their current day
        getDateConstraints : function(resourceRecord, eventRecord) {
            if (eventRecord) {


                var minDate, maxDate;

                if (eventRecord instanceof Date) {
                    var date = eventRecord;
                    var tick = this.timeAxis.getAt(Math.floor(this.timeAxis.getTickFromDate(date)));

                    minDate = tick.data.start;
                    maxDate = tick.data.end;
                } else {
                    
                    var constrainedStartDate = eventRecord.getStartDate();
                    var constrainedEndDate = eventRecord.getEndDate();

                    var minTick = this.timeAxis.getAt(Math.floor(this.timeAxis.getTickFromDate(constrainedStartDate)));
                    var maxTick = this.timeAxis.getAt(Math.floor(this.timeAxis.getTickFromDate(constrainedEndDate)));

                    minDate = constrainedStartDate;
                    maxDate =constrainedEndDate;
                }

                return {
                    start : minDate,
                    end   : maxDate
                };
            }
        },
      resourceStore             : resourceStore,
      eventStore                : eventStore,

    });

    this.scheduler.on('eventclick',   this.SelectBooking.bind(this) );
    this.scheduler.on('scheduleclick', this.selectTable.bind(this) );
    this.scheduler.on('beforeeventdropfinalize',this.dragDropBooking.bind(this));
    this.scheduler.on('beforedragcreate', this.beforeDragBooking.bind(this));
    this.scheduler.on('beforeeventdrag', this.beforeEventDrag.bind(this));

  }

  isAvailable(table_id, date) {
    let bStatus = this.blocktables.find( 
        b => b.table_id == table_id && ( b.is_allday || (b.time_range_from <= date.format('hh:mm:ss') && b.time_range_to >= date.format('hh:mm:ss')) )
    );
    return bStatus;
  }

  selectTable(scheduler, clickedDate, rowIndex, resource, e, eOpts) {
    const table_id = resource.data.id;
    // if (this.isAvailable(table_id, clickedDate)) {
    //     return;
    // }
    let tableBookings = this.getCurrentAndUpcoming( resource.data.id );
    this.actions.toggleBookingAction( BookingAction.SelectTable, { ...tableBookings, id:resource.data.id, name:resource.data.table_name } );  

  }
  SelectBooking( scheduler, eventRecord, e, eOpts ) {
    if (eventRecord.data.bStatus.id != 'Blocked') {
    //if (resource.get('Available')) {
        console.log( eventRecord.data );
        console.log( eventRecord.data.table_id );
        //let tableBookings = this.getCurrentAndUpcoming( eventRecord.data.table_id );
  
        let tableBooking = { status:TableStatus.Processing, current:eventRecord.data, upcoming:null }
        this.actions.toggleBookingAction( BookingAction.Select, eventRecord.data, false );
      //}
    } else {      
        let tableBooking = { status:TableStatus.Block, current:eventRecord.data, upcoming:null };
        console.log( eventRecord.data );
        let table = this.tables.find( f => f.id === eventRecord.data.table_id );
        this.actions.toggleBookingAction( BookingAction.SelectTable, { ...tableBooking, id:table.id, name:table.table_name } );          
        this.actions.toggleBookingAction( BookingAction.Block, { ...tableBooking, id:table.id, name:table.table_name } );        
    }

  }
  dragDropBooking(dragZone, dragContext, e, eOpts){
    console.log( dragContext);
    console.log( dragContext.draggedRecords[0].data);
    console.log( dragContext.newResource.data);

    const new_table_id = dragContext.newResource.data.id;
    const table_id = dragContext.resourceRecord.data.id;
    const booking_id = dragContext.draggedRecords[0].data.id;
    
    if (table_id == new_table_id) {
        return;
    }

    const data = {
        table_id : table_id,
        update_table_id : new_table_id,
    };
    this.startLoading();
    this.bookingService.updateAssignedTable(booking_id, data).takeUntil(this.componetDestroyed).subscribe( 
        result=> {
            this.endLoading();
            dragContext.draggedRecords[0].data.tables.filter( 
                table => {
                    if (table.id == table_id) {
                        table.id = new_table_id;
                        table.name = dragContext.newResource.data.table_name;
                    }
                }
            );
            
            this.actions.showSuccess( result.message );            
        },
        err => {
            console.log(err);
            this.endLoading();            
            this.actions.showErrorMsg( err.error.data );
        }
    );
  }
  beforeDragBooking( scheduler, resource, date, e, eOpts ){
    return false;
  }
  beforeEventDrag( scheduler, record , e ){
    if (record.data.bStatus.id == 'Blocked') {
        return false;
    }
    return true;
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



import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'fabric';
import { Moment } from 'moment';

import { ActionsService, BookingAction } from 'app/layout/actions.service';
import { TableService, TableStyle, TableStatus } from 'app/layout/tableService';
import { CanvasSize } from 'app/layout/header.service';
import { BookingService, BookingStates } from 'app/layout/booking/booking.service';
import { ConfirmationDialogsService } from 'app/shared/services/dialog/confirmation-dialog.service';


var moment = require('moment');

declare const fabric: any;
var FontFaceObserver = require('fontfaceobserver');

const timeInterval = 10000;
const defaultSelectColor = '#BEC4CD';
const defaultStaffColor = 'green';
@Component({
  selector: 'app-floors',
  templateUrl: './floors.component.html',
  styleUrls: ['./floors.component.scss']
})
export class FloorsComponent implements OnInit, OnDestroy {

  loading = false;
  private componetDestroyed = new Subject();
  date:any;
  selectShift:any={};
  selectFId:number = null;
  tables:Array<any>=[];
  floors:Array<any>=[];
  tablesGroups:Array<any> =[];
  timesGroups :Array<any>=[];
  selectTableIds:Array<number>=[];
  selectStaff:any;
  isStaffSetting: boolean = false;
  selectColor:string = defaultSelectColor;
  bookingsByTableId = [];
  bookings = [];

  fabricCanvas: any = {};;


  constructor(
    private actions       : ActionsService,
    private bookingService: BookingService,
    private tableService  : TableService,
    private dialogService : ConfirmationDialogsService) {
    
    this.getFloors();

    this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
      action => {
        switch ( action.action ){
          case BookingAction.Search:
            if (action.param2) break;
            this.initialize( action.param1 );
            break;
          case BookingAction.Searched:
            this.afterGetBookings( action.param1 );
            break;
          case BookingAction.SearchedStaff:
            this.afterGetStaffs( action.param1 );
            break;
          case BookingAction.SelectStaff:
            this.afterSelectStaff( action.param1 );
            break;
          case BookingAction.DeSelectStaff:
            this.afterDelselectStaff();
            break;
          case BookingAction.SaveTables:
            this.saveStaffTables( action.param1 );
            break;
          case BookingAction.DeleteTables:
            this.clearAllTables( action.param1 );       
            break;                      
        }
      });

   }

  ngOnInit() {
    var myfont = new FontFaceObserver("Heebo");
    this.fabricCanvas = new fabric.Canvas('floorViewCanvas');
    this.fabricCanvas.setDimensions(CanvasSize);
    this.fabricCanvas.on('mouse:down', this.tableClick.bind(this));
    let timer = setInterval( () =>{
      this.drawTables( this.tables );
    }, timeInterval );  
  }

  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }

  saveStaffTables( staffId:number ){
    this.startLoading();
    let assigned_tables = this.selectTableIds.map( id =>{
      return { table_id: id, apply_date: this.date, shift_id: this.selectShift.id};
    });
    let selecting_data = this.makeSendTables();
    if(selecting_data.length == 0)
      this.bookingService.setDisableClearBtnFlag(false);
    else
      this.bookingService.setDisableClearBtnFlag(true);

    this.bookingService.updateStaffTables( staffId, assigned_tables ).subscribe(
      res => {
        this.endLoading();           
        this.actions.showSuccess( res.message );
        this.actions.toggleBookingAction( BookingAction.UpdatedTables, selecting_data );
      }, 
      err => {
        this.endLoading();
        this.actions.showErrorMsg( err.error.data );
      });

  }

  clearAllTables(staffId:number){
    this.startLoading();
    let confirm = this.dialogService.confirmWithoutContainer(
      'CONFIRM', 
      'CONFIRM_BOOKING_CLEAR_ALL_ASSIGN').subscribe( ret=>{
        if ( ret ){
          this.bookingService.deleteStaffTables( staffId ).subscribe(
            res => {
              this.endLoading();           
              this.actions.showSuccess( res.message );
              this.selectTableIds = [];
              this.actions.toggleBookingAction( BookingAction.UpdatedTables, [] );
              this.bookingService.setDisableClearBtnFlag(false);
            }, 
            err => {
              this.endLoading();
              this.actions.showErrorMsg( err.error.data );
            });
        }else{

        }
      });
  }    

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

  getTables( f_package_id:number, floor_id:number ){
    this.startLoading();
    this.bookingService.getTables( f_package_id ).subscribe(
      res => { 
        this.tables = res.data.filter( table => table.floor_id === floor_id );
        this.drawTables(this.tables);
        this.endLoading();
      },
      err => {
        this.tables = [];
        this.drawTables(this.tables);
        this.endLoading();
      }
    )
  }

  getBookingsByTableId( date, table_id:number ){
    this.startLoading();
    this.bookingService.getBookingsByTableId( date, table_id ).subscribe(
      res => { 
        this.bookingsByTableId = res.data;
        //this.drawTables(this.tables);
        this.endLoading();
      },
      err => {
        this.tables = [];
        //this.drawTables(this.tables);
        this.endLoading();
      }
    )
  }

  initialize( info:any){
    this.date = info.date;
    this.selectShift = info.shift;
    this.selectFId = info.floorId;
    this.getTables( this.selectShift.floor_package_id, this.selectFId );    
  }
  afterGetBookings( bookings ){
    this.bookings = bookings; 
    this.drawTables( this.tables );  
  }
  afterGetStaffs( staffs ){
    if ( !this.selectStaff ) return;
    let selStaff = staffs.find( staff => staff.id == this.selectStaff.id );
    if ( selStaff ) this.afterSelectStaff( selStaff );
  }
  afterSelectStaff( staff:any ){
    this.selectStaff = { ...staff };
    // Set default staff color
    if( 'table_color' in this.selectStaff ){
      if( this.selectStaff.table_color == null )
        this.selectStaff.table_color = defaultStaffColor;
    }
    else
      this.selectStaff.table_color = defaultStaffColor;

    this.selectTableIds = this.selectStaff.tables.map( table => { return table.id });
    this.isStaffSetting = true;
    this.selectColor = this.selectStaff.table_color;
    //this.selectColor = "#00FF00";
    this.drawTables( this.tables );
    
    let firstTestDisable = this.makeSendTables();
    if(firstTestDisable.length == 0)
      this.bookingService.setDisableClearBtnFlag(false);
    else
      this.bookingService.setDisableClearBtnFlag(true);
  }
  afterDelselectStaff(){
    this.selectStaff = null;
    this.selectTableIds = [];
    this.isStaffSetting = false;
    this.selectColor = defaultSelectColor;
    this.drawTables( this.tables );    
  }
  makeSendTables(){
    return this.selectTableIds.map( id => {
      return {id:id, name: this.tables.find( t=> t.id == id ).table_name }
    });
  }
  concatCAUBookingToTable(){
    this.tables.forEach( table =>{
      table.bookings = this.getCurrentAndUpcoming( table.id );
      if ( table.bookings.status == TableStatus.Processing ) {
        table.percent = this.calcPercentOfParty( table.bookings );
      }
      if ( table.bookings.status == TableStatus.Upcoming ){
        table.table_layout.time = moment( table.bookings.upcoming.time, 'hh:mm:ss' ).format('hh:mm A');
      }
    });
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

  calcPercentOfParty( bookings ){
    let hours       = bookings.current.hours;
    let startTime   =  moment( bookings.current.date + " " + bookings.current.time, 'YYYY-MM-DD hh:mm:ss'); 
    let currentTime = moment( );
    let pastTime    = currentTime - startTime;
    let percent     = ( pastTime / ( 3600.0 * 1000 ) ) / hours * 100;
    return percent;
  }
  checkTables( tables:Array<any>, table_id:number ){
    return tables.filter( table => table.id == table_id).length > 0 ? true : false;
  }

  drawTables(tables:Array<any>){

    this.concatCAUBookingToTable();
    this.fabricCanvas.allowTouchScrolling = true;
 
    this.tablesGroups = tables.map( table => { table.style = table.style.toString(); 
                                          return this.createTable(table) } );                          
    this.initTables();
    this.setTableSelection( false );
  }

  addTimesGroup(){
    this.timesGroups = [];
    this.fabricCanvas.forEachObject( g => {
      if ( g.type == 'group' && g.tableObj.bookings.status == TableStatus.Upcoming ){
        let timeGroup = this.tableService.createTimeGroup( g );
        this.timesGroups.push( timeGroup );
      } 
    });  
  }

  createTable( table: any ) {

    //let id = table.id || this.lastId++;
    //console.log( table );
    let color = table.table_layout.rect.fill;
    if ( table.bookings.status == TableStatus.Processing ){
        let bStatus = BookingStates.find( b => b.id == table.bookings.current.status );
        color = bStatus ? bStatus.color : color;
    }
    table.color = color;
    let group: any = {};
    if ( table.style == TableStyle.Circle ) {
      group = this.tableService.createCircleGroup(table);
    }
    if ( table.style == TableStyle.Rect ) {
      group = this.tableService.createRectGroup(table);
    }
    let textGroup = this.tableService.createTextGroup(table);
    group.add(textGroup);
    if ( table.bookings.status ==  TableStatus.Processing ){
      let percentGroup = this.tableService.createPercentGroup( table );
      group.add( percentGroup );
    }

    group.name        = table.name;
    group.hasControls = true;
    group.hoverCursor = "pointer";
    group.hasBorders  = true;

    //group.type        = table.style;
    group.tableObj    = table;
    group.seats       = table.seats;    
    group.scaleX      = table.table_layout.scaleX;
    group.scaleY      = table.table_layout.scaleY;

    group.minScaleLimit  = this.tableService.minScale;
    group.maxScaleLimit  = this.tableService.maxScale;
    if ( table.id ){
      group.id = table.id;
    }
    //group.selectable = false;
    group.lockScalingFlip = true;
    group.lockMovementX = true;
    group.lockMovementY = true;
    group.hasControls = false;
    group.hoverCursor = "pointer";
    group.hasBorders = false;

    // group.on('selected',    this.tableSelect.bind(this, group));

    return group;
  }

  setTableSelection( state:boolean ){
    this.fabricCanvas.selection = false;
    this.floors.forEach( item => {
      var tableGroups = this.tablesGroups[ item.id ];
      if ( tableGroups ){
        tableGroups.selectable = state;
      }
    });

    this.fabricCanvas.deactivateAll().renderAll();   
  }

  initTables() {
    this.fabricCanvas.clear();

    if ( this.tablesGroups ){

      this.tablesGroups.forEach( 
        group => { 
          this.drawTableSelectBorder( group );

          group.forEachObject( obj => {

            if ( obj.type !== "percent" && obj.type !== "text" && obj.type !== "group") {
              obj.setColor( group.tableObj.color );
            }  
          });
        
          this.fabricCanvas.add(group); 
        });
    }
    this.addTimesGroup();

    if ( this.timesGroups )
      this.timesGroups.forEach( group => { this.fabricCanvas.add(group); });

    this.drawLinesForSameBooking( this.tables );
  }

  makeLine(coords, color) {
    return new fabric.Line(coords, {
      strokeDashArray: [5, 5],
      stroke: color,
      selectable: false,
      hoverCursor: "default"
    });
  }
  clearView(floor) {
    for (var i = 0; i < floor._objects.length; i++) {
      var obj = floor._objects[i];
      if (obj.type == "group") {

        var index = obj._objects.length - 2;

        if (obj._objects[index].type == "text")
          index = obj._objects.length - 3;
        if (obj._objects[index].strokeWidth != 1) {
          obj._objects[index].stroke = null;
          obj._objects[index].strokeWidth = 1;
          obj._objects[index].height += 4;
          obj._objects[index].width += 4;
          if (obj._objects[index].type == "circle"){
            //obj._objects[index].left += 2.5;
          }
            
          obj.dirty = true;
          floor.renderAll();
        }
      }
      if (obj.type == "line") {
        floor.remove(obj);
        if (i >= 0)
          i--;
      }
    }
  }
  tableSelect(group){

    let obj;
    if ( group.tableObj.style == TableStyle.Rect ){
      obj = group._objects.find( o => o.type == 'rect');
    }else if ( group.tableObj.style == TableStyle.Circle ){
      obj = group._objects.find( o => o.type == 'circle');
    }

    let ind = this.selectTableIds.findIndex( sel => sel == group.tableObj.id );

    if ( !this.isStaffSetting ){
      this.selectTableIds = [];

      if ( group.tableObj.bookings.status == TableStatus.Processing ){

        if ( ind == -1 ){

           this.actions.toggleBookingAction( BookingAction.Select, { ...group.tableObj.bookings, id:group.tableObj.id, name:group.tableObj.table_name }, true );    

        }else{

          this.selectTableIds.push( group.tableObj.id );
          this.actions.toggleBookingAction( BookingAction.Deselect );

        }

      }else{

        if ( ind == -1 ){

          this.actions.toggleBookingAction( BookingAction.SelectTable, { ...group.tableObj.bookings, id:group.tableObj.id, name:group.tableObj.table_name } );  

       }else{

        this.selectTableIds.push( group.tableObj.id );
         this.actions.toggleBookingAction( BookingAction.DeselectTable );

       }        
      }
      console.log( this.selectTableIds );
    }else{
      this.actions.toggleBookingAction( BookingAction.SelectTable, { ...group.tableObj.bookings, id:group.tableObj.id, name:group.tableObj.table_name } );
    }
      
    if ( ind == -1 ) {
      this.selectTableIds.push( group.tableObj.id );
    }else{
      this.selectTableIds.splice( ind, 1 );
    }
    
    this.drawTables( this.tables );

  }
  drawTableSelectBorder( group ){

    let obj;
    let ind = this.selectTableIds.findIndex( sel => sel == group.tableObj.id );
 
    if ( group.tableObj.style == TableStyle.Rect ){
      obj = group._objects.find( o => o.type == 'rect');
    }else if ( group.tableObj.style == TableStyle.Circle ){
      obj = group._objects.find( o => o.type == 'circle');
    }

    if ( ind != -1 ){

        obj.strokeWidth = 4;
        obj.stroke = this.selectColor;

    }else{
      obj.strokeWidth = 1;
      obj.stroke = null;        
    }
      
    //group.dirty = true;
    //this.fabricCanvas.renderAll();
  }
  drawLinesForSameBooking(tables:any){
    this.bookings.forEach( booking => {
      let startPoint:any = null;
      let endPoint:any = null;
      let lineColor = defaultSelectColor;
      let bStatus = BookingStates.find( b => b.id == booking.status );
      lineColor = bStatus ? bStatus.color : lineColor;

      this.tablesGroups.forEach( table =>{
        if ( table.tableObj.bookings.status == TableStatus.Processing ){
          var m = table.getBoundingRect();
          if ( !endPoint ){
            endPoint = { x: m.left + m.width / 2, y: m.top + m.height / 2 };
          }else{
            startPoint = { ...endPoint };
            endPoint = { x: m.left + m.width / 2, y: m.top + m.height / 2 };

            var line = this.makeLine([startPoint.x, startPoint.y, endPoint.x, endPoint.y], lineColor);
            this.fabricCanvas.insertAt(line, 0);
          }
        }
      })
    });
  }
  tableClick(options) {
    if (options.target) {
      if (options.target.type == "group") {
        this.tableSelect( options.target );
      } 
    }
    else {
      // this.selectTableIds = [];

      if (  !this.isStaffSetting  )
        this.actions.toggleBookingAction( BookingAction.DeselectTable );

      this.drawTables( this.tables );  
    }
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


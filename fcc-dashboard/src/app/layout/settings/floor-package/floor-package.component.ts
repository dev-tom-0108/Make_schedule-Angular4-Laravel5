import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, HostListener, ElementRef } from '@angular/core';

import 'fabric';
import { HeaderService, PageState, MainPageState, SubPageState, CanvasSize } from 'app/layout/header.service';
import { ApiService } from 'app/api.service';
import { Subject } from 'rxjs/Subject';
import { FPViewState, ActionState, ActionsService } from '../../actions.service';
import { TableService, TableStyle } from 'app/layout/tableService';

var FontFaceObserver = require('fontfaceobserver');
declare const fabric: any;

@Component({
  selector: 'app-floor-package',
  templateUrl: './floor-package.component.html',
  styleUrls: ['./floor-package.component.scss']
})

export class FloorPackageComponent implements OnInit, OnDestroy {

  loading = false;
  private componetDestroyed = new Subject();
  private page: PageState = { main: MainPageState.None, sub:SubPageState.None };
  private canvasSize = CanvasSize;


  private strTempTableName =  "Table";
  fabricCanvas: any = {};
  floorsTables: any = {};
  selectedTable: any = {};
  floors:Array<any>=[];
  selectFloorId:number = 0;
  tables:Array<any>=[];
  selectFpId:number = -1;
  fpViewState:FPViewState = FPViewState.None;

  /*@HostListener('window:resize') onResize() {
    let width, height;
    if (window.innerWidth < 971 && window.innerWidth > 680){
      width = window.innerWidth - 342;
      height = window.innerHeight - 56 - 102;
    }
    else if(window.innerWidth < 681){
      width = window.innerWidth;
      height = window.innerHeight - 56 - 102;
    }
    else{
      width = window.innerWidth - 342 - 74;
      height = window.innerHeight - 74 - 102;
    }
    this.fabricCanvas.setDimensions({ width: width, height: height });
  }*/

  constructor(
    private actions     : ActionsService,
    private header      : HeaderService,
    private apiService  : ApiService,
    private tableService: TableService,
    private _eref       : ElementRef) {

    this.getFloors();
    this.header.getPage().takeUntil(this.componetDestroyed).subscribe(
      obj => {
        this.page = obj;
      }
    );

    this.actions.getFloorPackageAction().takeUntil(this.componetDestroyed).subscribe (
      action => {
        switch ( action.action ) {
          case ActionState.View:
            this.showView( action.param1 );
            break;
          case ActionState.Create:
            this.showCreate();
            break;
          case ActionState.Edit:
            this.showEdit();
            break;
          case ActionState.Duplicate:
            this.duplicate();
            this.fpViewState = FPViewState.Create;
            this.setTableSelection( true );
            break;
          case ActionState.Created:
          case ActionState.Updated:
            this.saveFloorTables( action.param1 );
            break;
          case ActionState.Deleted:
            this.selectFpId = -1;
            break;
          case ActionState.ItemChange:
            this.changeTableInfoFromMenu( action.param1 );
            break;
        }
      });
  }

  ngOnInit() {
    var myfont = new FontFaceObserver("Heebo");
    this.fabricCanvas = new fabric.Canvas('floorPackageCanvas');
    this.fabricCanvas.setDimensions(this.canvasSize);
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }

  changeFloorPackage( f_pakcage_id:number ){
    this.selectFpId = f_pakcage_id;
    this.getTablesFromPackage( f_pakcage_id );
  }
  changeTableInfoFromMenu( obj ){
    let group = obj;
    let floor = this.floorsTables[this.selectFloorId];
    let index = floor.indexOf( this.selectedTable );

    if ( group.tableObj.style == TableStyle.Circle ){
      group.tableObj.table_layout.circle = this.tableService.tableStyleOptions.circle;
    }else{
      group.tableObj.table_layout.rect = this.tableService.tableStyleOptions.rect;
    }

    floor[index] = this.createTable( this.selectedTable.tableObj );
    this.initTables();

    let objs = this.fabricCanvas.getObjects();
    this.fabricCanvas.setActiveObject(objs[index]);
  }


  getFloors(){
    this.startLoading();
    this.apiService.getFloors().subscribe(
      res => {
        this.floors = JSON.parse(JSON.stringify( res.data ));
        this.selectFloorId = this.floors[0].id;
        this.endLoading();
      }, err =>{
        this.endLoading();
      });
  }

  getTablesFromPackage( f_package_id ){
    this.startLoading();
    this.apiService.getTables( f_package_id ).subscribe(
      res => {
        this.tables = res.data;
        console.log(this.tables);
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

  saveFloorTables(f_package_id:number){

    this.startLoading();
    this.tables = []
    this.floors.forEach ( floor =>{
      this.floorsTables[floor.id].map( table => { table.tableObj.floor_package_id = f_package_id; });
      this.floorsTables[floor.id].forEach ( drawTable => {
          this.tables.push( drawTable.tableObj );
      });
    });
    this.apiService.putTables( f_package_id, this.tables ).subscribe(
      res => {
        this.actions.toggleFloorPackageAction( ActionState.ItemsUpdated, true, res.message );
        this.endLoading();
      },
      err => {
        this.actions.toggleFloorPackageAction( ActionState.ItemsUpdated, false,err.error.data );
        this.endLoading();
      }
    );
  }
//------- Draw Functions Start --------------
  drawTables(tables:Array<any>) {

    this.fabricCanvas.allowTouchScrolling = true;

    //this.onResize();
    this.floors.forEach( floor => {
      this.floorsTables[floor.id] = tables.filter(table => table.floor_id === floor.id )
                                          .map( table => { table.style = table.style.toString();
                                          return this.createTable(table) } );
    });

    this.initTables();
    this.setTableSelection( false );
  }

  createTable( table: any ) {

    //let id = table.id || this.lastId++;

    let group: any = {};
    if (table.style == TableStyle.Circle ) {
      group = this.tableService.createCircleGroup(table);
    }
    if (table.style == TableStyle.Rect ) {
      group = this.tableService.createRectGroup(table);
    }
    let textGroup = this.tableService.createTextGroup(table);
    group.add(textGroup);

    group.name        = table.name || this.strTempTableName;
    group.hasControls = true;
    group.hoverCursor = "pointer";
    group.hasBorders  = true;

    group.type        = table.style;
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

    group.on('selected',    this.tableSelect.bind(this, group));
    group.on('deselected',  this.tableDeselect.bind(this, group));
    group.on('moving',      this.tableMoving.bind(this, group));
    group.on('rotating',    this.tableRotating.bind(this, group));
    group.on('scaling',    this.tableScaling.bind(this, group));
    return group;
  }

  initTables() {
    var tableGroups = this.floorsTables[ this.selectFloorId ];
    this.fabricCanvas.clear();
    if ( tableGroups )
    tableGroups.forEach( group => { this.fabricCanvas.add(group); });
  }
//------- Draw Functions End --------------
//--------Table Event functions Start -----------
  setTableSelection( state:boolean ){
    this.fabricCanvas.selection = false;
    this.floors.forEach( item => {
      var tableGroups = this.floorsTables[ item.id ];
      if ( tableGroups ){
        tableGroups.forEach( group => { group.selectable = state });
      }
    });

    this.fabricCanvas.deactivateAll().renderAll();
  }
  tableRotating(group) {
    group.tableObj.table_layout.angle = group.angle;
    group.tableObj.table_layout.top = group.top;
    group.tableObj.table_layout.left = group.left;
    let timeBlock = group.item( group.size() - 1 );
    timeBlock.set({
      angle: -group.angle,
    });
    this.fabricCanvas.renderAll();
  }
  tableScaling(group){
    group.tableObj.table_layout.scaleX = group.scaleX;
    group.tableObj.table_layout.scaleY = group.scaleY;

    let textGroup = group._objects[ group._objects.length - 1];
    //group.remove(textGroup);
    //let newtextGroup = this.tableService.createTextGroup(group.tableObj);
    //group.addWithUpdate(newtextGroup);


   if (group.scaleX < 1)
      textGroup.scaleX = 1 + ( 1 - group.scaleX );
    else
      textGroup.scaleX = 1 / ( group.scaleX );
    if (group.scaleY < 1)
      textGroup.scaleY = 1 + ( 1 -group.scaleY );
    else
      textGroup.scaleY = 1 / ( group.scaleY );
    this.fabricCanvas.renderAll();
  }
  tableMoving(group) {
    group.tableObj.table_layout.top = group.top;
    group.tableObj.table_layout.left = group.left;
  }
  tableSelect(group) {
    group.forEachObject(function (obj) {
      if (obj.type !== "text" && obj.type !== "group") {
        obj.setColor("#238C9F");
      }
    });
    let timeBlock = group.item( group.size() - 1 );
    timeBlock.set({
      angle: -group.angle,
    });
    this.selectedTable = group;
    this.fabricCanvas.allowTouchScrolling = false;

    this.actions.toggleFloorPackageAction( ActionState.ItemSelect, this.selectedTable );
  }
  tableDeselect(group) {
    this.actions.toggleFloorPackageAction( ActionState.ItemDeselect );
    group.forEachObject(function (obj) {
      if (obj.type !== "text" && obj.type !== "group") {
        obj.setColor("#585F68");
      }
    });
    this.fabricCanvas.allowTouchScrolling = true;
    //this.selectedTable = {};
  }
  floorChange(floor) {
    this.initTables();
  }
  addTable() {
    let tables = [];
    tables = this.floorsTables[this.selectFloorId];
    tables.push(this.createTable({
      table_name        : "Table",
      seats             : 4,
      seat_from         : 1,
      seat_to           : 4,
      style             : TableStyle.Rect.toString(), //0:rectangle, 1:circle
      floor_id          : this.selectFloorId,
      floor_package_id  : this.selectFpId,
      non_reservable    : 0,
    //   color             : '#585F68',
      table_layout      : {
                        time: null,
                        circle: null,
                        rect: {
                          width: 97,
                          height: 97,
                          fill: '#585F68',
                          left: 0,
                          top: 0,
                          rx: 4,
                          ry: 4,
                          angle: 0
                        },
                        name: {
                          fontFamily: 'Heebo',
                          fontSize: 16,
                          fill: "#D8DEE8"
                        },
                        left: 0,
                        top: 0,
                        scaleX: 1,
                        scaleY: 1,
                        angle: 0,
                        }
    }));

    this.initTables();
  }
  removeTable() {
    if (!this.selectedTable) return false;
    let floor = this.floorsTables[this.selectFloorId];
    floor.splice(floor.indexOf(this.selectedTable), 1);
    this.initTables();
  }

  duplicate() {
    this.tables = this.tables.map( table => {
      delete table['id'];
      return table;
    });
    this.drawTables( this.tables );
  }
  showView( f_package_id:number ) {
    this.fpViewState = FPViewState.View;
    this.changeFloorPackage( f_package_id );
    this.setTableSelection( false );
  }
  showEdit(){
    this.fpViewState = FPViewState.Edit;
    this.setTableSelection( true );
  }
  showCreate() {
    this.fpViewState = FPViewState.Create;
    this.setTableSelection( true );
    this.tables = [];
    this.drawTables( this.tables );
  }
//--------Table Event functions Start -----------
  isSettingFloorPackages(){
    return this.header.isSettingFloorPackages( this. page );
  }
  isViewState(){
    return this.fpViewState == FPViewState.View;
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

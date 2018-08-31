import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChildren, QueryList } from '@angular/core';
import { IDatePickerConfig, DatePickerComponent } from 'ng2-date-picker';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { take } from 'rxjs/operator/take';
import { Moment } from 'moment';

import { PageState, HeaderService, SubPageState, MainPageState } from 'app/layout/header.service';
import { ApiService } from 'app/api.service';
import { Lang } from 'app/shared/services';
import { ActionsService, ActionState, BookingAction } from 'app/layout/actions.service';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { forEach } from '@angular/router/src/utils/collection';
import { Router } from "@angular/router";
import { TokenStorage } from 'app/shared/authentication/token-storage.service';

var moment = require('moment');

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None  
})

export class HeaderComponent implements OnInit, OnDestroy {

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

  title: any;
  public page: PageState = { main: MainPageState.None, sub:SubPageState.None };
  private serverPush: Subscription;

  mobileMenuState: boolean = false;
  mobileSortingState: boolean = true;

  private componetDestroyed = new Subject();

  shiftPackages:Array<any>=[];
  floorPackages:Array<any>=[];
  floors:Array<any>=[];
  shifts:Array<any>=[];

  selectSpId:number = -1;
  selectFpId:number = -1;
  selectFId :number = null;
  selectSId :number = null;
  defaultSpId:number = -1;
  defaultFpId:number = -1;
  selectDate = moment( new Date() );
  isHoliday = false;
  currentSpId:number = -1;
  currentFpId:number = -1;

  current_user;

  constructor(
    private apiService: ApiService, 
    private lang      : Lang,
    public header     : HeaderService,
    private tokenStorage  : TokenStorage,
    private router    : Router,
    private actions   : ActionsService) {

  }
  ngOnInit(){
    this.tokenStorage.getUserInfo().takeUntil(this.componetDestroyed).subscribe( 
      user => { 
          this.current_user = user;
    });

    this.header.getPage().takeUntil(this.componetDestroyed).subscribe( 
      page => { 
        this.page = page as PageState;
        this.title = this.header.getHeaderTitle( this.page.main, this.page.sub );

        let permissions = this.current_user.permissions;
        let allowThisPage = false;
        let redirect = '/';
        permissions.forEach( permission =>{
            if( permission.is_write || permission.is_read ){
              if( redirect == '/' && permission.name != "dashboard")
                redirect = '/' + permission.name;
              if( permission.id == page.main + 2 ) // match permission and page id 
                allowThisPage = true;
            }
        })

        // check admin user
        if( this.current_user.role == 0 )
          allowThisPage = true;

        // redirect to another allowed page
        if( allowThisPage == false && page.main<4 && page.main >= 0){
          if( redirect == '/' )
            redirect = '/profile';
          this.router.navigate([redirect]);
        }

        if ( this.header.isSettings( this.page ) ){
          switch (this.page.sub ){
            case SubPageState.Setting_Generals:
              break;
            case SubPageState.Setting_FloorPackages:
              this.initializeFP();
              break;
            case SubPageState.Setting_ShiftPackages:
              this.initializeSP();
              break;
            case SubPageState.Setting_Rules:
              break;
          }
        }else if ( this.header.isBooking( this.page )){
          //this.selectDate = moment( new Date() );
          this.getShifts( this.selectDate );
        }

      });
      this.actions.getBookingAction().takeUntil(this.componetDestroyed).subscribe( 
        action => {
          switch ( action.action ){
            case BookingAction.SelectTable:

              break;
          }
        });

    this.actions.getMobileMenuState().takeUntil(this.componetDestroyed).subscribe(obj => { this.mobileMenuState = obj.state });
    this.actions.getMobileSortingState().takeUntil(this.componetDestroyed).subscribe(obj => { this.mobileSortingState = obj.state });    


    this.actions.getFloorPackageAction().takeUntil(this.componetDestroyed).subscribe(
      action => {
        switch ( action.action ){
          case ActionState.Deleted:
            this.initializeFP();
            break;
          case ActionState.Created:
            this.selectFpId = action.param1;
            this.getFloorPackages();
            break;
          case ActionState.Updated:         
            this.getFloorPackages();
            break;
          case ActionState.SetDefault:
            this.setDefaultFloorPackage( action.param1 );
            break;
        }
      }
    );
    this.actions.getShiftPackageAction().takeUntil(this.componetDestroyed).subscribe(
      action => {
        switch ( action.action ){
          case ActionState.Deleted:
            this.initializeSP();
            break;
          case ActionState.Created:
            this.selectSpId = action.param1;
            this.getShiftPackages();
            break;
          case ActionState.Updated:
            this.getShiftPackages();
            break;
          case ActionState.SetDefault:
            this.setDefaultShiftPackage( action.param1 );
            break;
        }
      }
    );

    //this.selectedLang = this.lang.getLang() === LANG_CN_NAME ? 0 : 1;

    // server push
    this.actions.connectSocket();
    this.serverPush = this.actions.receiveMessages().subscribe(response => {
      console.log( response );

      let action_type = response.data.type;
      if( action_type == "BookingChanged" || action_type == "BookingCreated" ){
        if( this.isBookingTimeLine() || this.isBookingFloorView() )
          this.getShifts( this.selectDate, true );
      }
    });
    
  }
  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();
  }

  //---- Get data from API Start----------
  public getShiftPackages(){
    this.startLoading();
    this.apiService.getShiftPackages().subscribe( 
      res => { 
        this.shiftPackages = res.data;
        this.apiService.getSettingsGeneral().subscribe(
          res => { 
            this.setDefaultShiftPackage( parseInt( res.data.DefaultShiftPackage ) );
            if ( this.selectSpId == -1 ){
              this.setSelectShiftPackage( this.defaultSpId );             
            }
            this.endLoading();
          },
          err => {
            this.endLoading();
          });       
      },
      err =>{
        this.endLoading();
      }
    );
  }
  public getFloorPackages(){
    this.startLoading();
    this.apiService.getFloorPackages().subscribe( 
      res => { 
        this.floorPackages = res.data;     
        this.apiService.getSettingsGeneral().subscribe(
          res => { 
            this.setDefaultFloorPackage( parseInt( res.data.DefaultFloorPackage ) );
            if ( this.selectFpId == -1 ){
              this.setSelectFloorPackage( this.defaultFpId );
            }
            this.endLoading();
          },
          err => {
            this.endLoading();
          });        
      },
      err =>{
        this.endLoading();
      }
    );    
  }
  public getFloors( isDateChanged = false ){
    this.startLoading();
    this.apiService.getFloors().subscribe( 
      res => { 

        this.floors = res.data;
        if( !isDateChanged ){
          if ( this.isBookingFloorView() )
            this.selectFId = this.floors[0].id;
          else
            this.selectFId = null;
        }

        this.changeFloor();
        this.endLoading();  
      },
      err =>{
        console.log( "Error: getFloors API has an issue." );
        this.endLoading();
      }
    );
  }
  public getShifts( date, isDateChanged = false ){
    this.startLoading();
    this.apiService.getShiftsFromDate( date.format('YYYY-MM-DD') ).subscribe( 
      res => { 

        if (res.data.length) {
            this.shifts = res.data;
            if( !isDateChanged ){
              if ( this.isBookingFloorView() )
                this.selectSId = this.shifts[0].id;
              else if( !isDateChanged )
                this.selectSId = null;
            }

            this.getFloors( isDateChanged );
        } else {
            // holiday
            console.log('holiday');
            this.isHoliday = true;
            this.actions.showNotification(date.format('YYYY-MM-DD') + ' is holiday');
            this.actions.toggleBookingAction( BookingAction.Search, { date    : this.selectDate.format('YYYY-MM-DD') }, true);
        }
      },
      err =>{
        console.log( "Error: getShifts API has an issue." );
        this.shifts =[];
        this.selectSId = null;
        this.endLoading();  
      }
    );      
  }
  
  //---- Get data from API End------------
  initializeSP(){
    this.selectSpId = -1;
    this.getShiftPackages();      
  }
  initializeFP(){
    this.selectFpId = -1;
    this.getFloorPackages();     
  }
  initializeFloor(){
    this.selectFId = null;
    this.getFloors();
  }

  public setDefaultShiftPackage( id:number ){
    if ( this.defaultSpId == -1 || this.defaultSpId != id ) this.defaultSpId = id;   
  }

  public setSelectShiftPackage( id:number ){
    if ( this.selectSpId != -1 && this.selectSpId == id ) return;
    this.selectSpId = id;   
    let s_item = this.shiftPackages.find( item => item.id === id );
    let d_item = this.shiftPackages.find( item => item.id === this.defaultSpId );
    this.actions.toggleShiftPackageAction( ActionState.Select, s_item, d_item ); 

  }

  setDefaultFloorPackage( id:number ){
    if ( this.defaultFpId == -1 || this.defaultFpId != id ) this.defaultFpId = id;
  }
  setSelectFloorPackage( id:number ){
    if ( this.selectFpId != -1 && this.selectFpId == id ) return;
    this.selectFpId = id;   
    let s_item = this.floorPackages.find( item => item.id === id );
    let d_item = this.floorPackages.find( item => item.id === this.defaultFpId );
    this.actions.toggleFloorPackageAction( ActionState.Select, s_item, d_item );   
  }
  selectFloor( id:number ){

  }

  changeToBookingTimeline() {
    this.selectFId = null;
    this.selectSId = null;
    this.header.setPage( MainPageState.Booking, SubPageState.Booking_TimeLine );
  }
  changeToBookingFloorView() {
    // if (!this.isHoliday) {
    //     this.selectFId = this.floors[0].id;
    // }
    this.header.setPage( MainPageState.Booking, SubPageState.Booking_FloorView );    
  }
  changeToBookingList() {
    this.selectFId = null;
    this.selectSId = null;
    // if (!this.isHoliday) {
    //     this.selectFId = this.floors[0].id;    
    // }
    this.header.setPage( MainPageState.Booking, SubPageState.Booking_List );    
  }

  toggleMobileMenu() {
    if (this.mobileMenuState)
      this.actions.toggleMobileMenuState(false);
    else
      this.actions.toggleMobileMenuState(true);
  }
  toggleSorting() {
    if (this.mobileSortingState)
      this.actions.toggleMobileSortingState(false);
    else
      this.actions.toggleMobileSortingState(true);
  }

  changeShiftPackage(value:any){
    this.setSelectShiftPackage( value.value );
  }
  changeFloorPackage(value:any){
    this.setSelectFloorPackage ( value.value );
  }
  changeShift(){
    this.changeFloor();
  }
  changeFloor(){

    let shift = this.shifts.find( item => item.id === this.selectSId );

    if( this.selectSId == null )
    {
      // for all shifts
      //this.shifts.forEach( shift => {
        this.actions.toggleBookingAction( BookingAction.Search, { date    : this.selectDate.format('YYYY-MM-DD'), 
              shift   : this.shifts[0],
              floorId : this.selectFId, 
              isAllShift : true} );
      // });
    }
    else
      this.actions.toggleBookingAction( BookingAction.Search, { date    : this.selectDate.format('YYYY-MM-DD'), 
              shift   : shift,
              floorId : this.selectFId, 
              isAllShift : false} );
  }

  changeDate(){
    if ( !this.selectDate ) this.selectDate = moment( new Date() );
    this.getShifts( this.selectDate, true );
  }
  addShiftPackage(){
    this.actions.toggleShiftPackageAction( ActionState.Create );
  }
  addFloorPackage(){
    this.actions.toggleFloorPackageAction( ActionState.Create );
  }
  addRule(){
    this.actions.toggleRulesAction( ActionState.Create );
  } 
  addBooking(){
    this.actions.toggleBookingAction( BookingAction.Create );
  }
  createGuest() {
    this.actions.toggleGuestAction( ActionState.Create );
  }
  exportGuest(){
    this.export();
  }
  createStaff() {
    this.actions.toggleStaffAction( ActionState.Create );
  }
  exportTables(){
    this.actions.toggleBookingAction( BookingAction.Export );
  }
  isSettings(){
    return this.header.isSettings( this.page );
  }
  isBooking(){
    return this.header.isBooking( this.page );
  }
  isBookingTimeLine(){
    return this.header.isBookingTimeLine( this.page );
  }
  isBookingFloorView(){
    return this.header.isBookingFloorView( this.page );
  }
  isBookingList(){
    return this.header.isBookingList( this.page );
  }
  //------- Spinner start -----------------
  private startLoading() {
    this.loading = true;
  }

  private endLoading() {
    this.loading = false;
  }
  //------- Spinner start -----------------  

  private export(){
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true, 
      showTitle: true,
      useBom: true,
      headers: ['ID', 'Name', 'Email', 'Phone', 'Company', 'WeChatAccount', 'Blocked', 'VIP', 'Tags']
    };
    const filename = "guest";
    this.startLoading();
    this.apiService.getGuests().takeUntil(this.componetDestroyed).subscribe(

        res => {
          this.endLoading();        
          let guests = res.data.data;
          let data =[];
          guests.forEach( guest =>{
            let strTag =  guest.tags.map( tag => {return tag.name }).join();  
            data.push({
              Id            : guest.id,
              Name          : guest.name,
              Email         : guest.email,
              Phone         : guest.phone,
              Company       : guest.company_name ? guest.company_name : "",
              WeChatAccount : guest.wechat_account ? guest.wechat_account : "",
              Blocked       : guest.is_block ? 'Yes' : 'No',
              VIP           : guest.is_vip ? 'Yes' : 'No',
              Tags          : strTag
            });
          });
          let genCSV = new Angular2Csv(data, 'Guests', options );
        },
        err => {
          this.endLoading();
        }
      );

  }

  checkAccessPermission( page='', is_write = 0 )
  {
    if( page == '' )
      return false;

    let result = false;
    let permissions = this.current_user.permissions;
    permissions.forEach( permission =>{

      if( permission.name == page && permission.is_read ){
        if( is_write == 0 )
          result = true;
        else
        {
          if( permission.is_write == 1 )
            result = true;
        }
      }
    })

    if( permissions.length == 0 || this.current_user.role == 0 )
      result = true;

    return result;
  }
}

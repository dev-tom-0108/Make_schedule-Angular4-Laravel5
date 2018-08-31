import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

export const DefaultAvatarImg = '/assets/avatars/default.png';
export const CalendarRepeatType:string[] = [ 'everyDay','everyWeek','everyMonth','everyYear' ];
export const CanvasSize = { width:1200, height:900};
const MainPageTitle:string[] = ["BOOKING", "GUESTS", "STAFFS", "SETTINGS", "PROFILE", "NOTIFICATION"];
const SubPageTitle:string[] = [
  "BOOKING_TIMELINE", 
  "BOOKING_FLOORVIEW", 
  "BOOKING_TABLEVIEW", 
  "BOOKING_ADD",
  "SETTINGS_GENERAL",
  "SETTINGS_SHIFT_PACKAGES",
  "SETTINGS_FLOOR_PACKAGES",
  "SETTINGS_RULES"];

export enum MainPageState{
  None          = -1,
  Booking      =  0,
  Guests        =  1,
  Staffs        =  2,
  Settings      =  3,
  Profile       =  4,
  Notifications =  5
}
export enum SubPageState{
  None              = -1,
  Booking_TimeLine  = 0,
  Booking_FloorView,
  Booking_List,
  Booking_Add, 
  Setting_Generals,
  Setting_ShiftPackages,  
  Setting_FloorPackages,
  Setting_Rules
}
export interface PageState{
  main:MainPageState;
  sub: SubPageState;
}

@Injectable()
export class HeaderService {
  private page = new Subject<any>();

  constructor() {
  }


  setPage( main:MainPageState , sub:SubPageState ) {
    this.page.next( { main: main, sub: sub } );
  }

  getPage(): Observable<any> {
    return this.page.asObservable();
  }

  getHeaderTitle( main:MainPageState, sub:SubPageState ){
    let mainT: string = "";
    let subT : string = "";
    mainT = MainPageTitle[ main ];
    if ( sub != SubPageState.None ){
      subT = SubPageTitle[sub];
    }

    return { main:mainT, sub:subT };
  }
  compare( page1: PageState, page2: PageState ){
    return ( page1.main == page2.main && page1.sub == page2.sub );
  }
  isBooking( page : PageState ){
    return page && page.main == MainPageState.Booking;
  }
  isGuests( page : PageState ){
    return page && page.main == MainPageState.Guests;
  }
  isStaffs( page : PageState ){
    return page && page.main == MainPageState.Staffs;
  }
  isSettings( page : PageState ){
    return page && page.main == MainPageState.Settings;
  }
  isProfile( page : PageState ){
    return page && page.main == MainPageState.Profile;
  }
  isNotification( page : PageState ){
    return page && page.main == MainPageState.Notifications;
  }
  isBookingTimeLine( page : PageState ){
    return page && ( page.main == MainPageState.Booking && page.sub == SubPageState.Booking_TimeLine ); 
  }
  isBookingFloorView( page : PageState ){
    return page && ( page.main == MainPageState.Booking && page.sub == SubPageState.Booking_FloorView ); 
  }
  isBookingList( page : PageState ){
    return page && ( page.main == MainPageState.Booking && page.sub == SubPageState.Booking_List ); 
  }
  isBookingAdd( page : PageState ){
    return page && ( page.main == MainPageState.Booking && page.sub == SubPageState.Booking_Add ); 
  }  
  isSettingGenerals( page : PageState ){
    return page && ( page.main == MainPageState.Settings && page.sub == SubPageState.Setting_Generals );
  }
  isSettingFloorPackages( page : PageState ){
    return page && ( page.main == MainPageState.Settings && page.sub == SubPageState.Setting_FloorPackages );
  }  
  isSettingShiftPackages( page : PageState ){
    return page && ( page.main == MainPageState.Settings && page.sub == SubPageState.Setting_ShiftPackages );
  }
  isSettingRules( page : PageState ){
    return page && ( page.main == MainPageState.Settings && page.sub == SubPageState.Setting_Rules );
  }    
}

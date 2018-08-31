import { Injectable, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Lang } from 'app/shared/services';
import { environment } from 'environments/environment';

import * as io from 'socket.io-client';
const SOCKET_URL = `${environment.socketUrl}`;

export enum FPViewState{
  None      = -1,
  View      = 0,
  Edit      = 1,
  Create    = 2,
  ItemEdit  = 3
}

export enum SPViewState{
  None      = -1,
  View      = 0,
  Edit      = 1,
  Create    = 2,
  ItemEdit  = 3  
}
export enum RuleViewState{
  None    = -1,
  List    = 0,
  View    = 1,
  Edit    = 2,
  Create  = 3
}
export enum GuestViewState{
  None   = -1,
  View      = 0,
  Edit      = 1,
  Create    = 2,  
}
export enum StaffViewState{
  None   = -1,
  View      = 0,
  Edit      = 1,
  Create    = 2,  
}
export enum ProfileViewState{
  None     = -1,
  View     =  0,
  Edit     =  1
}

export enum ActionState{
  None         = -1,
  Select       = 0,
  View,
  Create,
  Edit,
  Export,
  Created,
  Updated,
  Deleted,
  Blocked,
  SetDefault,
  Duplicate,
  ItemSelect,
  ItemChange,
  ItemDeselect,
  ItemsUpdate,
  ItemsEditValid,
  ItemsCreateValid,
  ItemsCreted,
  ItemsUpdated,
  ItemsDeleted,
}
export enum BookingAction{
  None        = -1,
  Search,
  Select,
  Deselect,
  Create,
  Edit,
  Block,
  Delete,
  SelectStaff,
  DeSelectStaff,
  SaveTables,
  UpdatedTables,
  DeleteTables,
  DeletedTables,
  ShowMoreDetails,
  HideMoreDetails,
  ShowStatus,
  HideStatus,
  HideEdit,
  Export,
  Searched,
  SearchedStaff,
  Created,
  Updated,
  Deleted,
  SelectTable,
  DeselectTable,  
  ReSet,
  // vlad
  ChangeTabIndex, 
  BookingStaff,
  Blocked,
}
@Injectable()
export class ActionsService {

  private bookingAction       = new Subject<any>();
  private floorPackageAction  = new Subject<any>();
  private shiftPackageAction  = new Subject<any>();
  private rulesAction         = new Subject<any>();
  private guestAction         = new Subject<any>();
  private staffAction         = new Subject<any>();
  private profileAction       = new Subject<any>();

  private mobileMenu          = new Subject<any>();
  private mobileSorting       = new Subject<any>();

  private socket;

  constructor(
    private lang  : Lang,
    private toastr: ToastsManager) {
      
  }
  setToastrVCR(vcr:ViewContainerRef){
    this.toastr.setRootViewContainerRef(vcr);
  }
  showErrorMsg( err ){
    let errMsg:string = '';
    if (typeof err === 'object') {
      Object.keys( err ).forEach( field =>{
        errMsg += err[field] + "\n";
      });
    }else{
      errMsg = err;
    }
    this.lang.get('MESSAGE_ERROR').subscribe(
      title =>{
        this.toastr.error( errMsg, title, {dismiss:'auto'});
      });   
  }

  //------- Notification Start ------------
  showSuccess( msg:string ) {
    this.lang.get('MESSAGE_SUCCESS').subscribe(
      title =>{
        this.toastr.success(msg, title, {dismiss:'auto'});
      });
  }

  showError( msg:string ) {
    this.lang.get('MESSAGE_ERROR').subscribe(
      title =>{
        this.lang.get(msg).subscribe (
          content =>{
            this.toastr.error( content, title, {dismiss:'auto'});
        });
      });    
  }

  showNotification( msg:string ) {
    this.lang.get('MESSAGE_NOTIFICATION').subscribe(
      title =>{
        this.toastr.success(msg, title, {dismiss:'auto'});
      });
  }
  //------- Notification End  ------------    

  toggleBookingAction( action:BookingAction, param1?:any, param2?:any, param3?:any ) {
    this.bookingAction.next( { action: action, param1: param1, param2: param2, param3:param3 } );
  }
  getBookingAction() {
    return this.bookingAction.asObservable();
  }

  toggleFloorPackageAction( action:ActionState, param1?:any, param2?:any  ) {
    this.floorPackageAction.next( { action: action, param1: param1, param2: param2 } );
  }
  getFloorPackageAction() {
    return this.floorPackageAction.asObservable();
  }

  toggleShiftPackageAction( action:ActionState, param1?:any, param2?:any  ) {
    this.shiftPackageAction.next( { action: action, param1: param1, param2: param2 } );
  }
  getShiftPackageAction() {
    return this.shiftPackageAction.asObservable();
  }

  toggleRulesAction( action:ActionState, param1?:any, param2?:any  ) {
    this.rulesAction.next( { action: action, param1: param1, param2: param2 } );
  }
  getRulesAction() {
    return this.rulesAction.asObservable();
  }

  toggleGuestAction ( action:ActionState, param1?:any, param2?:any  ) {
    this.guestAction.next( { action: action, param1: param1, param2: param2 } );
  }
  getGuestAction() {
    return this.guestAction.asObservable();
  }

  toggleStaffAction ( action:ActionState, param1?:any, param2?:any  ) {
    this.staffAction.next( { action: action, param1: param1, param2: param2 } );
  }
  getStaffAction() {
    return this.staffAction.asObservable();
  }

  toggleProfileAction ( action:ActionState, param1?:any, param2?:any  ) {
    this.profileAction.next( { action: action, param1: param1, param2: param2 } );
  }
  getProfileAction() {
    return this.profileAction.asObservable();
  }

  toggleMobileMenuState(state) {
    this.mobileMenu.next({ state: state });
  }
  getMobileMenuState() {
    return this.mobileMenu.asObservable();
  }
  toggleMobileSortingState(state) {
    this.mobileSorting.next({ state: state });
  }
  getMobileSortingState() {
    return this.mobileSorting.asObservable();
  }

  connectSocket() {
    this.socket = io(SOCKET_URL);
  }

    /*
  * Method to receive add-message-response event.
  */
  receiveMessages(): any {
    const observable = new Observable(observer => {
      this.socket.on('notification-channel', (result) => {
        observer.next(result);
      });

      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }
}

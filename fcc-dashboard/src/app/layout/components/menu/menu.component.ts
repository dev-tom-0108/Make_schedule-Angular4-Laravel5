import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { MainPageState, SubPageState, HeaderService } from 'app/layout/header.service';
import { ActionsService } from 'app/layout/actions.service';
import { AuthenticationService } from 'app/shared/authentication/authentication.service';
import { TokenStorage } from 'app/shared/authentication/token-storage.service';
import { Location } from '@angular/common';
import { Router } from "@angular/router";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  mobileMenuState: boolean = false;
  mobileMenuSubscription: Subscription;
  isReceived = false;
  private receiveMessagesSubscription: Subscription;
  private componetDestroyed = new Subject();
  current_user;

  constructor(
    private actions: ActionsService, 
    private header : HeaderService,
    private authService: AuthenticationService,
    private tokenStorage  : TokenStorage,
    private router: Router,
    private location: Location ) {
    this.mobileMenuSubscription = this.actions.getMobileMenuState().subscribe(obj => { this.mobileMenuState = obj.state });
  }

  ngOnInit() {
    this.actions.connectSocket();

    this.tokenStorage.getUserInfo().takeUntil(this.componetDestroyed).subscribe( 
        user => { 
            this.current_user = user;
      });
    this.receiveMessagesSubscription = this.actions.receiveMessages().subscribe(response => {
        console.log(response);

        let action_type = response.data.type;
        if( this.current_user.id != response.data.created_by ){
          if( action_type == "StaffCreated" || action_type == "StaffChanged" || action_type == "StaffDeleted" )
              this.isReceived = this.checkPermission('staffs');
          if( action_type == "BookingCreated" || action_type == "BookingChanged" || action_type == "BookingDeleted" )
              this.isReceived = this.checkPermission('bookings');
          if( action_type == "GuestCreated" || action_type == "GuestChanged" || action_type == "GuestDeleted" )
              this.isReceived = this.checkPermission('guests');

          if( action_type == "StaffChanged" && this.current_user.id == response.data.key_info1 ){
            this.logout();
            this.router.navigate(['/login']);
          }
        }
      });
  }
  checkPermission( page='' )
  {
    if( page == '' )
      return false;

    let result = false;
    let permissions = this.current_user.permissions;
    permissions.forEach( permission =>{
        if( permission.name == page && (permission.is_write || permission.is_read ))
          result = true;
    })
    if( permissions.length == 0 || this.current_user.role == 0 )
      result = true;

    return result;
  }

  closeMenu() {
    this.actions.toggleMobileMenuState(false);
  }
  onResize(event) {
    if (event.target.innerWidth > 971) {
      this.actions.toggleMobileMenuState(true);
      this.actions.toggleMobileSortingState(true);
    } else {
      this.actions.toggleMobileMenuState(false);
      this.actions.toggleMobileSortingState(false);
    }
  }

  clickBooking(){
    //this.header.setPage( MainPageState.Booking,         SubPageState.Booking_TimeLine );
  }
  clickGuests(){
    //this.header.setPage( MainPageState.Guests,          SubPageState.None );
  }
  clickStaffs(){
    //this.header.setPage( MainPageState.Staffs,          SubPageState.None );
  }
  clickSettings(){
    //this.header.setPage( MainPageState.Settings,        SubPageState.Setting_Generals );
  }
  clickProfile(){
    //this.header.setPage( MainPageState.Profile,         SubPageState.None );
  }
  clickNotifications(){
    //this.header.setPage( MainPageState.Notifications,   SubPageState.None );
    this.isReceived = false;
  }
  logout(){
    this.header.setPage( MainPageState.None,            SubPageState.None );    
    this.authService.logout();
  }
}

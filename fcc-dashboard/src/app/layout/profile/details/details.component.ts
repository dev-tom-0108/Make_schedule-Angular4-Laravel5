import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/Observable/of';

import { ProfileViewState, ActionState, ActionsService } from '../../actions.service';

import { Staff, StaffRoles, Language } from 'app/layout/staffs/staff';
import { StaffService } from 'app/layout/staffs/staff.service';
import { TokenStorage } from 'app/shared/authentication/token-storage.service';
import { DefaultAvatarImg } from 'app/layout/header.service';

@Component({
  selector: 'app-profile-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {

  loading = false;
  private componetDestroyed = new Subject();  
  profile: Staff;
  private defaultAvatar = DefaultAvatarImg;

  constructor(
    private actions       : ActionsService,
    private staffService  : StaffService,
    private tokenStorage  : TokenStorage ) {

      this.actions.getProfileAction().takeUntil(this.componetDestroyed).subscribe ( 
        action => { 
          switch ( action.action ) {
            case ActionState.View:
            this.getProfile();
            break;              
            case ActionState.Updated:
              this.profile = action.param1 as Staff;
              break;
          }
        });      
  }

  ngOnInit() {
    this.getProfile();       
  }

  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();     
  }
  getProfile(){
    this.startLoading();
    this.tokenStorage.getUserInfo().subscribe( 
      user => {
        this.staffService.getStaff(user.id).subscribe(
          res=>{
            this.profile = res.data as Staff;
            this.endLoading();
          },
          err=>{
            this.endLoading();
          }
        )
        this.profile = JSON.parse( JSON.stringify ( user ) ) as Staff;
      });
  }

  getRole(){
    return StaffRoles[this.profile.role];
  }
  getLang(){
    return Language.find( l => l.id == this.profile.language ) ? Language.find( l => l.id == this.profile.language ).name : '';
  }

  showEdit() {
    this.actions.toggleProfileAction( ActionState.Edit, this.profile );
  }
  showView(){
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

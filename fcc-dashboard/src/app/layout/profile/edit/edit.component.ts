import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, NgForm } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { Staff, StaffRoles, Language } from 'app/layout/staffs/staff';
import { ProfileViewState, ActionState, ActionsService } from 'app/layout/actions.service';
import { TokenStorage } from 'app/shared/authentication/token-storage.service';
import { StaffService } from 'app/layout/staffs/staff.service';
import { CustomValidators } from 'app/shared/validators/custom-validators';
import { Lang } from 'app/shared/services';
import { DefaultAvatarImg } from 'app/layout/header.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class ProfileEditComponent implements OnInit, OnDestroy {

  private loading: boolean = false;
  private componetDestroyed = new Subject();  

  private viewState:ProfileViewState = ProfileViewState.None;
  private profile:Staff;

  private language:Array<any> = Language;
  private defaultAvatar = DefaultAvatarImg;

  private isSetPassword: boolean = false;
  private password: string = '*********';
  private confirm:  string = '*********';
  private profileForm: FormGroup;
  private error = {};
  
  constructor(
    private actions       : ActionsService,
    private staffService  : StaffService,
    private lang          : Lang,
    private tokenStorage  : TokenStorage) {

      this.actions.getProfileAction().takeUntil(this.componetDestroyed).subscribe ( 
        action => { 
          switch ( action.action ){
            case ActionState.Edit:
              this.showEdit( action.param1 as Staff );
              break;
          }
        }); 
  }

  ngOnInit() {

    this.profileForm = new FormGroup(
      {
        "firstname"             : new FormControl('', [Validators.required]),
        "lastname"              : new FormControl('', [Validators.required]),
        "email"                 : new FormControl('', [Validators.required]),
        "phone"                 : new FormControl('', [Validators.required]),
        "account_name"          : new FormControl('', [Validators.required]),
        "password"              : new FormControl('', []),
        "confirm"               : new FormControl('', []),
        "roles"                 : new FormControl('', []),
        "language"              : new FormControl('', []),
        "email_notification"     : new FormControl('', [])
      }, CustomValidators.MatchPassword
    ); 
  }

  ngOnDestroy() {
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe(); 
  }



  private save() {
    this.startLoading();
    if ( this.isSetPassword ) this.profile.password = this.password;
    return this.staffService.updateStaff( this.profile ).subscribe(
      res => {
        this.endLoading();
        var temp = {...this.profile};
        delete temp['profile_image'];
        this.tokenStorage.setAccessUserInfo( temp );
        this.lang.setLang( this.profile.language );
        this.actions.toggleStaffAction( ActionState.Updated, this.profile );
        this.viewState = ProfileViewState.View;   

        this.actions.showSuccess( res.message );
      },
      err => {
        this.error = err.error.data;      
        this.actions.showErrorMsg( err.error.data );
        this.endLoading();
        this.error = err.error.data;
      }
    );
  }


  setPassword() {
    this.isSetPassword = !this.isSetPassword;
    if (!this.isSetPassword) {
      this.password = this.confirm = '********';
    }else{
      this.password = this.confirm = '';      
    }
  }


  showView() {
    this.viewState = ProfileViewState.View;
    this.actions.toggleProfileAction( ActionState.View );
  }
  showEdit( staff: Staff ){
    this.profile = staff;
    if (this.profile.profile_image == null ) this.profile.profile_image = '';
    this.viewState = ProfileViewState.Edit; 
  }

  isEdit(){
    return this.viewState == ProfileViewState.Edit;
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

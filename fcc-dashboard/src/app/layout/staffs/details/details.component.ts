import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/Observable/of';

import { StaffRoles, Staff } from '../staff';
import { StaffService } from '../staff.service';

import { StaffViewState, ActionState, ActionsService } from '../../actions.service';
import { DefaultAvatarImg } from 'app/layout/header.service';
import { TokenStorage } from 'app/shared/authentication/token-storage.service';

@Component({
  selector: 'app-staffs-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class StaffsDetailsComponent implements OnInit, OnDestroy {

  private componetDestroyed = new Subject();  

  roles: Array<string> = StaffRoles;
  private defaultAvatar = DefaultAvatarImg;
  public staff: Staff;
  private staffViewState = StaffViewState.None;
  public enableEdit = false;

  constructor(
    private actions     : ActionsService, 
    private tokenStorage  : TokenStorage,
    private staffService: StaffService) {

      this.actions.getStaffAction().takeUntil(this.componetDestroyed).subscribe ( 
        action => { 
          switch ( action.action ) {
            case ActionState.Select:
              this.showView( action.param1 as Staff );
              break;
          }
        });      
  }

  ngOnInit() {
    this.checkPermission( 1 ); // check write permission
  }

  ngOnDestroy(){
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();     
  }

  showEdit() {
    this.actions.toggleStaffAction( ActionState.Edit, this.staff );
  }
  showView( staff: Staff ){
    if ( staff ) this.staff = { ...staff };
    else this.staff = null;
  }

  checkPermission( is_write = 0 )
  {
    this.tokenStorage.getUserInfo().takeUntil(this.componetDestroyed).subscribe( 
      user => { 
        let result = false;
        let permissions = user.permissions;
        permissions.forEach( permission =>{

          if( permission.name == 'staffs' && permission.is_read ){
            if( is_write == 0 )
              result = true;
            else
            {
              if( permission.is_write == 1 )
                result = true;
            }
          }
        })

        if( permissions.length == 0 || user.role == 0 )
          result = true;

        this.enableEdit = result;
    });
  }

}

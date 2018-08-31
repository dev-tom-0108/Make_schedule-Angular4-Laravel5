import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, NgForm } from '@angular/forms';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { Staff, PagePermission} from '../staff';
import { StaffService } from '../staff.service';

import { StaffViewState, ActionsService, ActionState } from 'app/layout/actions.service';
import { Lang } from 'app/shared/services';
import { ConfirmationDialogsService } from 'app/shared/services/dialog/confirmation-dialog.service';
import { CustomValidators } from 'app/shared/validators/custom-validators';
import { DefaultAvatarImg } from 'app/layout/header.service';

class PermissionTitle {
  id: number;
  name: string;
}
@Component({
  selector: 'app-staffs-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class StaffsEditComponent implements OnInit, OnDestroy {

  private loading: boolean = false;
  private componetDestroyed = new Subject();  

  private roles: Array<any>;
  private staffViewState = StaffViewState.None;

  private staff: Staff;
  private defaultAvatar = DefaultAvatarImg;

  private isSetPassword: boolean = false;
  private password: string = '*********';
  private confirm:  string = '*********';

  private permissionsTitles: PermissionTitle[];
  private emptyPermissions: PagePermission[] = [];
  private staffForm: FormGroup;
  private error = {};
  
  constructor(
    private actions       : ActionsService, 
    private staffService  : StaffService,
    private lang          : Lang,
    private dialogService : ConfirmationDialogsService ) {

      this.actions.getStaffAction().takeUntil(this.componetDestroyed).subscribe ( 
        action => { 
          switch ( action.action ){
            case ActionState.Select:
              this.showView();
              break;
            case ActionState.Edit:
              this.showEdit( action.param1 as Staff );
              break; 
            case ActionState.Create:
              this.showCreate();
              break;
          }
        }); 

  }

  ngOnInit() {

    this.getPermissionTitles();  
    this.staffForm = new FormGroup(
      {
        "firstname"   : new FormControl('', [Validators.required]),
        "lastname"    : new FormControl('', [Validators.required]),
        "email"       : new FormControl('', [Validators.required]),
        "phone"       : new FormControl('', [Validators.required]),
        "account_name": new FormControl('', [Validators.required]),
        "password"    : new FormControl('', []),
        "confirm"     : new FormControl('', []),        
        "roles"       : new FormControl('', [])
      }, CustomValidators.MatchPassword
    );    
 
    this.roles = [
      {id: "0", name: "Admin" },
      {id: "1", name: "Waiter"},
      {id: "2", name: "Staff" }
    ]

  }

  ngOnDestroy() {
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe(); 
  }


  save() {
    this.convertBooleanToNumber();
    if ( this.isCreate() ) {
      this.create();
    } else {
      this.update();
    }
  }

  private create() {
    this.startLoading();
    this.staff.password = this.password;
    this.staff.language = 'cn';
    this.staff.table_color = 'green';
    this.staffService.createStaff(this.staff).subscribe(
      res => {
        this.endLoading();          
        const staff = res.data;
        this.actions.showSuccess( res.message );
        this.actions.toggleStaffAction( ActionState.Created, res.data );
      },
      err => {
        this.endLoading();         
        this.actions.showErrorMsg( err.error.data );  
      }
    );
  }

  private update() {
    this.startLoading();
    if ( this.isSetPassword ) this.staff.password = this.password;

    // fix bad permission 
    this.staff.permissions.forEach( 
      permission => {
        if( permission.is_read == 0 )
          permission.is_write = 0;
    });

    return this.staffService.updateStaff(this.staff).subscribe(
      res => {
        this.endLoading();           
        this.actions.showSuccess( res.message );        
        this.actions.toggleStaffAction( ActionState.Updated, this.staff );
      },
      err => {
        this.endLoading();             
        this.error = err.error.data;     
        this.actions.showErrorMsg( err.error.data );
      }
    );

  }

  private delete() {
    let confirm = this.dialogService.confirmWithoutContainer(
      'CONFIRM', 
      'CONFIRM_CONTENT_DELETE_STAFF').subscribe( ( ret )=>{
        if (ret) {
            this.startLoading();
            this.staffService.deleteStaff(this.staff.id)
            .subscribe(res => {
                this.endLoading();
                this.actions.toggleStaffAction( ActionState.Deleted );
                this.actions.showSuccess( res.message );
            },
            err => {
                this.endLoading();              
                this.error = err.error.data;
                this.actions.showErrorMsg( err.error.data );

              }
            );
        }
    });
  }

 
  getPermissionTitles() {
    this.staffService.getPermissions().subscribe( 
      res => {
        this.permissionsTitles = res.data;
      })
  }

  makeEmptyPermissions() {
    this.emptyPermissions = [];
    this.permissionsTitles.map( 
      title => {
        let obj = Object.assign({}, title, {is_write: 0, is_read: 0});
        this.emptyPermissions.push(obj);
        if (this.emptyPermissions.length == this.permissionsTitles.length) {
          this.staff.permissions =  this.emptyPermissions.slice();
        }
    });

  } 
  
  setPassword(isPsssword: boolean) {
    this.isSetPassword = isPsssword;
    if (!this.isSetPassword) {
      this.password = this.confirm = '********';
    }else{
      this.password = this.confirm = '';      
    }
  }

  private convertBooleanToNumber() {
    for (let p of this.staff.permissions) {
      p.is_read = p.is_read | 0;
      p.is_write = p.is_write | 0;
    }
    return true;
  }

  showView() {
    this.staffViewState = StaffViewState.View;
    //this.actions.toggleStaffAction( ActionState.View );
  }
  showEdit( staff:Staff ){
    this.staff = { ...staff };
    this.staff.role = this.staff.role.toString();
    if (this.staffForm) this.staffForm.reset();
    if (this.staff.profile_image == null ) this.staff.profile_image = '';
    this.setPassword( false );
    this.staffViewState = StaffViewState.Edit;
  }

  showCreate(){
    this.staff = new Staff();
    this.staff.profile_image = '';
    if (this.staffForm) this.staffForm.reset(); 
    this.makeEmptyPermissions();
    this.setPassword(true);
    this.password = this.confirm = '';
    this.staffViewState = StaffViewState.Create;      
  }
  isShow(){
    return this.staff && ( this.staffViewState == StaffViewState.Edit || this.staffViewState == StaffViewState.Create );
  }
  isCreate(){
    return this.staffViewState == StaffViewState.Create;
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

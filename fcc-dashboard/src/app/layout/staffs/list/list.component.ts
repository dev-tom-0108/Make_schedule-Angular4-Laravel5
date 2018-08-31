import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/Observable/of';

import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { Staff, StaffRoles } from '../staff';
import { StaffService } from '../staff.service';
import { ActionsService, ActionState } from 'app/layout/actions.service';
import { TokenStorage } from 'app/shared/authentication/token-storage.service';
import { DefaultAvatarImg } from 'app/layout/header.service';


@Component({
  selector: 'app-staffs-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class StaffsListComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  private componetDestroyed = new Subject();  

  staffs: Staff[];
  selectedId: number = -1;
  selectedStaff: Staff;
  searchText:string = "";

  roles: Array<string> = StaffRoles;

  private defaultAvatar = DefaultAvatarImg;

  constructor(
    private staffService  : StaffService,
    private actions       : ActionsService,
    private tokenStorage  : TokenStorage) { 

      this.actions.getStaffAction().takeUntil(this.componetDestroyed).subscribe ( 
        action => { 
          switch ( action.action ) {
            case ActionState.Created:
            case ActionState.Updated:            
              this.selectedId = action.param1.id;
              this.search( this.searchText );         
              break;
            case ActionState.Deleted:
              this.selectedId = -1;
              this.search( this.searchText );
              break;  
          }
        });

    }

  ngOnInit() {
      this.search( this.searchText );
  }
  ngOnDestroy() {
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();  
  }

  selectStaff(staffId: number) {
    this.selectedId = staffId;
    this.selectedStaff = this.staffs.find( staff => staff.id == this.selectedId );
    this.actions.toggleStaffAction( ActionState.Select, this.selectedStaff );
  }

  search(term: string): void {
    this.startLoading();
    this.staffService.searchStaffs(term).subscribe(
      res => {
        this.saveStaffs( res.data );
        this.endLoading();
      },
      err => {
        this.selectStaff( -1 );
        this.endLoading();
        this.staffs = [];
      }
    );
  }

  saveStaffs(staffs: Staff[]) {
    this.tokenStorage.getUserInfo().subscribe( 
      user => {
        //---except the user logged in------   
        let current_user = user;

        const index = staffs.findIndex(x => x.id == current_user.id);
        if ( index != -1 ) staffs.splice(index, 1);
       //---- save staffs-----------
        this.staffs = staffs;
       //---- select first user--------
       if ( this.staffs.length > 0 ){
        if ( this.selectedId == -1 ) this.selectedId = this.staffs[0].id;
       }else{
         this.selectedId = -1;
       }
       this.selectStaff( this.selectedId );
    });
  }

  private startLoading() {
    this.loading = true;
  }

  private endLoading(){
    this.loading = false;
  }

}

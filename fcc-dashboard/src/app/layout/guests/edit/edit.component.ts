import { FormGroup, FormControl, FormArray, Validators, NgForm } from '@angular/forms';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { NgSelectComponent, NgOption } from '@ng-select/ng-select';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import * as _ from "lodash";


import { Guest } from './../guest';
import { GuestsService } from './../guests.service';

import { GuestViewState, ActionsService, ActionState } from 'app/layout/actions.service';
import { Lang } from 'app/shared/services';
import { ConfirmationDialogsService } from 'app/shared/services/dialog/confirmation-dialog.service';


const moment = require('moment');

@Component({
  selector: 'app-guests-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GuestsEditComponent implements OnInit, OnDestroy {

  loading: boolean = false;
  private componetDestroyed = new Subject();   

  guest: Guest = new Guest();
  guestViewState: GuestViewState;

  tags: NgOption[];
  selectedTags:Array<any>=[];
  guestForm: FormGroup;
  error = {};

  constructor(
    private actions       : ActionsService,
    private lang          : Lang,
    private guestService  : GuestsService,
    private dialogService : ConfirmationDialogsService  ) {

      this.actions.getGuestAction().takeUntil(this.componetDestroyed).subscribe ( 
        action => { 
          switch ( action.action ){
            case ActionState.Select:
              this.showView();
              break;
            case ActionState.Edit:
              this.showEdit( action.param1 as Guest );
              break; 
            case ActionState.Create:
              this.showCreate();
              break;
          }
        }); 

    this.getTags();

  }

  ngOnInit() {
    this.guestForm = new FormGroup(
      {
        "name"          : new FormControl('', [Validators.required]),
        "email"         : new FormControl('', [Validators.required]),
        "phone"         : new FormControl('', [Validators.required]),
        "company_name"  : new FormControl('', []),
        "is_vip"        : new FormControl('', []),
        //"wechat_account": new FormControl('', [Validators.required]),        
        "tags"          : new FormControl('', [])
      }
    );    
  }

  ngOnDestroy() {
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe(); 
  }

  getTags(){
    this.startLoading();
    this.guestService.getTags().subscribe(
      res => {
        this.endLoading();
        this.tags = res.data as NgOption[];
      }, 
      err => {
        this.endLoading();
        this.tags = [] as NgOption[];
      }
    );
  
  }

  save(form) {
    if (this.isCreate() ) {
      this.create();
    } else {
      this.update();
    }
  }

  private create() {
    this.startLoading();
    return this.guestService.createGuest( this.addIdToForm(this.guestForm.value) ).subscribe(
      res => {
        this.endLoading();           
        const guest = res.data;
        this.actions.toggleGuestAction( ActionState.Created, res.data );
        this.actions.showSuccess( res.message );
     
      },
      err => {
        this.endLoading();       
        this.error = err.error.data;
        this.actions.showErrorMsg( err.error.data );
      });
  }

  private update() {
    this.startLoading();
    return this.guestService.updateGuest(this.addIdToForm(this.guestForm.value)).subscribe(
      res => {
        this.endLoading();
        this.actions.toggleGuestAction( ActionState.Updated , this.guest  );
        this.actions.showSuccess( res.message );
    }, 
    err => {
      this.endLoading();
      this.error = err.error.data;
      this.actions.showErrorMsg( err.error.data );
    });
  }

  block(){
    let confirm = this.dialogService.confirmWithoutContainer(
      'CONFIRM', 
      !this.guest.is_block ? 'CONFIRM_CONTENT_BLOCK_GUEST' : 'CONFIRM_CONTENT_UNBLOCK_GUEST' ).subscribe( 
        ret => {
        if ( ret ){
          this.startLoading();
          //let blockGuest = this.addIdToForm(this.guestForm.value);
          this.guestService.blockGuest( this.guest.id, !this.guest.is_block ).subscribe(
            res =>{
              this.endLoading();
              this.guest.is_block = !this.guest.is_block;
              this.actions.toggleGuestAction( ActionState.Updated , this.guest  );
              this.actions.showSuccess( res.message );
            },
            err =>{
              this.endLoading();
              this.actions.showErrorMsg( err.error.data );
            }
          );
        }
      });
  }
  delete(){
    let confirm = this.dialogService.confirmWithoutContainer(
      'CONFIRM', 
      'CONFIRM_CONTENT_DELETE_GUEST').subscribe( 
        ret=> {
          if ( ret ){
            this.startLoading();
            this.guestService.deleteGuest( this.guest.id ).subscribe(
              res => {
                this.endLoading();
                this.actions.toggleGuestAction( ActionState.Deleted );
                this.actions.showSuccess( res.message );
              },
              err =>{
                this.endLoading();
                this.actions.showError( err.error.data );
              }
            );
          }
      });   
  }

  private addIdToForm(form) {
    return { ...form, id: this.guest.id };
  }
  showView() {
    this.guestViewState = GuestViewState.View;
    //this.actions.toggleGuestAction( ActionState.View );
  }
  showEdit( guest:Guest ){
    this.guest = { ...guest };
    if (this.guestForm) this.guestForm.reset();
    this.selectedTags = this.guest.tags.map(tag => tag.name);
    this.guestViewState = GuestViewState.Edit;
  }

  showCreate(){
    this.guest = new Guest();
    if (this.guestForm) this.guestForm.reset(); 
    this.selectedTags = [];
    this.guestViewState = GuestViewState.Create;      
  }

  isShow(){
    return this.guest && ( this.guestViewState == GuestViewState.Edit || this.guestViewState == GuestViewState.Create );
  }
  isCreate(){
    return this.guestViewState == GuestViewState.Create;
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

import { Component, OnInit , OnDestroy, ViewEncapsulation} from '@angular/core';

import { HeaderService, MainPageState, SubPageState } from '../header.service';
import { Subject } from 'rxjs/Subject';
import { ApiService } from 'app/api.service';
import { TokenStorage } from 'app/shared/authentication/token-storage.service';
import { Moment } from 'moment';

var moment = require('moment');

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  encapsulation: ViewEncapsulation.None  
})

export class NotificationsComponent implements OnInit, OnDestroy {

    private componetDestroyed = new Subject();
    loading = false;

    notifications:Array<any>;

    displayedColumns;
    dataSource;
    pageSize = 10;
    pageNumber = 0;
    offSet = 0;
    totalElements = 0;
    current_user;
    columns = [
      { prop: 'No' },
      { prop: 'Type' },
      { prop: 'Date' },
      { prop: 'Comment' }                      
    ];

    offset: number = 0;
    all_count: number = 0;

  constructor(
    private header: HeaderService,
    private apis: ApiService,
    private tokenStorage  : TokenStorage) { }

  ngOnInit() {
    this.header.setPage( MainPageState.Notifications, SubPageState.None );
    this.notifications = []; 
    this.displayedColumns = [ 'No', 'Type', 'Date', 'Comment'];
    this.tokenStorage.getUserInfo().takeUntil(this.componetDestroyed).subscribe( 
        user => { 
            this.current_user = user;
            this.getNotification();
      });
  }

  getNotification(): void {
    this.startLoading();       
    
    this.apis.getNotification(this.current_user.id, this.offset).takeUntil(this.componetDestroyed).subscribe(
        res => {
            this.endLoading();
            let rows = [];
            if (res.data.data.length) {

                let notification_all = this.notifications.slice(0);
                res.data.data.forEach ( ( item, index ) => {
                    let template = "";
                    let notification = {
                        'b_id': item.id,
                        'Type': item.type,
                        'Date': item.updated_at,
                        'Comment': item.updated_at,
                        'params1' : '',
                        'params2' : '',
                        'template' : ''
                    }

                    notification.params2 = moment( item.updated_at).format('hh:mm A MMM D');
                    switch( item.type ){
                      case "BookingCreated":
                        notification.params1 = "#"+item.key_info1;
                        notification.template = "NOTIFICATION_BOOKING_CREATED";
                        break;
                      case "BookingChanged":
                        notification.params1 = "#"+item.key_info1;
                        notification.template = "NOTIFICATION_BOOKING_CHANGED";
                        break;                      
                      case "BookingDeleted":
                        notification.params1 = "#"+item.key_info1;
                        notification.template = "NOTIFICATION_BOOKING_DELETED";
                        break;
                      case "GuestCreated":
                        notification.params1 = item.key_info2;
                        notification.template = "NOTIFICATION_GUEST_CREATED";
                        break;                      
                      case "GuestChanged":
                        notification.params1 = item.key_info2;
                        notification.template = "NOTIFICATION_GUEST_CHANGED";
                        break;
                      case "GuestDeleted":
                        notification.params1 = item.key_info2;
                        notification.template = "NOTIFICATION_GUEST_DELETED";
                        break;
                      case "StaffCreated":
                        notification.params1 = item.key_info2;
                        notification.template = "NOTIFICATION_STAFF_CREATED";
                        break;
                      case "StaffChanged":
                        notification.params1 = item.key_info2;
                        notification.template = "NOTIFICATION_STAFF_CHANGED";
                        break;
                      case "StaffDeleted":
                        notification.params1 = item.key_info2;
                        notification.template = "NOTIFICATION_STAFF_DELETED";
                        break;
                      default: 
                        notification.params1 = item.type;
                        notification.template = "NOTIFICATION_BOOKING_CREATED";
                    }
                    rows.push( notification );
                });
                notification_all = notification_all.concat(rows);
                this.offset = res.data.next_offset;
                this.all_count = res.data.all_count;

                this.notifications = notification_all;
            }
        },
        err => {
            this.endLoading();       
            console.log('error');             
            this.notifications = [];
        }
    );
  }

  ngOnDestroy() {
    this.componetDestroyed.next();
    this.componetDestroyed.unsubscribe();  
  }

  onScrollDown(){

    console.log("Scrolled");

    if (this.offset == -1 || this.loading)
        return;
    
    this.getNotification();
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

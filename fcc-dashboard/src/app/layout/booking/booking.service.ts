import { Injectable } from "@angular/core";
import { StaffService } from "app/layout/staffs/staff.service";
import { ApiService } from "app/api.service";
import { Subject } from "rxjs/Subject";
import * as moment from 'moment';
import { GuestsService } from "app/layout/guests/guests.service";
import { Guest } from "app/layout/guests/guest";

export const BookingStates:Array<any> = [ 
    { id: 'Blocked',            name: "BOOKING_BLOCKED",                    class: "",                  color:'#FF0000', img:"" },     
    { id: 'Waiting List',       name: "BOOKING_STATUS_WATING_LIST",         class: "",                  color:'#003300', img:"/assets/icons/waiting-list.svg" },     
    { id: 'Booked',             name: "BOOKING_STATUS_BOOKED",              class: "icon-booked",       color:'#000088', img:"/assets/icons/book.svg" }, 
    { id: 'Confirmed',          name: "BOOKING_STATUS_CONFIRMED",           class: "icon-confirmed",    color:'#0000FF', img:"/assets/icons/confirmed.svg" }, 
    { id: 'Partially seated',   name: "BOOKING_STATUS_PARTIALLY_SEATED",    class: "icon-part-seated",  color:'#008800', img:"/assets/icons/part-seated.svg" }, 
    { id: 'Seated',             name: "BOOKING_STATUS_SEATED",              class: "icon-seated",       color:'#00FF00', img:"/assets/icons/seated.svg" }, 
    { id: 'Not arrived yet',    name: "BOOKING_STATUS_NOT_ARRIVED",         class: "icon-no-show",      color:'#880000', img:"/assets/icons/no-show.svg" }, 
    { id: 'Waiting in bar',     name: "BOOKING_STATUS_WAITING_BAR",         class: "icon-waiting",      color:'#FF0000', img:"/assets/icons/waiting.svg" }, 
    { id: 'Got the check',      name: "BOOKING_STATUS_GOT_CHECK",           class: "icon-check",        color:'#008888', img:"/assets/icons/check.svg" }, 
    { id: 'Completed',          name: "BOOKING_STATUS_COMPLETED",           class: "icon-close",        color:'#88FFFF', img:"/assets/icons/close.svg" },
    { id: 'No show',            name: "BOOKING_STATUS_NO_SHOW",             class: "icon-no-show",      color:'#880000', img:"/assets/icons/no-show.svg" }, 
    { id: 'Cancel',             name: "BOOKING_STATUS_CANCEL",              class: "icon-cancel",       color:'#00FFFF', img:"/assets/icons/cancel.svg" }, 
    { id: 'Cancel & Refund',    name: "BOOKING_STATUS_CANCEL_REFUND",       class: "icon-refund",       color:'#888888', img:"/assets/icons/refund.svg" },
];
export interface Booking{
    id:number;
    booking_number:number;
    date:Date;
    time:String;
    hours:number;
    number_of_people:number;
    status:string;
    guest_id:number;
    shift_package_id:number;
    shift_id:number;
    floor_package_id:number;
    assigned_tables:string;
    notes_by_guest:string;
    notes_by_staff:string;
    expense:string;
    referenced_by:string;
    deposit_amount:number;
    deposit_method:string;
    deposit_transaction_id:number;
    refund_error:string;
    refund_at:string;
}
@Injectable()
export class BookingService {

    private currentBooking      = new Subject<any>();
    private upcomingBooking     = new Subject<any>();
    private selectStaff         = new Subject<any>();

    private bookingSettingsSub = new Subject<any>();
    private bookingStatusSub = new Subject<any>();
    // booking status
    public booking = {
        shifts: null,
        rules: null,
        setRules: (rules: any) => {
            this.booking.rules = rules;
        },
        general: null,
        setGeneral: (general: any) => {
            this.booking.general = general;
        },
        status: null,
        setStatus: (data:any) => {

            let status = this.booking.status === null ? [] : this.booking.status;
            for (let item in data) {
                status[item] = data[item];
            }
            this.booking.status = status;    
            console.log(this.booking.status); 
            // this.updateBookingStatus();
        },
        getStatus: () => {
            console.log(this.booking.status);
            return this.booking.status;
        },
        clearStatus: () => {
            this.booking.status = null;
        }
    }


    constructor( 
        private staffService    : StaffService,
        private apiService      : ApiService,
        private guestService    : GuestsService ) { 
        
    }
    
    public updateBookingSettings(data) {
        this.bookingSettingsSub.next(data);
    }
    public getBookingSettings() {
        return this.bookingSettingsSub.asObservable();
    }
    public updateBookingStatus(data) {
        console.log('updatebookingstatus');
        this.bookingStatusSub.next(data);
    }

    public getBookingStatus() {
        return this.bookingStatusSub.asObservable();
    }

    setCurrentBooking( booking:any ) {
        this.currentBooking.next( booking );
    }
    getCurrentBooking() {
        return this.currentBooking.asObservable();
    }

    setUpcomingBooking( booking:any ) {
        this.upcomingBooking.next( booking );
      }
    getUpcomingBooking() {
        return this.upcomingBooking.asObservable();
    }    

    setCurrentStaff( booking:any ) {
        this.selectStaff.next( booking );
      }
    getCurrentStaff() {
        return this.selectStaff.asObservable();
    }

    getStaffs( date:string, shift_id:number, search:string ){
        return this.apiService.getStaffsOfBooking( date, shift_id, search );
    }
    getBookings( date:string, shift_id:number, search:string, offSet?: number, pageSize?: number, shift_package_id?: number ){
        if ( offSet !== undefined && offSet !== null)
            return this.apiService.getBookings( date, shift_id, search,offSet, pageSize );
        else {
            if (shift_package_id !== undefined && shift_package_id !== null) {
                return this.apiService.getBookings( date, shift_id, search, null, null, shift_package_id);                
            } else {
                return this.apiService.getBookings( date, shift_id, search);
            }
        }
    }
    getToalNumberBookings( date:string, shift_id:number, search:string ){
        return this.apiService.toalNumberBookings( date, shift_id, search );
    }
    updateStaffColor( staffId:number, color:string ){
        return this.staffService.updateStaffColor( staffId, color );
    }
    updateStaffTables( staffId:number, tables:Array<any> ){
        return this.staffService.updateStaffTables( staffId, tables );
    }    
    deleteStaffTables( staffId:number){
        return this.staffService.deleteStaffTables( staffId );
    }
    updateBookingState( bookingId:number, status:string ){
        return this.apiService.putBookingState( bookingId, status );
    }
    getBookingsByTableId( date:string, table_id:number){
        return this.apiService.getBookingsByTableId( date, table_id );
    }
    getTables(f_package_id:number ){
        return this.apiService.getTables( f_package_id );
    }
    getFloors(){
        return this.apiService.getFloors();
    }

    getRulesAndGeneral(){
        return this.apiService.getRulesAndGeneral();
    }

    getTimeSlots(date:string) {
        return this.apiService.getTimeSlots(date);
    }

    createGuest(guest:Guest) {
        return this.guestService.createGuest(guest);
    }

    getBlockTables(date:string ){
        return this.apiService.getBlockTables( date );
    }

    updateAssignedTable(id:number, data:any ){
        return this.apiService.updateAssignedTable( id, data );
    }

    // Check Holidays
    public isHoliday(date: any) {

        const formattedDate = date.format('YYYY-MM-DD');

        if (this.booking.rules) {
            for (let i = 0; i < this.booking.rules.length; i++) {
                const rule = this.booking.rules[i];
                if (rule.repeat_end === null || rule.repeat_end > formattedDate) {
                    if ((rule.repeat === 'none' && rule.start === formattedDate) ||
                        (rule.repeat === 'everyDay') ||
                        (rule.repeat === 'everyWeek' && moment(rule.start).day() === date.day()) ||
                        (rule.repeat === 'everyMonth' && moment(rule.start).date() === date.date()) ||
                        (rule.repeat === 'everyYear' && moment(rule.start).month() === date.month()
                        && moment(rule.start).date() === date.date())) {
                            if (rule.shift_package_id === null) {
                                return true;
                            } else {
                                return false;
                            }
                    }
                }
            }
        }

        return false;
    }
}
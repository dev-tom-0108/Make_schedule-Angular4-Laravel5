import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient, HttpResponse,HttpHeaders,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Guest } from './layout/guests/guest';
import { Lang } from 'app/shared/services';
import {  RequestOptions } from '@angular/http';

export const API_URL = environment.apiUrl;
export const GUESTS_URL = `${environment.apiUrl}/guests`;
//let httpOptions:HttpParams;

@Injectable()
export class ApiService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type' : 'application/json'  }),
    params : new HttpParams().set('lang', 'cn')
  };
  
  constructor( 
    private http        : HttpClient,
    private lang        : Lang) {
  }
  public putBookingState( bookingId:number, status:string ){
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put(API_URL + '/bookings/status/' + bookingId, { status: status }, this.httpOptions )
    .catch(this.handleError);    
  }
  public getStaffsOfBooking(date: string, shift_id:number, search: string ): Observable<any>  {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() )
    .append( 'date', date )
    .append( 'shift_id', shift_id.toString() )
    .append( 's', search )
    .append( 'assigned', "1");

    return this.http.get(API_URL + '/staffs', this.httpOptions )
    .catch(this.handleError);
  }
  public putBooking( bookingId:number, booking:any ){
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put(API_URL + '/bookings/' + bookingId, booking, this.httpOptions )
    .catch(this.handleError);    
  }
  public getBookingsByTableId(  date: string, table_id:number ){
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() )
                                              .append( 'date', date )
  
    return this.http.get(API_URL + '/bookings/table/' + table_id, this.httpOptions )
    .catch(this.handleError);
  }
  public getBookings( date: string, shift_id:number, search: string, offSet?: number, pageSize?: number, shift_package_id?: number ): Observable<any>  {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() )
                                              .append( 'date', date )
                                              .append( 'shift_id', shift_id.toString() )
                                              .append( 's', search );
    if ( offSet !== undefined && offSet !== null ){
        this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() )
        .append( 'date', date )
        .append( 'shift_id', shift_id.toString() )
        .append( 's', search )
        .append('offset', offSet.toString() )
        .append('pagesize', pageSize.toString() );    
    }

    if (shift_package_id !== undefined && shift_package_id !== null) {
        this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() )
        .append( 'date', date )
        .append( 's', search )
        .append('shift_package_id', shift_package_id.toString() )
    }
    return this.http.get(API_URL + '/bookings', this.httpOptions )
    .catch(this.handleError);
  }
  public toalNumberBookings( date: string, shift_id:number, search: string ): Observable<any>  {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() )
                                              .append( 'date', date )
                                              .append( 'shift_id', shift_id.toString() )
                                              .append( 's', search );

    return this.http.get(API_URL + '/bookings/total', this.httpOptions )
    .catch(this.handleError);
  }

  public getShiftsFromDate( date: string ): Observable<any>  {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() )
                                              .append( 'date', date );
    return this.http.get(API_URL + '/timeslots', this.httpOptions )
    .catch( this.handleError );
  }
  public getSettingsGeneral( ): Observable<any>  {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    return this.http.get(API_URL + '/settings/general', this.httpOptions )
    .catch(this.handleError);
  }
  public putSettingsGeneral( data ): Observable<any>  {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put(API_URL + '/settings/general', data, this.httpOptions )
    .catch(this.handleError);
  }
  public PutDefaultShiftPackage( s_package_id: number ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put( API_URL + '/settings/general/shiftpackage/'+ s_package_id, null,this.httpOptions )
   .catch(this.handleError); 
  }
  public PutDefaulFloorPackage( f_package_id: number ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put( API_URL + '/settings/general/floorpackage/'+ f_package_id, null,this.httpOptions )
   .catch(this.handleError); 
  }  
  public getShiftPackages():Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    return this.http.get( API_URL + '/settings/shift_packages', this.httpOptions)
   .catch(this.handleError); 
  }
  public putShiftPackage( id:number, data:any ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put( API_URL + '/settings/shift_packages/' + id, data, this.httpOptions )
    .catch(this.handleError);
  }
  public postShiftPackage( data:any ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.post( API_URL + '/settings/shift_packages', data, this.httpOptions )
    .catch(this.handleError);
  }
  public deleteShiftPackage( id:number ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    return this.http.delete( API_URL + '/settings/shift_packages/' + id, this.httpOptions )
    .catch(this.handleError);
  }
  public getAllShifts( ){
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    return this.http.get( API_URL + '/settings/shifts', this.httpOptions)
    .catch(this.handleError);
  }
  public getShifts( id:number ){
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    return this.http.get( API_URL + '/settings/shifts/' + id, this.httpOptions )
    .catch(this.handleError);
  }
  public putShiftsOfPackage( s_package_id:number, data:any ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put( API_URL + '/settings/shifts/package/' + s_package_id, { data : data }, this.httpOptions )
   .catch(this.handleError); 
  }

  public postShift( data:any ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.post( API_URL + '/settings/floor_packages', data, this.httpOptions )
   .catch(this.handleError); 
  }
  public deleteShift( id:number ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    return this.http.delete( API_URL + '/settings/floor_packages/' + id, this.httpOptions )
   .catch(this.handleError); 
  }

  public getRules():Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.get( API_URL + '/settings/rules',this.httpOptions)
   .catch(this.handleError); 
  }
  public putRule( id:number, data:any ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    return this.http.put( API_URL + '/settings/rules/' + id, data, this.httpOptions )
    .catch(this.handleError);
  }
  public postRule( data:any ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.post( API_URL + '/settings/rules', data, this.httpOptions )
    .catch(this.handleError);
  }
  public deleteRule( id:number ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.delete( API_URL + '/settings/rules/' + id, this.httpOptions )
    .catch(this.handleError);
  }

  public getFloors():Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.get(API_URL + '/settings/floors', this.httpOptions)
   .catch(this.handleError); 
  }

  public getFloorPackages():Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.get( API_URL + '/settings/floor_packages', this.httpOptions)
   .catch(this.handleError); 
  }
  public putFloorPackage( id:number, data:any ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put( API_URL + '/settings/floor_packages/' + id, data, this.httpOptions )
    .catch(this.handleError);
  }
  public postFloorPackage( data:any ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.post( API_URL + '/settings/floor_packages', data, this.httpOptions )
    .catch(this.handleError);
  }
  public deleteFloorPackage( id:number ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.delete( API_URL + '/settings/floor_packages/' + id, this.httpOptions )
    .catch(this.handleError);
  }
  public getTables( f_package_id:number ){
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.get( API_URL + '/settings/tables/package/' + f_package_id, this.httpOptions )
    .catch(this.handleError);
  }
  public putTables( f_package_id:number, data:any ){
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put( API_URL + '/settings/tables/package/' + f_package_id, { data : data }, this.httpOptions )
    .catch(this.handleError);
  }
  public putTable( id:number, data:any ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put( API_URL + '/settings/tables/' + id, { data : data }, this.httpOptions )
   .catch(this.handleError); 
  }
  public postTable( data:any ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.post( API_URL + '/settings/tables' , data, this.httpOptions )
   .catch(this.handleError); 
  }
  public deleteTable( id:number ):Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    return this.http.delete( API_URL + '/settings/tables/' + id, this.httpOptions )
   .catch(this.handleError); 
  }

  public getGuests(): Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    return this.http.get(API_URL + '/guests', this.httpOptions)
    .catch(this.handleError);
  }

  public getGuest(guest: Guest): Observable<any> {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    const url = `${API_URL}/guests/${guest.id}`;
    return this.http.get(url,this.httpOptions)
    .catch(this.handleError);
  } 
  public getGuestById(guestId: number): Observable<any> {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    const url = `${API_URL}/guests/${guestId}`;
    return this.http.get(url,this.httpOptions)
    .catch(this.handleError);
  } 
  public getBookingsByGuest(guest: Guest): Observable<any> {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    const url = `${API_URL}/bookings/guest/${guest.id}`;
    return this.http.get(url,this.httpOptions)
    .catch(this.handleError);
  }
  public getBookingsByGuestId(guestId: number): Observable<any> {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    const url = `${API_URL}/bookings/guest/${guestId}`;
    return this.http.get(url,this.httpOptions)
    .catch(this.handleError);
  }

  public getRulesAndGeneral() : Observable<any>{
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    return this.http.get(API_URL + '/settings/allrules', this.httpOptions)
    .catch(this.handleError);
  }

  public getTimeSlots(date) {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    return this.http.get( API_URL + '/timeslots?date='+date, this.httpOptions)
    .catch(this.handleError);
  }

  public createBooking(data: any): Observable<any> {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.post( API_URL + '/bookings' , data, this.httpOptions )
    .catch(this.handleError);
  }

  public blockTable(data: any): Observable<any> {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.post( API_URL + '/settings/tables/block' , data, this.httpOptions )
    .catch(this.handleError);
  }

  public unblockTable(id:number, data:any): Observable<any> {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.post( API_URL + '/settings/tables/unblock/'+ id, data, this.httpOptions )
    .catch(this.handleError);
  }

  public getBlockTables(date) {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );
    return this.http.get( API_URL + '/settings/tables/block?date='+date, this.httpOptions)
    .catch(this.handleError);
  }

  public updateAssignedTable( id:number, data:any ){
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put(API_URL + '/bookings/table/' + id, data, this.httpOptions )
    .catch(this.handleError);    
  }

  public getNotification(id :number, offset: number) {
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() )
                                                .append( 'offset', offset.toString() );
    return this.http.get( API_URL + '/notification/' + id, this.httpOptions)
    .catch(this.handleError);
  }

  public updateNotification( id:number ){
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put(API_URL + '/notification/' + id, this.httpOptions )
    .catch(this.handleError);    
  }

  // guest
  getTags(): Observable<any> {
    const url = `${API_URL}/settings/tags`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );        
    return this.http.get(url, this.httpOptions)
      .catch(this.handleError);
  }
  searchGuests(term: string, offset: number): Observable<any> {
    const url = `${GUESTS_URL}?s=${term}&offset=${offset}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );   
    return this.http.get(url, this.httpOptions)
      .catch(this.handleError);
  }

  updateGuest(guest: Guest) {
    const url = `${GUESTS_URL}/${guest.id}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );        
    return this.http.put(url, guest, this.httpOptions)
      .catch(this.handleError);
  }

  createGuest(guest: Guest) {
    const url = `${GUESTS_URL}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );     
    return this.http.post(url, guest, this.httpOptions)
      .catch(this.handleError);
  }

  deleteGuest(guestId :number ) {
    const url = `${GUESTS_URL}/${guestId}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );     
    return this.http.delete(url, this.httpOptions)
      .catch(this.handleError);   
  }

  blockGuest(guestId :number, block: boolean ){
    const url = `${API_URL}/block_guests/${guestId}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );     
    return this.http.put(url, { is_block: block }, this.httpOptions)
      .catch(this.handleError);     
  }
  private handleError (error: Response | any) {
    console.error('ApiService::handleError', error);
    return Observable.throw(error);
  }
}
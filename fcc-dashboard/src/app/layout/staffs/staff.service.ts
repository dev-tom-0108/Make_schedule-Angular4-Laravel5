import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';

import { Staff, StaffResponse } from './staff';
import { Lang } from 'app/shared/services';

export const API_URL = environment.apiUrl;



@Injectable()
export class StaffService {
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type' : 'application/json'  }),
    params : new HttpParams().set('lang', 'cn')
  };
  private staffsUrl = 'staffs';  // URL to web api

  constructor(
    private lang: Lang,
    private http: HttpClient) { }

  /** GET staffs from the server */
  getStaffs (): Observable<any> {
    const url = `${API_URL}/${this.staffsUrl}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.get(url,this.httpOptions).catch(this.handleError);
  }
  /** GET staff from the server */
  getStaff (id:number): Observable<any> {
    const url = `${API_URL}/${this.staffsUrl}/${id}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.get(url,this.httpOptions).catch(this.handleError);
  }

  /** Search staffs from the server  */
  searchStaffs(term: string): Observable<any> {
    const url = `${API_URL}/${this.staffsUrl}?s=${term}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.get(url, this.httpOptions).catch(this.handleError);

  }

  createStaff(staff: Staff): Observable<any> {
    const url = `${API_URL}/${this.staffsUrl}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.post(url, staff, this.httpOptions).catch(this.handleError);
  }

  updateStaff(staff: Staff): Observable<any> {
    const url = `${API_URL}/${this.staffsUrl}/${staff.id}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put(url, staff, this.httpOptions).catch(this.handleError);
  }
  
  deleteStaff(staffId): Observable<any> {
    const url = `${API_URL}/${this.staffsUrl}/${staffId}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.delete(url, this.httpOptions).catch(this.handleError);
  }

  updateStaffColor(staffId:number, color:string): Observable<any> {
    const url = `${API_URL}/${this.staffsUrl}/color/${staffId}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put(url,{ table_color:color }, this.httpOptions).catch(this.handleError);
  }
  updateStaffTables(staffId:number, tables:Array<any>): Observable<any> {
    const url = `${API_URL}/${this.staffsUrl}/tables/${staffId}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.put(url,{ tables:tables }, this.httpOptions).catch(this.handleError);
  }
  deleteStaffTables(staffId:number): Observable<any> {
    const url = `${API_URL}/${this.staffsUrl}/tables/${staffId}`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.delete(url, this.httpOptions).catch(this.handleError);
  }

  getPermissions(): Observable<any> {
    const url = `${API_URL}/settings/permissions`;
    this.httpOptions.params = new HttpParams().set('lang', this.lang.getLang() );    
    return this.http.get(url, this.httpOptions).catch(this.handleError);

  }

  private handleError(error: Response | any) {
    console.error('GuestService::handleError', error);
    return Observable.throw(error);
  }
  
}

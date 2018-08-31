import { Guest } from './guest';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'environments/environment';
import { ApiService } from './../../api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lang } from 'app/shared/services';

export const GUESTS_URL = `${environment.apiUrl}/guests`;
export const API_URL = `${environment.apiUrl}`;


@Injectable()
export class GuestsService {

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type' : 'application/json'  }),
    params : new HttpParams().set('lang', 'cn')
  };
  constructor(
    private apiService  : ApiService, 
    private lang        : Lang,
    private http        : HttpClient) {
  }
  
  getTags(): Observable<any> {
    return this.apiService.getTags();
  }


  getBookingsByGuest(guest: Guest): Observable<any> {
    return this.apiService.getBookingsByGuest(guest);
  }


  searchGuests(term: string, offset: number): Observable<any> {
    return this.apiService.searchGuests(term, offset);
  }

  updateGuest(guest: Guest) {
    return this.apiService.updateGuest(guest);
  }

  createGuest(guest: Guest) {
    return this.apiService.createGuest(guest);
  }

  deleteGuest(guestId :number ) {
    return this.apiService.deleteGuest(guestId);
  }

  blockGuest(guestId :number, block: boolean ){
    return this.apiService.blockGuest(guestId, block); 
  }
}

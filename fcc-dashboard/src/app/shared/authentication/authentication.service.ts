import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { AuthService } from 'ngx-auth';
import { Location } from '@angular/common';
import { Router } from "@angular/router";

import { environment } from 'environments/environment';
import { TokenStorage } from './token-storage.service';

export interface AccessData {
  accessToken: string;
  refreshToken: string;
  user: any;
  message: string;
  status : string;
}
export const API_URL = environment.apiUrl;
@Injectable()
export class AuthenticationService implements AuthService {

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage,
    private router: Router,
    private location: Location
  ) {}

  /**
   * Check, if user already authorized.
   * @description Should return Observable with true or false values
   * @returns {Observable<boolean>}
   * @memberOf AuthService
   */
  public isAuthorized(): Observable < boolean > {
    return this.tokenStorage
      .getAccessToken()
      .map(token => !!token);
  }

  /**
   * Get access token
   * @description Should return access token in Observable from e.g.
   * localStorage
   * @returns {Observable<string>}
   */
  public getAccessToken(): Observable < string > {
    return this.tokenStorage.getAccessToken();
  }

  /**
   * Function, that should perform refresh token verifyTokenRequest
   * @description Should be successfully completed so interceptor
   * can execute pending requests or retry original one
   * @returns {Observable<any>}
   */
  public refreshToken(): Observable < any > {
    return this.tokenStorage
    .getRefreshToken()
    .switchMap((refreshToken: string) => {
      return this.http.post(API_URL + '/refresh', { refreshToken:refreshToken });
    })
    .map(this.saveAccessData.bind(this))
    .catch((err) => {
      this.logout();
      this.router.navigate(['/login']);
      return Observable.throw(err);
    });
    /*const refreshToken: string = localStorage.getItem('refreshToken');
    
    return this.http.post(API_URL + '/refresh', { refreshToken })
          .do(this.saveAccessData.bind(this))
          .catch( this.handleError ); */
  }

  /**
   * Function, checks response of failed request to determine,
   * whether token be refreshed or not.
   * @description Essentialy checks status
   * @param {Response} response
   * @returns {boolean}
   */
  public refreshShouldHappen(response: HttpErrorResponse): boolean {
    return response.status === 401
  }

  /**
   * Verify that outgoing request is refresh-token,
   * so interceptor won't intercept this request
   * @param {string} url
   * @returns {boolean}
   */
  public verifyTokenRequest(url: string): boolean {
    return url.endsWith('/refresh');
  }

  /**
   * EXTRA AUTH METHODS
   */

  public login( username:string, password:string, lang:String ): Observable<any> {
      return this.http.post(API_URL + '/login', { login:username, password, lang: lang })
      .map((tokens: AccessData) => { this.saveAccessData(tokens); return tokens;} )
      .catch( this.handleError );
  }

  /**
   * Logout
   */
  public logout(): void {
    this.tokenStorage.clear();
    //location.reload(true);
  }
//     /**
//      * Logout
//      */
//   public getHeaders(token: string): { [name: string]: string | string[] } {
//     let headers = { Authorization: token };
//     return headers;
//   }

  /**
   * Save access data in the storage
   *
   * @private
   * @param {AccessData} data
   */
  private saveAccessData({ accessToken, refreshToken, user, message, status }: AccessData) {

    this.tokenStorage
      .setAccessToken(accessToken)
      .setRefreshToken(refreshToken)
      .setAccessUserInfo( user )
  }
  private handleError (error: Response | any ) {
    //console.error('AuthService::handleError', error);
    //this.logout();
    return Observable.throw(error);
  }
}

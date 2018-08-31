import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { error } from 'util';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { Lang } from 'app/shared/services';
import { AuthenticationService } from 'app/shared/authentication/authentication.service';
import { CustomValidators } from 'app/shared/validators/custom-validators';
import { ActionsService } from 'app/layout/actions.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  model:any = {};

  private tokens: Observable<any>;
  loginForm: FormGroup;
  loadingShow = false;

  constructor( 
    private lang          : Lang, 
    private router        : Router,
    private authService   : AuthenticationService,
    private actions       : ActionsService) {

    this.loginForm = new FormGroup(
      { 
        "username"    : new FormControl('', []),
        "password"    : new FormControl('', [])
      }, CustomValidators.isLogin
    );

  }

  ngOnInit() {
    this.loginForm.reset()
  }

  onLoggedin() {
    this.startLoading();
    this.authService.login( this.model.username, this.model.password, this.lang.getLang() ).subscribe(
      res => {
                this.actions.showSuccess( res.message );
                this.lang.setLang( res.user.language );
                this.endLoading();
                this.router.navigate(['/']);                
              },
       err => { 
                this.actions.showErrorMsg( err.error.data );
                this.endLoading();
              } 
    );
  }
    
  //------- Spinner start -----------------
  private startLoading() {
    this.loadingShow = true;
  }

  private endLoading() {
    this.loadingShow = false;
  }
  //------- Spinner start -----------------    
}

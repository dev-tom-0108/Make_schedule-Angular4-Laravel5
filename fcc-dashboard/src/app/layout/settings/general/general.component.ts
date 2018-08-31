import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Observable } from 'rxjs/Observable';

import { ApiService } from 'app/api.service';
import { Lang } from 'app/shared/services';
import { ActionsService } from 'app/layout/actions.service';
import { CustomValidators } from 'app/shared/validators/custom-validators';


@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class GeneralComponent implements OnInit {
  
    myForm: FormGroup;
    isLoading = false;

  generalInfo: any ={};

  constructor(private apiService  : ApiService, 
              private lang        : Lang,
              private actions     : ActionsService ){
  }

  ngOnInit() {
    this.myForm = new FormGroup(
      { "input_app_timer"     : new FormControl('', [Validators.required]),
        "input_min_people"    : new FormControl('', [Validators.required]),
        "input_max_people"    : new FormControl('', [Validators.required]),
        "input_advanced_days" : new FormControl('', [Validators.required])},
        CustomValidators.isCorrectRangePeople
    );
      this.startLoading();
      this.apiService.getSettingsGeneral().subscribe( 
        res => { 
          this.generalInfo = res.data; 
          this.endLoading();
          delete this.generalInfo["DefaultFloorPackage"];
          delete this.generalInfo["DefaultShiftPackage"];
        } );
    
  }

  get loadGeneralInfo(){   
    return this.apiService.getSettingsGeneral();
  }
  
  public saveGeneral(){
    this.startLoading();
    this.apiService.putSettingsGeneral( this.generalInfo )
                   .subscribe(       
                      res => {
                        this.endLoading();  
                        this.actions.showSuccess( res.message );                
                      },
                      err => { 
                        this.endLoading();
                        this.actions.showErrorMsg( err.error.data );                    
                      }    
                    )

  }
  //------- Spinner start -----------------
  private startLoading() {
    this.isLoading = true;
  }

  private endLoading() {
    this.isLoading = false;
  }
  //------- Spinner start -----------------
      
}

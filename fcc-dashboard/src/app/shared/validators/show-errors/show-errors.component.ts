import { Component, Input } from '@angular/core';
import { AbstractControlDirective, AbstractControl } from '@angular/forms';

@Component({
  selector: 'show-errors',
  templateUrl: './show-errors.component.html',
  styleUrls: ['./show-errors.component.scss']
})
export class ShowErrorsComponent {

  private static readonly errorMessages = {
    'required'              : () => 'VALIDATE_REQUIRED',

    'min'                   : (params) => 'VALIDATE_MIN',
    'max'                   : (params) => 'VALIDATE_MAX',
    'minlength'             : (params) => 'VALIDATE_MIN_LENGTH',
    'maxlength'             : (params) => 'VALIDATE_MAX_LENGTH',

    'pattern'               : (params) => "VALIDATE_INVALID", 
    'number'                : (params) => 'VALIDATE_NOT_NUMBER',
    'incorrectRangePeople'  : (params) => 'VALIDATE_INCORRECT_RANGE_PEOPLE',
    'incorrectRangeSetable' : (params) => 'VALIDATE_INCORRECT_RANGE_TABLE',   
    'shift_timeslot'        : (parmas) => 'VALIDATE_ISEXIST_TIMESLOT',    
    'shift_select'          : (parmas) => 'VALIDATE_MIN',
    'noMatchPassword'       : (params) => 'VALIDATE_NOMATCH_PASSWORD',
    'noUserName'            : (params) => 'VALIDATE_NO_USERNAME',
    'noPassword'            : (params) => 'VALIDATE_NO_PASSWORD'
  };

  @Input()
  private control: AbstractControlDirective | AbstractControl;

  shouldShowErrors(): boolean {
    return this.control &&
      this.control.errors &&
      (this.control.dirty || this.control.touched);
  }

  listOfErrors(): any[] {
    let errors:Array<any> = [];
    errors = Object.keys(this.control.errors).map( 
      field => {
        let error = {};
        error['msg'] = this.getMessage(field, this.control.errors[field]);
        error['param'] = this.control.errors[field].requiredLength ? this.control.errors[field].requiredLength : null; 
// console.log( error );
        return error;
      });
// console.log( errors );    
    return errors;
  }

  private getMessage(type: string, params: any) {
    return ShowErrorsComponent.errorMessages[type](params);
  }

}

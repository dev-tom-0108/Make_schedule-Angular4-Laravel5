import { FormArray, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { AbstractControl } from '@angular/forms/src/model';
import { Observable } from 'rxjs/Observable';
import { ValidatorFn } from '@angular/forms';


export class CustomValidators {

  static isNumeric(c: FormControl): ValidationErrors {
    const numValue = Number(c.value);
    const isValid = !isNaN(numValue);
    const message = {
      'number': {
        'message': ''
      }
    };
    return isValid ? null : message;
  }
  static isExistTimeSlot( c: FormControl) :ValidationErrors {
    const numValue = Number(c.value);
    const isValid = !isNaN(numValue);
    if ( isValid && numValue < 1 ){
      const message = {
        'shift_timeslot': {
          'message': ''
        }
      }
      return message;
    }

    return null;
  }
  static isLogin( form :FormGroup ):ValidationErrors {
    const message = {};
    const usernameControl = form.get('username');
    const passwordControl  = form.get('password');

    if ( passwordControl && usernameControl ){
      if ( !usernameControl.value || usernameControl.value.length < 1 ){
        message['noUserName'] = '';
        return message;
      }else if ( !passwordControl.value || passwordControl.value.length < 1){
        message['noPassword'] = '';
        return message;
      }
    }
    return null;        
  }
  static MatchPassword( form: FormGroup ):ValidationErrors{
    const passwordControl = form.get('password');
    const confirmControl  = form.get('confirm');
    const message ={};  
    if ( passwordControl && confirmControl ){
      const password = passwordControl.value;
      const confirm = confirmControl.value;

      if (!password ){
        message['noPassword'] = '';
        return message;        
      }
      if ( password != confirm ){

        message['noMatchPassword'] ='';        
        return message;
      }
    }
    return null;
  }
  static isSaveShiftPackage( form: FormGroup ): ValidationErrors{
    const TimeSlotControl = form.get('input_timeslots_length');
    const selectControl = form.get('select_floor_package');
    const message ={};
    if ( TimeSlotControl!= null ){
      const minTimeLength = TimeSlotControl.value;
      if ( minTimeLength < 1 ){
        message['shift_timeslot'] = '';
        return message;
      }
    }
    if ( selectControl != null ){
      const selectValue = selectControl.value;
      if ( !selectValue ){
        message['shift_select'] = '';
        return message;        
      }
    }
    return null;
  }
  static isSeatableRange( form : FormGroup ): ValidationErrors{
    const errType = 'incorrectRangePeople';
    const minControl = form.get('input_table_seat_from');
    const maxControl = form.get('input_table_seat_to');
    return CustomValidators.isCorrectRange( form, minControl, maxControl, 'incorrectRangeSetable' )
  }
  static isCorrectRangePeople( form: FormGroup ): ValidationErrors{
    const errType = 'incorrectRangePeople';
    const minControl = form.get('input_min_people');
    const maxControl = form.get('input_max_people');
    return CustomValidators.isCorrectRange( form, minControl, maxControl, 'incorrectRangePeople' )
  }
  static isCorrectRange( form :FormGroup, c1 :AbstractControl, c2 :AbstractControl, errType :string ): ValidationErrors{
    if (!c1 && !c2 ) {    
      const minValue = c1.value;
      const maxValue = c2.value;
      let error = null;
      if ( minValue > maxValue ) {
        const message = {};
        message[errType] ='';
        return message;
      }
    }
    return null;
  }

  static birthYear(c: FormControl): ValidationErrors {
    const numValue = Number(c.value);
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 85;
    const maxYear = currentYear - 18;
    const isValid = !isNaN(numValue) && numValue >= minYear && numValue <= maxYear;
    const message = {
      'years': {
        'message': 'The year must be a valid number between ' + minYear + ' and ' + maxYear
      }
    };
    return isValid ? null : message;
  }
  public validate(c: FormControl): {[key: string]: any} {
    let emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    let valid = emailRegEx.test(c.value);
    
    return c.value < 1 || valid ? null : {'isEmail': true};
  }
  static countryCity(form: FormGroup): ValidationErrors {
    const countryControl = form.get('country');
    const cityControl = form.get('city');

    if (countryControl != null && cityControl != null) {
      const country = countryControl.value;
      const city = cityControl.value;
      let error = null;

      if (country === 'France' && city !== 'Paris') {
        error = 'If the country is France, the city must be Paris';
      }

      const message = {
        'countryCity': {
          'message': error
        }
      };

      return error ? message : null;
    }
  }

  static uniqueName(c: FormControl): Promise<ValidationErrors> {
    const message = {
      'uniqueName': {
        'message': 'The name is not unique'
      }
    };

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(c.value === 'Existing' ? message : null);
      }, 1000);
    });
  }

  static telephoneNumber(c: FormControl): ValidationErrors {
    const isValidPhoneNumber = /^\d{3,3}-\d{3,3}-\d{3,3}$/.test(c.value);
    const message = {
      'telephoneNumber': {
        'message': 'The phone number must be valid (XXX-XXX-XXX, where X is a digit)'
      }
    };
    return isValidPhoneNumber ? null : message;
  }

  static telephoneNumbers(form: FormGroup): ValidationErrors {

    const message = {
      'telephoneNumbers': {
        'message': 'At least one telephone number must be entered'
      }
    };

    const phoneNumbers = form.controls;
    const hasPhoneNumbers = phoneNumbers && Object.keys(phoneNumbers).length > 0;

    return hasPhoneNumbers ? null : message;
  }
}

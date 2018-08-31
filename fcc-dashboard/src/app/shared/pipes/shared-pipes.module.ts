import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as moment from 'moment';
import { Pipe, PipeTransform } from '@angular/core';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: []
})
export class SharedPipesModule { }

@Pipe({name: 'formatTimerHHMM'})

export class FormatTimerHHMM implements PipeTransform {

    transform(input: string): any {
        return moment(input, "HH:mm").format('hh:mm A');
    }
}
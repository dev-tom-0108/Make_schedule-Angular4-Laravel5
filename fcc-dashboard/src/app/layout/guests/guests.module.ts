import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
    MatSlideToggleModule,
    MatSelectModule,
    MatTable,
    MatTabsModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressSpinnerModule } from '@angular/material';
import { NgSelectModule } from '@ng-select/ng-select';
import { DpDatePickerModule } from 'ng2-date-picker';
import { CalendarModule } from 'angular-calendar';

import { GuestsRoutingModule } from './guests-routing.module';
import { GuestsComponent } from './guests.component';
import { GuestsListComponent } from './list/list.component';
import { GuestsDetailsComponent } from './details/details.component';
import { GuestsEditComponent } from './edit/edit.component';

import { ShowErrorsModule } from '../../shared/validators/show-errors/show-errors.module';
import { ShowServerErrorModule } from '../../shared/validators/show-server-error/show-server-error.module';
import { LoadingModule } from 'ngx-loading';
import { GuestsService } from './guests.service';
import { HttpClientModule } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgSelectModule,
        TranslateModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatTableModule,
        MatTabsModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        DpDatePickerModule,
        CalendarModule,
        ShowErrorsModule,
        ShowServerErrorModule,
        LoadingModule,
        GuestsRoutingModule,
        HttpClientModule,
        InfiniteScrollModule
    ],
    declarations: [
        GuestsComponent,
        GuestsListComponent,
        GuestsDetailsComponent,
        GuestsEditComponent
    ],
    providers: [GuestsService]
})
export class GuestsModule {}

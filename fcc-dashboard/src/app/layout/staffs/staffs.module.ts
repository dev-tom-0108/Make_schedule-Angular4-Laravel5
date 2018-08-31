import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatSlideToggleModule, MatSelectModule, MatTable, MatTableModule } from '@angular/material';
import { NgSelectModule } from '@ng-select/ng-select';
import { DpDatePickerModule } from 'ng2-date-picker';
import { CalendarModule } from 'angular-calendar';

import { StaffsRoutingModule } from './staffs-routing.module';
import { StaffsComponent } from './staffs.component';
import { StaffsListComponent } from './list/list.component';
import { StaffsDetailsComponent } from './details/details.component';
import { StaffsEditComponent } from './edit/edit.component'; 

import { StaffService } from './staff.service'

import { ShowErrorsModule } from '../../shared/validators/show-errors/show-errors.module';
import { LoadingModule } from 'ngx-loading';
import { FileUploaderModule } from 'app/shared/fileupload/file-uploader.module';


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
        DpDatePickerModule,
        CalendarModule,
        ShowErrorsModule,
        LoadingModule,
        FileUploaderModule,
        StaffsRoutingModule
    ],
    declarations: [
        StaffsComponent,
        StaffsListComponent,
        StaffsDetailsComponent,
        StaffsEditComponent,
        //ConfirmationDialogComponent
    ],
    providers: [StaffService],
    //entryComponents: [ConfirmationDialogComponent]
})
export class StaffsModule {}

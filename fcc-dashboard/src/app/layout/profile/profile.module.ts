import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatSlideToggleModule, MatSelectModule, MatTable, MatTableModule } from '@angular/material';
import { NgSelectModule } from '@ng-select/ng-select';
import { DpDatePickerModule } from 'ng2-date-picker';
import { CalendarModule } from 'angular-calendar';

import { LoadingModule } from 'ngx-loading';

import { ShowErrorsModule } from 'app/shared/validators/show-errors/show-errors.module';
import { StaffService } from 'app/layout/staffs/staff.service';
import { FileUploaderModule } from 'app/shared/fileupload/file-uploader.module';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { ProfileDetailsComponent } from './details/details.component';
import { ProfileEditComponent } from './edit/edit.component'; 



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
        ProfileRoutingModule
    ],
    declarations: [
        ProfileComponent,
        ProfileDetailsComponent,
        ProfileEditComponent,
    ],
    providers: [StaffService],
    //entryComponents: [ConfirmationDialogComponent]
})
export class ProfileModule {}

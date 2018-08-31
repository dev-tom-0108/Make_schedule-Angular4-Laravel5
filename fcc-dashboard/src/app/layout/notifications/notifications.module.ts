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

import { NotificationsRoutingModule } from 'app/layout/notifications/notifications-routing.module';
import { NotificationsComponent } from 'app/layout/notifications/notifications.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
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
        DpDatePickerModule,
        CalendarModule,
        ShowErrorsModule,
        LoadingModule,
        NgxDatatableModule,
        NotificationsRoutingModule,
        InfiniteScrollModule
    ],
    declarations: [
        NotificationsComponent
    ],
})
export class NotificationsModule {}

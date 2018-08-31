import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatSlideToggleModule, MatSelectModule, MatTabsModule, MatTableModule, MatPaginatorModule, MatSliderModule, } from '@angular/material';
import { DpDatePickerModule } from 'ng2-date-picker';
import { CalendarModule } from 'angular-calendar';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingModule } from 'ngx-loading';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { BookingRoutingModule } from './booking-routing.module';
import { BookingComponent } from './booking.component';


import { TimelineComponent } from './timeline/timeline.component';
import { BookingSettingsComponent } from './booking-settings/booking-settings.component';
import { BookingDetailsComponent } from './booking-settings/booking-details/booking-details.component';
import { BookingStatusComponent } from './booking-settings/booking-status/booking-status.component';
import { BookingMoreDetailsComponent } from './booking-settings/booking-more-details/booking-more-details.component';
import { TableDetailsComponent } from 'app/layout/booking/booking-settings/table-details/table-details.component';


import { BookingEditComponent } from './booking-settings/booking-edit/booking-edit.component';
import { TableAssignComponent } from './floorview/table-assign/table-assign.component';
import { FloorviewComponent } from './floorview/floorview.component';
import { FloorsComponent } from './floorview/floors/floors.component';
import { BookingListComponent } from './floorview/booking-list/booking-list.component';
import { BookingService } from 'app/layout/booking/booking.service';
import { StaffService } from 'app/layout/staffs/staff.service';

import { SchedulerComponent } from './timeline/scheduler/scheduler.component';
import { TableviewComponent } from 'app/layout/booking/tableview/tableview.component';

import { ShowErrorsModule } from 'app/shared/validators/show-errors/show-errors.module';
import { BlockTableComponent } from 'app/layout/booking/booking-settings/table-details/block-table/block-table.component';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        BookingRoutingModule,
        MatTabsModule,
        MatTableModule,
        MatSlideToggleModule,
        MatPaginatorModule,
        DpDatePickerModule,
        CalendarModule,
        ColorPickerModule,
        LoadingModule,
        NgSelectModule,
        NgxDatatableModule,
        ShowErrorsModule
    ],
    declarations: [
        BookingSettingsComponent,        
        BookingComponent,
        FloorviewComponent,
        BookingListComponent,        
        FloorsComponent,
        TimelineComponent,
        TableviewComponent,
        BookingDetailsComponent,
        BookingStatusComponent,
        BookingMoreDetailsComponent,
        TableDetailsComponent,
        BlockTableComponent,
        TableAssignComponent,
        SchedulerComponent,
        BookingEditComponent
    ],
    providers:[BookingService, StaffService ],    
})
export class BookingModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { DpDatePickerModule } from 'ng2-date-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatTabsModule, MatTableModule, MatDialogModule, MatSlideToggleModule,MatSelectModule } from '@angular/material';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingModule } from 'ngx-loading';

import { CalendarModule } from 'angular-calendar';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './components/header/header.component';
import { MenuComponent } from './components/menu/menu.component';

import { HeaderService } from './header.service';
import { ActionsService } from './actions.service';
import { Lang } from '../shared/services';
import { ConfirmationDialogsService } from '../shared/services/dialog/confirmation-dialog.service';
import { ConfirmationDialogComponent } from '../shared/services/dialog/confirmation-dialog.component';
import { TableService } from 'app/layout/tableService';
import { BookingAddComponent } from 'app/layout/booking/booking-add/booking-add.component';
import { StepDateComponent } from 'app/layout/booking/booking-add/step-date/step-date.component';
import { StepGuestsComponent } from 'app/layout/booking/booking-add/step-guests/step-guests.component';
import { StepTimeComponent } from 'app/layout/booking/booking-add/step-time/step-time.component';
import { StepAccountComponent } from 'app/layout/booking/booking-add/step-account/step-account.component';
import { StepConfirmComponent } from 'app/layout/booking/booking-add/step-confirm/step-confirm.component';
import { BookingService } from 'app/layout/booking/booking.service';
import { StaffService } from 'app/layout/staffs/staff.service';
import { DatePipe } from '@angular/common';
import { GuestsService } from 'app/layout/guests/guests.service';
import { ShowErrorsModule } from 'app/shared/validators/show-errors/show-errors.module';
import { FormatTimerHHMM } from '../shared';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule, 
        LoadingModule,       
        DpDatePickerModule,
        NgSelectModule,
        LayoutRoutingModule,
        TranslateModule,
        MatDialogModule,
        MatTabsModule,
        MatTableModule,
        MatSlideToggleModule,
        MatSelectModule,
        ShowErrorsModule,
        CalendarModule.forRoot(),
        InfiniteScrollModule
    ],
    declarations: [
        LayoutComponent, 
        MenuComponent, 
        HeaderComponent, 
        BookingAddComponent,
        StepDateComponent,
        StepGuestsComponent,
        StepTimeComponent,
        StepAccountComponent,
        StepConfirmComponent,
        ConfirmationDialogComponent,
        FormatTimerHHMM        
    ],
    providers:[HeaderService, ActionsService, TableService, Lang,ConfirmationDialogsService, BookingService, StaffService, DatePipe, GuestsService ],
    entryComponents: [ConfirmationDialogComponent]  
})
export class LayoutModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatSlideToggleModule, MatSelectModule,MatDialogModule } from '@angular/material';
import { NgSelectModule } from '@ng-select/ng-select';
import { DpDatePickerModule } from 'ng2-date-picker';
import { CalendarModule } from 'angular-calendar';
import { ColorPickerModule } from 'ngx-color-picker';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { SettingsListComponent } from './settings-list/settings-list.component';
import { ShiftPackageMenuComponent } from './shift-package-menu/shift-package-menu.component';
import { FloorPackageMenuComponent } from './floor-package-menu/floor-package-menu.component';
import { RulesMenuComponent } from './rules-menu/rules-menu.component';
import { GeneralComponent } from './general/general.component';
import { ShiftPackageComponent } from './shift-package/shift-package.component';
import { RulesComponent } from './rules/rules.component';
import { FloorPackageComponent } from './floor-package/floor-package.component';
import { ShowErrorsModule } from '../../shared/validators/show-errors/show-errors.module';
import { ShowServerErrorModule } from '../../shared/validators/show-server-error/show-server-error.module';
import { LoadingModule } from 'ngx-loading';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgSelectModule,
        TranslateModule,
        SettingsRoutingModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatDialogModule,
        DpDatePickerModule,
        CalendarModule,
        ColorPickerModule,
        ShowErrorsModule,
        ShowServerErrorModule,
        LoadingModule
    ],
    declarations: [
        SettingsComponent,
        SettingsListComponent,
        ShiftPackageMenuComponent,
        FloorPackageMenuComponent,
        RulesMenuComponent,
        GeneralComponent,
        ShiftPackageComponent,
        RulesComponent,
        FloorPackageComponent,
        //ConfirmationDialogComponent        
    ],
    //providers: [ConfirmationDialogsService ],
    //entryComponents: [ConfirmationDialogComponent]    
})
export class SettingsModule {}

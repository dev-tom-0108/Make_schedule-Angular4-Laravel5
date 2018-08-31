import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { ShowErrorsModule } from '../shared/validators/show-errors/show-errors.module';
import { ShowServerErrorModule } from '../shared/validators/show-server-error/show-server-error.module';
import { Lang } from '../shared/services';
import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';

@NgModule({
    imports: [
                CommonModule, 
                LoginRoutingModule, 
                FormsModule, 
                TranslateModule,
                LoadingModule,
                ReactiveFormsModule,
                ShowErrorsModule,
                ShowServerErrorModule
             ],
    declarations: [LoginComponent],
    exports: [ ],
    providers: [ Lang ]
})
export class LoginModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ShowErrorsComponent } from './show-errors.component';


@NgModule({
    imports: [
        CommonModule,
        TranslateModule
    ],
    declarations: [
        ShowErrorsComponent
    ],
    exports: [ShowErrorsComponent]
})
export class ShowErrorsModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ShowServerErrorComponent } from './show-server-error.component';



@NgModule({
    imports: [
        CommonModule,
        TranslateModule
    ],
    declarations: [
        ShowServerErrorComponent
    ],
    exports: [ShowServerErrorComponent]
})
export class ShowServerErrorModule {}

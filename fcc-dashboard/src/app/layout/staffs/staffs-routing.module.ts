import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StaffsComponent } from './staffs.component';

const routes: Routes = [
    {
        path: '', component: StaffsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StaffsRoutingModule {
}

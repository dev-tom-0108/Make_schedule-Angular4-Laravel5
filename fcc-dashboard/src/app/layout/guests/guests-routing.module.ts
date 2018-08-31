import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GuestsComponent } from './guests.component';

const routes: Routes = [
    {
        path: '', component: GuestsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GuestsRoutingModule {
}

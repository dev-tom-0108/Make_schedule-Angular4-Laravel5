import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo:'booking' },
            { path: 'settings',     loadChildren: './settings/settings.module#SettingsModule' },
            { path: 'booking',      loadChildren: './booking/booking.module#BookingModule' },
            { path: 'guests',       loadChildren: './guests/guests.module#GuestsModule' },
            { path: 'staffs',       loadChildren: './staffs/staffs.module#StaffsModule' },
            { path: 'profile',      loadChildren: './profile/profile.module#ProfileModule' },
            { path: 'notifications',loadChildren: './notifications/notifications.module#NotificationsModule' }            
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule {}

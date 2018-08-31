import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicGuard, ProtectedGuard } from 'ngx-auth';

export const routes: Routes = [
  { path: 'login',  canActivate: [ PublicGuard     ],  loadChildren: './login/login.module#LoginModule' },
  { path: "",       canActivate: [ ProtectedGuard  ],  loadChildren: './layout/layout.module#LayoutModule' },  
  { path: '**', redirectTo: 'login' },
  { path: 'error', loadChildren: './login/login.module#LoginModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule ]
})
export class AppRoutingModule {}

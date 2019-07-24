import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { NotLogged } from '../_guards/not-logged.guard';
import { AuthGuard } from '../_guards/auth.guard';
import { StarterCompleted } from '../_guards/starter-completed.guard';


const routes: Routes = [
  { path: 'authentication', loadChildren: '../_views/authentication/authentication.module#AuthenticationModule', canActivate: [NotLogged] },
  { path: 'starter', loadChildren: '../_views/starter/starter.module#StarterModule', canActivate: [AuthGuard] },
  { path: 'home', loadChildren: '../_views/tabs.module#TabsPageModule', canActivate: [AuthGuard, StarterCompleted] },
  { path: '', redirectTo: '/authentication', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

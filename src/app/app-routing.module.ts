import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './_guards/auth.guard';

const routes: Routes = [
  { path: 'authentication', loadChildren: './_views/authentication/authentication.module#AuthenticationModule' },
  { path: 'starter', loadChildren: './_views/starter/starter.module#StarterModule', canActivate: [AuthGuard] },
  { path: 'home', loadChildren: './_views/tabs.module#TabsPageModule' },
  { path: '', redirectTo: 'authentication', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

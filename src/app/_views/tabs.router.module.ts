import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'menu',
        children: [
          {
            path: '',
            loadChildren: './menu/menu.module#MenuPageModule',
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'conversations',
        children: [
          {
            path: '',
            loadChildren: './conversations/conversations.module#ConversationsPageModule',
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'messages/:receiverID',
        children: [
          {
            path: '',
            loadChildren: './messages/messages.module#MessagesPageModule',
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'profiles',
        children: [
          {
            path: '',
            loadChildren: './profiles/profiles.module#ProfilesPageModule',
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: './settings/settings.module#SettingsPageModule',
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'settingsAccount',
        children: [
          {
            path: '',
            loadChildren: './settingsAccount/settingsAccount.module#SettingsAccountPageModule',
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'settingsNotifications',
        children: [
          {
            path: '',
            loadChildren: './settingsNotifications/settingsNotifications.module#SettingsNotificationsPageModule',
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'album',
        children: [
          {
            path: '',
            loadChildren: './album/album.module#AlbumPageModule',
            canActivate: [AuthGuard]
          }
        ]
      },
    ]
  },
  {
    path: '',
    redirectTo: 'tabs/profiles',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }

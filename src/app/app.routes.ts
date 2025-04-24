import { Routes } from '@angular/router';
import { LoginSingupComponent } from './components/login-singup/login-singup.component';
import { HomeComponent } from './components/home/home.component';
import { ChatsComponent } from './components/chats/chats.component';
import { GroupsComponent } from './components/groups/groups.component';
import { FriendsComponent } from './components/friends/friends.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    children: [
      { path: 'chat', component: ChatsComponent },
      { path: 'group', component: GroupsComponent },
      { path: 'friends', component: FriendsComponent },
    ]
  },
  {
    path: 'login-singup',
    component: LoginSingupComponent
  },
  { path: '', redirectTo: 'login-singup', pathMatch: 'full' }
];

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserInfoDialogComponent } from '../../user-info-dialog/user-info-dialog.component';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatMenuModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(private dialog: MatDialog, private router: Router) {}

  // Tab mặc định
  selectedTab: string = 'chat';

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  // Mở dialog thông tin người dùng
  openUserInfoDialog() {
    this.dialog.open(UserInfoDialogComponent, {
      width: '400px',
      height: '600px',
    });
  }


  logout(): void {
    this.router.navigate(['/login-singup']);
  }  
}

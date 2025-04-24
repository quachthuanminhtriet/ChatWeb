import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SearchDialogComponent } from '../../search-dialog/search-dialog.component';
import { FriendSearchDialogComponent } from '../../search-dialog/friend-search-dialog/friend-search-dialog.component';
import { NotificationsSearchDialogComponent } from '../../search-dialog/notifications-search-dialog/notifications-search-dialog.component';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {
  selectedTab: string = '';
  hasNewFriendRequest: boolean = false; // Trạng thái có lời mời kết bạn mới

  constructor(private dialog: MatDialog, private chatService: ChatService) {}

  
  openSearchDialog() {
    this.dialog.open(SearchDialogComponent, {
      width: '700px',
      height: '600px',
    });
  }
  openFriendDialog() {
    this.dialog.open(FriendSearchDialogComponent, {
      width: '500px',
      height: '700px',
    });
  }
  openNotiDialog() {
    this.dialog.open(NotificationsSearchDialogComponent, {
      width: '500px',
      height: '700px',
    });
  }
} 

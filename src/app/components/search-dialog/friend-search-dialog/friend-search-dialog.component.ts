import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-friend-search-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './friend-search-dialog.component.html',
  styleUrls: ['./friend-search-dialog.component.css'],
})
export class FriendSearchDialogComponent {
  searchKeyword: string = '';
  suggestedFriends: any[] = [];

  constructor(
    private chatService: ChatService,
    public dialogRef: MatDialogRef<FriendSearchDialogComponent>
  ) {}

   // Tìm kiếm người dùng
   searchUsers() {
    const keyword = this.searchKeyword.trim();
    if (!keyword) return;
  
    this.chatService.searchUsers(keyword).subscribe({
      next: (res: any) => {
        console.log('Kết quả tìm kiếm:', res);
        this.suggestedFriends = res;
      },
      error: (err) => {
        console.error('Lỗi khi tìm người dùng:', err);
        alert('Không tìm thấy người dùng phù hợp.');
      }
    });
  }
  
  
  // Gửi hoặc huỷ lời mời kết bạn
  toggleFriendRequest(suggestion: any) {
    if (!suggestion.hasSentRequest) {
      this.chatService.sendFriendRequest(suggestion.id).subscribe({
        next: () => {
          suggestion.hasSentRequest = true;
        },
        error: (err) => {
          console.error('Lỗi khi gửi lời mời kết bạn:', err);
          alert('Không thể gửi lời mời kết bạn.');
        }
      });
    } else {
      this.chatService.cancelFriendRequest(suggestion.id).subscribe({
        next: () => {
          alert('Đã hủy lời mời kết bạn.');
          suggestion.hasSentRequest = false;
        },
        error: (err) => {
          console.error('Lỗi khi huỷ lời mời kết bạn:', err);
          alert('Không thể huỷ lời mời kết bạn.');
        }
      });
    }
  }


  closeDialog(): void {
    this.dialogRef.close();
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ChatService } from '../../../services/chat.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-notifications-search-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './notifications-search-dialog.component.html',
  styleUrls: ['./notifications-search-dialog.component.css']
})
export class NotificationsSearchDialogComponent {
  constructor(
    private chatService: ChatService,
    public dialogRef: MatDialogRef<NotificationsSearchDialogComponent>
  ) { }

  friendRequests: any[] = []; // hiển thị danh sách
  friends: any[] = []; // Lưu danh sách bạn bè

  // BehaviorSubject để gửi thông báo thay đổi cho các component khác
  private friendsSource = new BehaviorSubject<any[]>([]);
  friends$ = this.friendsSource.asObservable(); // Observable để các component khác có thể theo dõi

  ngOnInit() {
    this.loadFriendRequests();
  }

  loadFriendRequests() {
    this.chatService.getFriendRequests().subscribe({
      next: (res: any[]) => {
        console.log('Danh sách lời mời đã nhận:', res);
        this.friendRequests = res.sort((a: any, b: any) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        );
      },
      error: (err) => {
        console.error('Lỗi khi lấy lời mời kết bạn:', err);
      }
    });
  }

  // Gọi API để đồng ý lời mời kết bạn
  acceptFriendRequest(requestId: number) {
    this.chatService.respondToFriendRequest(requestId, true).subscribe({
      next: () => {
        alert('Đã chấp nhận lời mời kết bạn.');
  
        this.friendRequests = this.friendRequests.filter(req => req.id !== requestId);
  
        // Phát tín hiệu cập nhật danh sách bạn bè
        this.chatService.notifyFriendListUpdated();
      },
      error: (err) => {
        console.error('Lỗi khi chấp nhận lời mời:', err);
        alert('Không thể chấp nhận lời mời.');
      }
    });
  }  

  // Gọi API để từ chối lời mời kết bạn (nếu cần)
  declineFriendRequest(requestId: number) {
    this.chatService.respondToFriendRequest(requestId, false).subscribe({
      next: () => {
        alert('Đã từ chối lời mời kết bạn.');
        this.friendRequests = this.friendRequests.filter(req => req.id !== requestId);
      },
      error: (err) => {
        console.error('Lỗi khi từ chối lời mời:', err);
        alert('Không thể từ chối lời mời.');
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

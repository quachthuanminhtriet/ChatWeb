import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-friends',
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit, OnDestroy {
  friendList: any[] = [];
  selectedUserId: string | null = null;
  private friendListSubscription: Subscription | undefined;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadFriendList();
    
    this.friendListSubscription = this.chatService.friendListUpdated$.subscribe(() => {
      this.loadFriendList(); 
    });
  }

  ngOnDestroy(): void {

    if (this.friendListSubscription) {
      this.friendListSubscription.unsubscribe();
    }
  }

  loadFriendList(): void {
    this.chatService.getFriends().subscribe({
      next: (friends: any[]) => {

        this.friendList = friends.map(friend => ({
          _id: friend.id,  
          avatar: friend.avatarUrl || 'https://randomuser.me/api/portraits/men/34.jpg',
          name: friend.username || 'Người dùng không tên',
          lastMessage: friend.lastMessage?.text || '...',
          time: this.getRelativeTime(friend.lastMessage?.timestamp || friend.createdAt),
          isUnread: !friend.lastMessage?.isRead
        }));
        console.log(friends);
      },
      error: (err) => {
        console.error('Lỗi khi load danh sách bạn bè:', err);
      }
    });
  }

  selectChat(chat: any) {
    console.log('Chat selected:', chat);  // Kiểm tra dữ liệu chat
    const selectedUser = {
      _id: chat._id,  // Đảm bảo rằng _id là có
      fullName: chat.name,
      avatar: chat.avatar,
      conversationId: chat._id
    };
    console.log('Selected User:', selectedUser);  // Kiểm tra selectedUser
    this.chatService.setSelectedUser(selectedUser);
  }

  getRelativeTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours} giờ trước`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} phút trước`;
    } else {
      return 'Vừa xong';
    }
  }
}

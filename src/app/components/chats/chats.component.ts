import { Component, OnInit} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chats',
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent implements OnInit {

  chatList: any[] = [];
  selectedUserId: string | null = null;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.loadChatList();
  }

  loadChatList() {
    this.chatService.getChattingUsers().subscribe({
      next: (chats: any[]) => {
        console.log('Chats from API:', chats);
        this.chatList = chats.map(chat => {
          console.log('lastMessage.lastMessageAt:', chat.lastMessage?.lastMessageAt);
          return {
            _id: chat.id,
            participants: chat.participants,
            avatar: chat.avatarUrl || 'https://randomuser.me/api/portraits/men/34.jpg',
            name: chat.fullName || 'Người dùng không tên',
            lastMessage: chat.lastMessageContent || '...',
            time: this.getRelativeTime(chat.lastMessageAt) || 'NULL',
            isUnread: !chat.lastMessage?.isRead,
          };
        });
      },
      error: (err) => {
        console.error('Lỗi khi load danh sách chat:', err);
      }
    });
  }

  getRelativeTime(dateString: string | undefined): string {
    if (!dateString) return ''; // Trả về trống nếu không có thời gian
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Kiểm tra giá trị ngày hợp lệ

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} giờ trước`;
    return `${Math.floor(diffMinutes / 1440)} ngày trước`;
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


}

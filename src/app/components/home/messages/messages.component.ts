import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common'; // Định dạng lại time

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
  ],
  providers: [DatePipe],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContent', { static: false }) chatContent: ElementRef | undefined;

  selectedUser: any;  // Người dùng được chọn
  selectedChat: any;  // Dữ liệu chat cho người dùng đã chọn
  newMessage: string = '';  // Tin nhắn mới để gửi
  isTyping: boolean = false;  // Kiểm tra xem người dùng đang nhập tin nhắn hay không
  selectedFile: File | null = null;  // Lưu trữ file người dùng chọn
  sendingMessage: boolean = false;  // Kiểm tra trạng thái gửi tin nhắn

  constructor(private chatService: ChatService, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.chatService.selectedUser$.subscribe(user => {
      if (user) {
        this.selectedUser = user;
        this.selectedChat = user;

        console.log('Người dùng được chọn:', user);

        this.chatService.getMessages(user._id).subscribe(response => {

          if (Array.isArray(response.messages)) {
            this.updateMessages(response.messages);
          } else if (Array.isArray(response)) {
            this.updateMessages(response);
          } else {
            console.warn("Dữ liệu không hợp lệ:", response);
          }
        });
      }
    });

    this.chatService.messages$.subscribe((messages: any[]) => {
      console.log('📨 Nhận được tin nhắn mới:', messages);
      this.updateMessages(messages);
    });
  }


  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.chatContent) {
      this.chatContent.nativeElement.scrollTop = this.chatContent.nativeElement.scrollHeight;
    }
  }

  formatTime(timestamp: string): string {
    return this.datePipe.transform(timestamp, 'HH:mm') || '';  // Chỉ lấy giờ và phút
  }

  loadChat(user: any): void {
    if (user && user._id) {
      this.chatService.getMessages(user._id).subscribe((res: any) => {

        const messages = res.messages || [];

        if (Array.isArray(messages)) {
          this.selectedChat = {
            avatar: user.avatar || 'https://randomuser.me/api/portraits/men/34.jpg',
            fullName: user.fullName || user.name || 'Nguyễn Văn A',
            messages: messages.map((msg: any) => ({
              text: msg.content,
              isSelf: msg.senderId === localStorage.getItem('userId'),
              createdAt: msg.createdAt,
              fileData: msg.fileData,
              file: msg.fileUrl,
              fileType: msg.type,
            }))
          };
        }
      });
    } else {
      console.log('❌ Không có user._id, không thể load chat!');
    }
  }

  sendMessage() {
    console.log('Gửi tin nhắn:', this.newMessage);

    if (this.newMessage.trim() && this.selectedUser && this.selectedUser._id && !this.sendingMessage) {
      this.sendingMessage = true;

      // Lấy currentUserId từ localStorage
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        console.error('User is not logged in');
        return;
      }

      // Xây dựng data cho tin nhắn
      const data: any = {
        receiverId: this.selectedUser._id,
        content: this.newMessage.trim(),
      };

      // Nếu có file, thêm file vào data
      if (this.selectedFile) {
        data.file = this.selectedFile;
      }

      // Tạo một tin nhắn tạm thời
      const tempMessage = {
        text: this.newMessage.trim(),
        isSelf: true,
        createdAt: new Date().toISOString(),
        file: this.selectedFile ? URL.createObjectURL(this.selectedFile) : null, // Dùng URL.createObjectURL cho file tạm
        fileName: this.selectedFile ? this.selectedFile.name : null, // Thêm fileName nếu có file
        fileType: this.selectedFile ? this.selectedFile.type : null, // Loại file nếu có
        tempId: Date.now(), // ID tạm để nhận diện tin nhắn
      };

      // Thêm tin nhắn tạm vào chat
      this.selectedChat.messages.push(tempMessage);
      this.newMessage = ''; // Xóa nội dung tin nhắn

      // Gửi tin nhắn qua API
      this.chatService.sendMessage(data).subscribe({
        next: (response: any) => {
          console.log('Phản hồi từ server:', response);
          this.sendingMessage = false;

          // Cập nhật tin nhắn tạm với thông tin từ server
          if (response && response.message) {
            const index = this.selectedChat.messages.findIndex(
              (msg: any) => msg.tempId === tempMessage.tempId
            );

            if (index !== -1) {
              this.selectedChat.messages[index] = {
                text: response.message.content,
                isSelf: true,
                createdAt: response.message.createdAt || new Date().toISOString(),
                file: response.message.fileUrl,
                fileType: response.message.type,
                id: response.message.id, // Sử dụng id trả về từ server
                fileName: (response.message.fileData && response.message.fileData.fileName) || this.selectedFile?.name || 'unknown',
              };
            }

            // Gửi tin nhắn qua WebSocket cho người nhận
            this.chatService.sendMessageSocket(this.selectedUser._id, {
              senderId: localStorage.getItem('userId'),
              receiverId: this.selectedUser._id,
              content: response.message.content,
              createdAt: response.message.createdAt || new Date().toISOString(),
            });
          }
        },
        error: (err) => {
          console.error('Lỗi khi gửi tin nhắn:', err);
          this.sendingMessage = false;

          // Hiển thị thông báo lỗi tùy theo mã lỗi
          if (err.status === 400) {
            alert('Lỗi gửi tin nhắn: Dữ liệu không hợp lệ.');
          } else if (err.status === 500) {
            alert('Lỗi server: Không thể gửi tin nhắn.');
          } else {
            alert('Đã xảy ra lỗi không xác định.');
          }

          // Nếu gửi tin nhắn không thành công, xóa tin nhắn tạm
          const index = this.selectedChat.messages.findIndex(
            (msg: any) => msg.tempId === tempMessage.tempId
          );
          if (index !== -1) {
            this.selectedChat.messages.splice(index, 1);
          }
        }
      });
    } else {
      console.error('Chưa chọn người nhận hoặc tin nhắn trống');
      alert('Vui lòng nhập tin nhắn!');
    }
  }


  updateMessages(messages: any[]): void {
    const currentUserId = localStorage.getItem('userId');
    console.log('Current User ID:', currentUserId);

    if (!this.selectedChat || !Array.isArray(messages) || !currentUserId) return;

    // Đảm bảo messages là mảng
    if (!Array.isArray(this.selectedChat.messages)) {
      this.selectedChat.messages = [];
    }

    // Lặp qua tất cả các tin nhắn mới
    messages.forEach((msg: any) => {
      const isMessageExist = this.selectedChat.messages.some(
        (existingMsg: any) =>
          existingMsg.text === msg.content &&
          existingMsg.createdAt === msg.createdAt
      );

      // Nếu tin nhắn chưa tồn tại, thêm vào danh sách
      if (!isMessageExist) {
        const isSelf = String(msg.senderId) === String(currentUserId);
        console.log('Incoming socket message:', msg);

        this.selectedChat.messages.push({
          id: msg.id,  // Sử dụng message.id
          text: msg.content,
          isSelf: isSelf,
          createdAt: msg.createdAt,
          file: msg.fileUrl,
          fileType: msg.type,
          fileName: msg.fileName || msg.fileData?.fileName,
        });
      }
    });
  }



  markAsRead() {
    if (!this.selectedChat || !this.selectedChat.messages) return;

    this.selectedChat.messages.forEach((message: { isSelf: boolean; readTime?: string }) => {
      if (message.isSelf && !message.readTime) {
        message.readTime = this.formatTime(new Date().toISOString());
      }
    });
  }

  getCurrentTime(): string {
    const now = new Date();
    return this.datePipe.transform(now, 'HH:mm') || ''; // Sử dụng DatePipe để định dạng giờ và phút
  }

  checkEmpty(): void {
    if (!this.newMessage.trim()) this.isTyping = false;
  }

  openFilePicker(type: string) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';

    if (type === 'image') {
      fileInput.accept = 'image/*';
    } else if (type === 'video') {
      fileInput.accept = 'video/*';
    } else {
      fileInput.accept = '*/*';
    }

    fileInput.addEventListener('change', (event: Event) => this.handleFileUpload(event));
    fileInput.click();
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
      const MAX_FILE_SIZE_MB = 30;

      // Kiểm tra nếu chưa chọn người nhận
      if (!this.selectedUser || !this.selectedUser._id) {
        alert('Vui lòng chọn người nhận!');
        return;
      }

      // Kiểm tra kích thước file
      if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`File quá lớn! Chỉ cho phép dưới ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      this.selectedFile = selectedFile;

      // Tạo FormData để gửi file lên server
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);
      formData.append('receiverId', String(this.selectedUser._id));

      // Gửi file tới server
      this.chatService.sendFile(formData).subscribe({
        next: (response: any) => {
          console.log('📦 Response từ server:', response);
          console.log('📄 fileData:', response?.fileData);
          console.log('✉️ messageData:', response?.message);

          const fileData = response?.fileData;
          const messageData = response?.message;

          // Kiểm tra nếu thiếu dữ liệu từ server
          if (!fileData || !messageData?.id) {
            console.error('Thiếu dữ liệu từ server!');
            alert('Lỗi: Thiếu dữ liệu từ server!');
            return;
          }

          // Kiểm tra và gán thông tin tin nhắn
          const message = {
            id: messageData.id,
            isSelf: true,
            createdAt: messageData.createdAt || new Date().toISOString(),
            file: fileData.fileUrl || fileData.url || '', // Link tải file
            fileType: fileData.fileType.startsWith('image') ? 'image' :
              fileData.fileType.startsWith('video') ? 'video' : 'file', // Xác định loại file
            fileData: {
              ...fileData,
              fileName: fileData.fileName || selectedFile.name,  // Nếu thiếu tên file từ server, dùng tên file gốc
              fileType: fileData.fileType
            }
          };

          this.selectedChat.messages.push(message);

          this.chatService.sendMessageSocket(this.selectedUser._id, {
            senderId: localStorage.getItem('userId'),
            receiverId: this.selectedUser._id,
            content: '',
            createdAt: message.createdAt,
            fileUrl: message.file,
            fileType: message.fileType,
            fileName: message.fileData?.fileName,
            id: message.id,
          });


          this.selectedFile = null;
        },
        error: (err) => {
          console.error('Lỗi khi gửi file:', err);
          alert('Có lỗi khi gửi file!');
          this.selectedFile = null;
        }
      });
    }
  }

  downloadFile(message: any) {
    const fileId = message?.fileData?.id || message.id; // Ưu tiên ID từ fileData
    const fileName = message.fileName || 'file_download';

    if (!fileId) {
      alert('Không thể tải file: Thiếu ID');
      return;
    }

    this.chatService.downloadFile(fileId).subscribe({
      next: (fileBlob) => {
        const url = window.URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;  // Tải file về với tên file
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Lỗi khi tải file:', err);
        alert('Có lỗi khi tải file!');
      }
    });
  }

}

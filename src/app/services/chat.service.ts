import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
  private baseUrl = 'https://cloudcomputing-production-b1b3.up.railway.app';

  private selectedUserSource = new BehaviorSubject<any>(null);
  selectedUser$ = this.selectedUserSource.asObservable();

  private messagesSource = new BehaviorSubject<any[]>([]);
  messages$ = this.messagesSource.asObservable();

  private friendListUpdated = new Subject<void>();
  friendListUpdated$ = this.friendListUpdated.asObservable();

  constructor(private http: HttpClient) {
    this.socket = io(this.baseUrl, { autoConnect: false });

    // Khi kết nối WebSocket thành công
    this.socket.on('connect', () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.socket.emit('register', userId); // Đăng ký userId với server
      }
    });

    // Lắng nghe sự kiện chat message từ server
    this.socket.on('chat message', (data: any) => {
      console.log('📥 Nhận tin nhắn:', data);
      this.updateMessages(data.message);
    });

    // Lắng nghe sự kiện file message từ server
    this.socket.on('file message', (data: any) => {
      console.log('📥 Nhận file:', data);
      this.updateMessages({
        ...data,
        isFile: true
      });
    });
    this.connectSocket();
  }

  connectSocket() {
    this.socket.connect();
  }

  disconnectSocket() {
    this.socket.disconnect();
  }

  sendMessageSocket(toUserId: string, message: any) {
    this.socket.emit('chat message', { toUserId, message });
  }

  sendFileSocket(fileData: any) {
    this.socket.emit('uploadFile', fileData);
  }

  notifyFriendListUpdated() {
    this.friendListUpdated.next();
  }

  setSelectedUser(user: any) {
    console.log('Setting selected user:', user);
    this.selectedUserSource.next(user);
  }

  getSelectedUser() {
    return this.selectedUser$;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token ?? ''}`,
      'Content-Type': 'application/json'
    });
  }

  getChattingUsers(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/api/messages/`, { headers });
  }

  getMessages(receiverId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}/api/messages/${receiverId}`, { headers });
  }

  sendMessage(data: { receiverId: string, content: string }): Observable<any> {
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      console.error('User is not logged in');
    }

    const messageData = {
      ...data,
      senderId: currentUserId,
      isSelf: true
    };

    const headers = this.getAuthHeaders();
    return this.http.post(`${this.baseUrl}/api/messages/send`, messageData, { headers });
  }

  updateMessages(newMessage: any) {
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) return;

    const isSelf = String(newMessage.senderId) === String(currentUserId);

    if (this.selectedUserSource.value &&
      (this.selectedUserSource.value.id === newMessage.senderId || this.selectedUserSource.value.id === newMessage.receiverId)) {

      if (!this.selectedUserSource.value.messages) {
        this.selectedUserSource.value.messages = [];
      }

      this.selectedUserSource.value.messages.push({
        id: newMessage.id,
        text: newMessage.content,
        isSelf,
        createdAt: newMessage.createdAt,
        file: newMessage.fileUrl,
        fileType: newMessage.fileType,
        fileName: newMessage.fileName || 'Tệp đính kèm',
        fileData: newMessage.fileData || null
      });
    }

    const currentMessages = this.messagesSource.value;

    this.messagesSource.next([
      ...currentMessages,
      {
        ...newMessage,
        isSelf,
        fileData: newMessage.fileData || null
      }
    ]);
  }

  sendFile(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(`${this.baseUrl}/api/messages/uploadFile`, formData, { headers });
  }

  downloadFile(fileId: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}/api/messages/downloadFile/${fileId}`, {
      headers,
      responseType: 'blob'
    });
  }

  getFriends(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}/api/friends`, { headers });
  }

  sendFriendRequest(addresseeId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.baseUrl}/api/friends/request`, { addresseeId }, { headers });
  }

  cancelFriendRequest(userId: string) {
    return this.http.post(`${this.baseUrl}/api/friends/cancel/${userId}`, {});
  }

  getFriendRequests(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}/api/friends/getFriendRequests`, { headers });
  }

  respondToFriendRequest(requestId: number, accept: boolean): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.baseUrl}/api/friends/respond/${requestId}`, { accept }, { headers });
  }

  searchUsers(username: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}/api/users/search/${username}`, { headers });
  }
}

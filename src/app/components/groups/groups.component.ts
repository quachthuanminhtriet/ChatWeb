import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-groups',
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent {
  Groups = [
    { name: 'Nhóm IT', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg', members: "10 member" },
    { name: 'Nhóm Học thuật', avatar: 'https://randomuser.me/api/portraits/lego/2.jpg', members: "3 member" },
    { name: 'Nhóm Thể thao', avatar: 'https://randomuser.me/api/portraits/lego/3.jpg', members: "4 member" }
  ];


  constructor(private chatService: ChatService) {}

  selectChat(user: any) {
    this.chatService.setSelectedUser(user);

  }
}

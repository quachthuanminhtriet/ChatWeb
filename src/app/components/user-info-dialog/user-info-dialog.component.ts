import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-user-info-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './user-info-dialog.component.html',
  styleUrls: ['./user-info-dialog.component.css']
})
export class UserInfoDialogComponent {

  userData = {
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    name: 'Nguyễn Văn A',
    bio: '🌟',
    gender: 'Nam',
    birthDate: '20 tháng 08, 2003',
    phone: '+84 093 345 762'
  };

  constructor(public dialogRef: MatDialogRef<UserInfoDialogComponent>) {}

  ngOnInit(): void {}

  editName() {
    const newName = prompt('Nhập tên mới:', this.userData.name);
    if (newName) {
      this.userData.name = newName;
    }
  }

  updateUserInfo() {
    alert('Đã cập nhật thông tin!');
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

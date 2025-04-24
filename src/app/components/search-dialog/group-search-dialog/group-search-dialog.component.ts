import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-group-search-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './group-search-dialog.component.html',
  styleUrls: ['./group-search-dialog.component.css'],
})
export class GroupSearchDialogComponent {
  
  constructor(public dialogRef: MatDialogRef<GroupSearchDialogComponent>) {}


  searchValue = '';

  suggestedFriends = [
    { name: 'Trần Thị C', mutual: 'Từ gợi ý kết bạn', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
    { name: 'Phạm Văn A', mutual: 'Từ gợi ý kết bạn', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },

  ];
  closeDialog(): void {
    this.dialogRef.close();
  }
}

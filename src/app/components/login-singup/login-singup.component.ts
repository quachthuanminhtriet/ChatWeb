import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-singup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login-singup.component.html',
  styleUrls: ['./login-singup.component.css']
})
export class LoginSingupComponent {
  activeForm: 'signin' | 'signup' = 'signin';
  name: string = '';
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  switchForm(form: 'signin' | 'signup'): void {
    this.activeForm = form;
    this.message = ''; // Xóa thông báo khi chuyển form
  }

  // Đăng ký người dùng mới
  signUp(): void {
    this.name = this.name.trim();
    this.email = this.email.trim();
    this.password = this.password.trim();

    if (!this.name || !this.email || !this.password) {
      this.message = 'Vui lòng điền đầy đủ thông tin!';
      return;
    }

    // Gọi API đăng ký
    this.authService.signup(this.name, this.email, this.password).subscribe({
      next: () => {
        this.message = 'Đăng ký thành công! Hãy đăng nhập.';
        this.switchForm('signin'); // Chuyển sang form đăng nhập
      },
      error: (error) => {
        console.error(error);
        // Xử lý các lỗi từ API
        if (error.status === 409) {
          this.message = 'Email đã được sử dụng. Vui lòng dùng email khác.';
        } else {
          this.message = 'Đăng ký thất bại. Vui lòng thử lại sau!';
        }
      }
    });
  }

  // Đăng nhập người dùng
  signIn(): void {
    this.email = this.email.trim();
    this.password = this.password.trim();
  
    if (!this.email || !this.password) {
      this.message = 'Vui lòng nhập email và mật khẩu!';
      return;
    }
  
    // Gọi API đăng nhập
    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        console.log('API response:', response);
        const token = response.token;
        const userId = response.user?.id;
    
        if (token && userId) {
          this.authService.saveAuthData(token, userId);
          this.message = 'Đăng nhập thành công!';
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        } else {
          this.message = 'Không có token hoặc userId. Đăng nhập thất bại.';
        }
      },
      error: (error) => {
        console.error(error);
        this.message = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      }
    });
  }
}

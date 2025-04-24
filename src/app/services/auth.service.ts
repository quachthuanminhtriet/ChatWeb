// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'https://cloudcomputing-production-b1b3.up.railway.app/api';

  constructor(private http: HttpClient) { }


  // API login - signup
  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/users/login`, {
      email,
      password
    });
  }

  saveAuthData(token: string, userId: number): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId.toString());
    console.log('Token & UserId saved to localStorage');
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

  signup(name: string, email: string, password: string) {
    return this.http.post(`${this.baseUrl}/users/register`, {
      username: name,
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  // Xử lý lỗi HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Lỗi xảy ra:', error.message);
    return throwError('Có lỗi xảy ra. Vui lòng thử lại sau.');
  }

}

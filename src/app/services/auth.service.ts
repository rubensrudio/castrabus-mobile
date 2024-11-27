declare var google: any;
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import * as crypto from 'crypto-js';
import { Router } from '@angular/router';
import { URL_API_AUTH } from "../shared/constants/resources-api.constants";
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${URL_API_AUTH}`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: Storage
  ) {
    this.init();
  }

  async init() {
    await this.storage.create();
  }

  login(email: string, password: string): Observable<any> {
    const hashedPassword = crypto.SHA256(password).toString();
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json'
    };

    return this.http.post<any>(this.apiUrl+'/login', { email, password: hashedPassword }, options);
  }

  async signIn(credential: any, token: string) {
    await this.storage.set('authToken', token);
    await this.storage.set("loggedInUser", JSON.stringify(credential));
    this.router.navigate(['/agendamentos'], { replaceUrl: true });
  }

  async getAuthenticate(): Promise<Boolean> {
    const user = await this.storage.get('loggedInUser');
    return user !== null;
  }

  async getUser(): Promise<any> {
    const storedUser = await this.storage.get('loggedInUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  decodeToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }

  async getAuthToken(): Promise<any> {
    return await this.storage.get('authToken');
  }

  async signOut() {
    await this.storage.remove("loggedInUser");
    await this.storage.remove("authToken");
    await this.storage.clear();
    this.router.navigate([''], { replaceUrl: true });
  }
}

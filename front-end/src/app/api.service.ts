import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(private http: HttpClient) {
  }

  signIn(userName: string, password: string, publicKey?: string): Observable<string> {
    return this.http.post<string>(`${environment.apiUrl}/login`, { userName, password, publicKey});
  }

}

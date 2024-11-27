import { inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { from, Observable, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.authService.getAuthToken()).pipe(
        switchMap((authToken) => {
            if (authToken) {
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
            }
            return next.handle(request);
        })
    );
  }
}
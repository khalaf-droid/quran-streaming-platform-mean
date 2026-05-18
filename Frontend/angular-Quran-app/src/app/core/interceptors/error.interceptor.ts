import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'حدث خطأ غير معروف، يرجى المحاولة لاحقاً';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `خطأ في الاتصال: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.status === 401) {
          errorMessage = 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً';
          authService.logout();
        } else if (error.status === 400 && error.error?.errors) {
          // Validation errors from express-validator
          errorMessage = error.error.errors[0]?.msg || 'بيانات غير صالحة';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 429) {
          errorMessage = 'لقد تجاوزت الحد المسموح من الطلبات، يرجى المحاولة بعد قليل';
        } else if (error.status >= 500) {
          errorMessage = 'حدث خطأ في الخادم، جاري العمل على إصلاحه';
        }
      }

      toastService.error(errorMessage);
      return throwError(() => error);
    })
  );
};

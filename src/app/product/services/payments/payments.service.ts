// payment.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class PaymentService {

  constructor(private http: HttpClient) {}
  getHeaders(): any {
    const apiToken = localStorage.getItem('ApiToken');
    if (apiToken) {
      const token = JSON.parse(apiToken).access_token_local;
      const headersRequest = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      return headersRequest;
    }
  }
  createOrder(amount: number) {
    return this.http.post<any>(environment.api.URL+`api/payment/create-order`, { amount: amount }, {
      headers: this.getHeaders(),
    });
  }

  verifyPayment(payload: any) {
    return this.http.post(environment.api.URL+`api/payment/verify`, payload, {
      headers: this.getHeaders(),
    });
  }
}

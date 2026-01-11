import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../../../app/shared/services/storage/storage.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AddToCartService {
  constructor(private http: HttpClient, private storageService: StorageService) { }

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

  getCartItems() {
    return this.http.get(environment.api.URL+'api/add-to-cart', {
      headers: this.getHeaders(),
    });
  }

  addToCart(productId: string, quantity: number) {
    return this.http.post(environment.api.URL+'api/add-to-cart', { productId, quantity }, {
      headers: this.getHeaders(),
    });
  }

  updateCartItem(productId: string, quantity: number) {
    return this.http.patch(environment.api.URL+`api/add-to-cart/${productId}`, { quantity }, {
      headers: this.getHeaders(),
    });
  }

  removeFromCart(productId: string) {
    return this.http.delete(environment.api.URL+`api/add-to-cart/${productId}`, {
      headers: this.getHeaders(),
    });
  }

  clearCart() {
    return this.http.delete(environment.api.URL+`api/add-to-cart`, {
      headers: this.getHeaders(),
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/shared/services/storage/storage.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WishListService {
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

  getWishList(offset: number = 0, limit: number = 10) {
    let options: any = {
      offset: offset,
      limit: limit
    };
    return this.http.get(environment.api.URL+'api/wish-list', {
      headers: this.getHeaders(),
      params: options
    });
  }

  addToWishList(productId: string) {
    return this.http.post(environment.api.URL+'api/wish-list', { productId }, {
      headers: this.getHeaders(),
    });
  }

  removeFromWishList(productId: string) {
    return this.http.delete(environment.api.URL+`api/wish-list/${productId}`, {
      headers: this.getHeaders(),
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../../shared/services/storage/storage.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
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

  getProductsByCategoryId(id: string, subCatergoryId: string, brandId: string, offset: number = 0, limit: number = 10) {
    let options: any = {
      category: id,
      subCategory: subCatergoryId,
      brand: brandId,
      offset: offset,
      limit: limit
    };
    return this.http.get(environment.api.URL+`api/products/search`, {
      headers: this.getHeaders(),
      params: options
    });
  }

  getImageBase64(payload: any) {
    const url = environment.api.URL+ 'api/products/uploadImgToBase64';
    return this.http.post(url, payload, {
      headers: this.getHeaders(),
    })
  }
}

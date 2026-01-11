import { Component, OnInit } from '@angular/core';
import { WishListService } from '../../services/wish-list/wish-list.service';
import { AddToCartService } from '../../services/add-to-cart/add-to-cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from 'src/app/app.constants';
import { TranslateService } from '@ngx-translate/core';
import { CommonBaseComponent } from '../../../../app/shared/components/common-base/common-base.component';
import { StorageService } from '../../../../app/shared/services/storage/storage.service';
import { TranslateConfigService } from '../../../../app/shared/services/translate/translate-config.service';
import { CommonService } from '../../../../app/shared/services/common/common.service';
import { ProductService } from 'src/app/dashboard/services/product/product.service';

@Component({
  selector: 'app-wish-list',
  imports: [],
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.scss',
})
export class WishListComponent extends CommonBaseComponent implements OnInit {
  wishListItems: any[] = [];
  totalItems: number = 0;
  constructor(private wishListService: WishListService, private addToCartService: AddToCartService, private snackBar: MatSnackBar,
    protected override translateService: TranslateService,
    protected override storageService: StorageService, 
    protected override translateConfigService: TranslateConfigService,
    private commonService: CommonService,
    private productService: ProductService
  ) {
    super(translateConfigService, translateService, storageService);
    super.ngOnInit();
  }
  override ngOnInit() {
    this.loadWishList();
  };
  loadWishList() {
    this.wishListService.getWishList().subscribe((response: any) => {
      console.log("Wishlist loaded", response);
      this.totalItems = response.total;
      // this.wishListItems = response.data;
      this.getProductsByIds(response);
    }, (error) => {
      console.log("Error loading wishlist", error);
    });
  }

  addToCart(product: any) {
    console.log("Adding to cart", product);
    this.addToCartService.addToCart(product.productId, 1).subscribe((response: any) => {
      console.log("Product added to cart", response);
      // remove from list after adding to cart
      this.wishListService.removeFromWishList(product.id).subscribe((response) => {
        console.log("Removed from wishlist", response);
        this.snackBar.open(this.translateService.instant('REMOVEDFROMWISHLIST'), this.translateService.instant('CLOSE'), AppConstants.SNACK_BAR_DELAY);
        this.loadWishList();
      }, (error) => {
        console.log("Error removing from wishlist", error);
      });
      this.snackBar.open('Product added to cart', 'Close', AppConstants.SNACK_BAR_DELAY );
    }, (error) => {
      console.log("Error adding product to cart", error);
    });
  }

  getProductsByIds(response: any) {
    const productIds = response.data.map((item: any) => item.productId);
    this.productService.getProductsByIds(productIds).subscribe((res: any) => {
      console.log("Products fetched by IDs", res);
      res.map((product: any) => {
        const item = response.data.find((item: any) => item.productId === product.Id);
        if (item) {
          item['ThumnailImage'] = product.ThumnailImage;
        } else {
          item['ThumnailImage'] = 'assets/images/products/product-1.jpg';
        }
      });
      this.getImgBase64(response);
    });
  }

  getImgBase64(response: any) {
    this.commonService.processImgToBase64(response.data).subscribe((products: any) => {
      console.log(products);
      let Items = response.data.map((item: any, index: number) => ({
        image: item.ThumnailImage || 'assets/images/products/product-1.jpg',
        date: new Date(item.createdAt).toLocaleDateString(),
        ...item
      }));
      this.wishListItems = Items;
    });
  }

  removeFromWishList(product: any) {
    console.log("Removing from wishlist", product); 
    this.wishListService.removeFromWishList(product.id).subscribe((response) => {
      console.log("Removed from wishlist", response);
      this.snackBar.open(this.translateService.instant('REMOVEDFROMWISHLIST'), this.translateService.instant('CLOSE'), AppConstants.SNACK_BAR_DELAY);
      this.loadWishList();
    }, (error) => {
      console.log("Error removing from wishlist", error);
    });
  }
}

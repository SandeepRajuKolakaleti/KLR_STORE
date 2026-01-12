import { Component, computed, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AddToCartService } from '../../services/add-to-cart/add-to-cart.service';
import { CartItem } from '../../models/cart-item.model';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../../../app/shared/services/storage/storage.service';
import { TranslateConfigService } from '../../../../app/shared/services/translate/translate-config.service';
import { CommonBaseComponent } from '../../../../app/shared/components/common-base/common-base.component';
import { AppConstants } from '../../../../app/app.constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from 'src/app/shared/services/common/common.service';
import { ProductService } from 'src/app/dashboard/services/product/product.service';

@Component({
  selector: 'app-add-to-cart',
  imports: [],
  templateUrl: './add-to-cart.component.html',
  styleUrl: './add-to-cart.component.scss',
})
export class AddToCartComponent extends CommonBaseComponent implements OnInit {
  addToCartItems: any[] = [];
  cartItems = signal<CartItem[]>([]);

  subTotal = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  );

  total = computed(() => this.subTotal());

  constructor(private router: Router, private addToCartService: AddToCartService,  protected override translateService: TranslateService,
    protected override storageService: StorageService, 
    protected override translateConfigService: TranslateConfigService,
    private commonService: CommonService,
    private productService: ProductService,
    private snackBar: MatSnackBar,) {
    super(translateConfigService, translateService, storageService);
    super.ngOnInit();
  }

  override ngOnInit() {
    this.loadCartItems();
  }

  loadCartItems() {
    this.addToCartService.getCartItems().subscribe((response: any) => {
      console.log("Cart items loaded", response);
      this.getProductsByIds(response);
    });
  }

  getProductsByIds(response: any) {
    const productIds = response.data.map((item: any) => item.productId);
    this.productService.getProductsByIds(productIds).subscribe((res: any) => {
      console.log("Products fetched by IDs", res);
      res.map((product: any) => {
        const cartItem = response.data.find((item: any) => item.productId === product.Id);
        if (cartItem) {
          cartItem['ThumnailImage'] = product.ThumnailImage;
        } else {
          cartItem['ThumnailImage'] = 'assets/images/products/product-1.jpg';
        }
      });
      this.getImgBase64(response);
    });
  }

  getImgBase64(response: any) {
    this.commonService.processImgToBase64(response.data).subscribe((products: any) => {
      console.log(products);
      this.addToCartItems = response.data.map((item: any, index: number) => ({
        image: item.ThumnailImage || 'assets/images/products/product-1.jpg',
        date: new Date(item.createdAt).toLocaleDateString(),
        ...item
      }));
      this.cartItems.set(this.addToCartItems);
    });
  }

  increaseQty(item: CartItem) {
    this.addToCartService.updateCartItem(item.id.toString(), item.quantity + 1).subscribe((response) => {
      console.log("Cart item quantity increased", response);
      this.loadCartItems();
      this.cartItems.update(items =>
        items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    });
  }

  decreaseQty(item: CartItem) {
    if (item.quantity <= 1) return;
    this.addToCartService.updateCartItem(item.id.toString(), item.quantity - 1).subscribe((response) => {
      console.log("Cart item quantity decreased", response);
      this.loadCartItems();
      this.cartItems.update(items =>
        items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
        )
      );
    });
  }

  removeAddToCart(item: CartItem) {
    console.log("Removing item from cart", item);
    this.addToCartService.removeFromCart(item.id.toString()).subscribe((response) => {
      console.log("Item removed from cart", response);
      // this.cartItems.update(items => items.filter(i => i.id !== item.id));
      this.loadCartItems();
    });
  }

  clearCart() {
    this.addToCartService.clearCart().subscribe((response) => {
      console.log("Cart cleared", response);
      this.cartItems.set([]);
      this.loadCartItems();
      this.snackBar.open(this.translateService.instant('CARTCLEARED'), this.translateService.instant('CLOSE'), AppConstants.SNACK_BAR_DELAY);
    });
  }

  navigateToContinueShopping() {
    this.router.navigate(['product/list']);
  }

  navigateToCheckout() {
    this.router.navigate(['product/checkout']);
  }
}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { WishListComponent } from './components/wish-list/wish-list.component';
import { AddToCartComponent } from './components/add-to-cart/add-to-cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CompareProductsComponent } from './components/compare-products/compare-products.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }, {
    path: 'list',
    component: ProductListComponent,
  }, {
    path: 'detail',
    component: ProductDetailComponent,
  }, {
    path: 'wish-list',
    component: WishListComponent,
  }, {
    path: 'add-to-cart',
    component: AddToCartComponent,
  }, {
    path: 'checkout',
    component: CheckoutComponent,
  }, {
    path: 'compare',
    component: CompareProductsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }

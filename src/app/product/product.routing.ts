import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { WishListComponent } from './components/wish-list/wish-list.component';
import { AddToCartComponent } from './components/add-to-cart/add-to-cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CompareProductsComponent } from './components/compare-products/compare-products.component';
import { AuthGuard } from '../auth/services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }, {
    path: 'list',
    component: ProductListComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'detail',
    component: ProductDetailComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'wish-list',
    component: WishListComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'add-to-cart',
    component: AddToCartComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'compare',
    component: CompareProductsComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }

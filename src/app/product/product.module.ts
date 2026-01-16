import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRoutingModule } from './product.routing';
import { SharedModule } from '../shared/shared.module';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { WishListService } from './services/wish-list/wish-list.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentService } from './services/payments/payments.service';
import { OrdersService } from './services/orders/orders.service';



@NgModule({
  declarations: [ProductListComponent, ProductDetailComponent],
  imports: [
    CommonModule,
    ProductRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [WishListService, PaymentService, OrdersService]
})
export class ProductModule { }

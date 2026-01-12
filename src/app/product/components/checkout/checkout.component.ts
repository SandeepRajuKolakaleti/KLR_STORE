import { Component, computed, OnInit, signal } from '@angular/core';
import { AddToCartService } from '../../services/add-to-cart/add-to-cart.service';
import { ProductService } from '../../../../app/dashboard/services/product/product.service';
import { CommonService } from '../../../../app/shared/services/common/common.service';
import { CartItem } from '../../models/cart-item.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payments/payments.service';
declare var Razorpay: any;
@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  addToCartItems: any[] = [];
  cartItems = signal<CartItem[]>([]);
  checkoutForm!: FormGroup;
  shipToDifferentAddress = signal(false);
  subTotal = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  );
  
  constructor(private addToCartService: AddToCartService, private productService: ProductService, private commonService: CommonService, private fb: FormBuilder, private paymentService: PaymentService) {}

  ngOnInit() {
    this.buildForm();
    this.loadCartItems();
  }

  buildForm() {
    this.checkoutForm = this.fb.group({
      billing: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        address1: ['', Validators.required],
        address2: [''],
        country: ['', Validators.required],
        city: ['', Validators.required],
        zipcode: ['', Validators.required],
        phone: ['', Validators.required],
        company: [''],
        email: ['', [Validators.required, Validators.email]],
        notes: ['']
      }),

      shipToDifferent: [false],

      shipping: this.fb.group({
        firstName: [''],
        lastName: [''],
        company: [''],
        country: [''],
        address1: [''],
        address2: [''],
        state: [''],
        city: [''],
        zipcode: ['']
      }),
      paymentMethod: ['cod', Validators.required]
    });

    this.toggleShippingValidators(false);
  }

  toggleShipping(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.shipToDifferentAddress.set(checked);
    this.checkoutForm.patchValue({ shipToDifferent: checked });
    this.toggleShippingValidators(checked);
  }

  private toggleShippingValidators(enabled: boolean) {
    const shippingGroup = this.checkoutForm.get('shipping') as FormGroup;

    Object.keys(shippingGroup.controls).forEach(key => {
      const control = shippingGroup.get(key);
      enabled ? control?.setValidators(Validators.required)
              : control?.clearValidators();
      control?.updateValueAndValidity();
    });
  }

  placeOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }
    // store this.checkoutForm in backend then initiate payment
    
    if (this.paymentMethod === 'online')
    this.pay(this.subTotal());

    console.log('ORDER PAYLOAD', this.checkoutForm.value);
  }

  get paymentMethod() {
    return this.checkoutForm.get('paymentMethod')?.value;
  }

  selectPayment(method: string) {
    this.checkoutForm.get('paymentMethod')?.setValue(method);
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

  pay(amount: number) {
    this.paymentService.createOrder(amount).subscribe(order => {
      const options = {
        key: 'rzp_test_S2xGhnZlqNr2mL', // PUBLIC KEY ONLY
        amount: order.amount,
        currency: order.currency,
        name: 'My KLR Store',
        description: 'Order Payment',
        order_id: order.id,
        handler: (response: any) => {
          this.paymentService.verifyPayment(response).subscribe((res: any) => {
            if (res.success) {
              alert('Payment Successful');
            } else {
              alert('Payment Failed');
            }
          });
        },
        theme: { color: '#3399cc' },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    });
  }
}

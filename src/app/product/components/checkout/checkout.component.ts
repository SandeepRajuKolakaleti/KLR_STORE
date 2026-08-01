import { Component, computed, OnInit, signal } from '@angular/core';
import { AddToCartService } from '../../services/add-to-cart/add-to-cart.service';
import { ProductService } from '../../../../app/dashboard/services/product/product.service';
import { CommonService } from '../../../../app/shared/services/common/common.service';
import { CartItem } from '../../models/cart-item.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payments/payments.service';
import { AppConstants } from '../../../../app/app.constants';
import { environment } from '../../../../environments/environment';
import { OrdersService } from '../../services/orders/orders.service';
import { A } from '@angular/cdk/keycodes';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
declare let $: any;
declare var Razorpay: any;
export {};
declare global {
  interface Window {
    paypal: any;
  }
}

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  appConstants = AppConstants;
  savedOrder: any;
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
  
  constructor(private addToCartService: AddToCartService, private productService: ProductService, private commonService: CommonService, private fb: FormBuilder, private paymentService: PaymentService,
    private orderService: OrdersService, private snackBar: MatSnackBar, private router: Router
  ) {}

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
      paymentMethod: ['cod', Validators.required],
      paymentVia: ['']
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
    let items: { Id: number; ProductId: number; Quantity: number; UnitPrice: number; }[] = [], index = 0;
    this.cartItems().forEach((item: CartItem) => {
      index++;
      items.push({
        Id: index,
        ProductId: item.productId,
        Quantity: item.quantity,
        UnitPrice: Number(item.price)
      });
    });
    console.log("Cart Item", items);
    let billingAddress = this.checkoutForm.value.billing.address1+ ' '+ this.checkoutForm.value.billing.address2 + ' '+ this.checkoutForm.value.billing.city+ ' '+ this.checkoutForm.value.billing.country+ ' '+ this.checkoutForm.value.billing.zipcode;
    let shippingAddress = '';
    if (this.shipToDifferentAddress()) {
      shippingAddress = this.checkoutForm.value.shipping.address1+ ' '+ this.checkoutForm.value.shipping.address2 + ' '+ this.checkoutForm.value.shipping.city+ ' '+ this.checkoutForm.value.shipping.country+ ' '+ this.checkoutForm.value.shipping.zipcode;
    } else {
      shippingAddress = billingAddress;
    }
    console.log("BILLING ADDRESS", billingAddress);
    console.log("SHIPPING ADDRESS", shippingAddress);
    
    const apiToken = localStorage.getItem('ApiToken');
    const userId = apiToken ? JSON.parse(apiToken).id : null;

    var payload = {
      OrderDate: new Date().toLocaleDateString(),
      TotalAmount: this.subTotal(),
      TransactionId: '',
      Status: AppConstants.orderStatus.pending,
      isActive: 1,
      PaymentMethod: this.paymentVia === '' ? 'CashOnDelivery': this.paymentVia,
      IsPaid: false,
      PaidAt: new Date().toLocaleDateString(),
      ShippingAddress: shippingAddress,
      BillingAddress: billingAddress,
      Email: this.checkoutForm.value.billing.email,
      PhoneNumber: this.checkoutForm.value.billing.phone,
      Notes: this.checkoutForm.value.billing.notes,
      Items: items,
      UserId: Number(userId)
    }
    console.log('ORDER PAYLOAD', payload);
    this.orderService.createOrder(payload).subscribe((response: any) => {
      console.log("Order created successfully", response);
      this.savedOrder = response;
      if (this.paymentMethod === 'online' && this.paymentVia === AppConstants.paymentVia.razorpay) {
        this.razorPay(this.subTotal());
      }
      if (this.paymentMethod === 'online' && this.paymentVia === AppConstants.paymentVia.paypal) {
        this.payPal();
      }
    }, error => {
      console.error("Error creating order", error);
    }); 
  }

  get paymentMethod() {
    return this.checkoutForm.get('paymentMethod')?.value;
  }

  get paymentVia() {
    return this.checkoutForm.get('paymentVia')?.value;
  }

  selectPayment(method: string, via?: string) {
    $('#paypal-button').empty();
    this.checkoutForm.get('paymentMethod')?.setValue(method);
    this.checkoutForm.get('paymentVia')?.setValue(via || '');
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
      // console.log(products);
      this.addToCartItems = response.data.map((item: any, index: number) => ({
        image: item.ThumnailImage || 'assets/images/products/product-1.jpg',
        date: new Date(item.createdAt).toLocaleDateString(),
        ...item
      }));
      this.cartItems.set(this.addToCartItems);
    });
  }

  razorPay(amount: number) {
    this.paymentService.createOrder(this.paymentVia, amount).subscribe(order => {
      const options = {
        key: environment.api.razorPayKey, // PUBLIC KEY ONLY
        amount: order.amount,
        currency: order.currency,
        name: AppConstants.KLRStore.name,
        description: AppConstants.KLRStore.description,
        order_id: order.id,
        handler: (response: any) => {
          this.paymentService.verifyPayment(this.paymentVia, response).subscribe((res: any) => {
            console.log("Razorpay payment verification response", res);
            if (res.success) {
              alert('Payment Successful');
              // Update order status to paid
              var updatePayload = {
                ...this.savedOrder,
                TransactionId: response.razorpay_payment_id,
                Status: AppConstants.orderStatus.processing,
                IsPaid: true,
                PaidAt: new Date().toLocaleDateString(),
              };
              this.orderService.updateOrder(updatePayload).subscribe((updateRes: any) => {
                console.log("Order updated successfully after payment", updateRes);
                this.snackBar.open('Payment Successful and Order Updated', 'Close', { duration: AppConstants.SNACK_BAR_DELAY.duration });
                this.router.navigate(['profile']);
              });
            } else {
              alert('Payment Failed');
            }
          });
        },
        modal: {
          ondismiss: () => {
            // Cancel callback
            console.warn('Payment Cancelled by user');
            this.onPaymentCancelled();
          }
        },
        theme: { color: '#3399cc' },
      };
      const rzp = new Razorpay(options);
      rzp.open();
    });
  }

  onPaymentCancelled() {
    // Show message or redirect
    alert('Payment was cancelled.');
  }

  payPal() {
    $('#paypal-button').empty();
      window.paypal.Buttons({
        createOrder: async () => {
          const order: any = await this.paymentService.createOrder(AppConstants.paymentVia.paypal, this.subTotal()).toPromise();
          return order.id;
        },
        onApprove: async (data: { orderID: any; }) => {
          console.log('PayPal payment approved:', data);
          await this.paymentService.verifyPayment(AppConstants.paymentVia.paypal, {
            orderId: data.orderID,
          }).toPromise();
          alert('Payment Successful');
          // Update order status to paid
          var updatePayload = {
            ...this.savedOrder,
            TransactionId: data.orderID,
            Status: AppConstants.orderStatus.processing,
            IsPaid: true,
            PaidAt: new Date().toLocaleDateString(),
          };
          this.orderService.updateOrder(updatePayload).subscribe((updateRes: any) => {
            console.log("Order updated successfully after payment", updateRes);
            this.snackBar.open('Payment Successful and Order Updated', 'Close', { duration: AppConstants.SNACK_BAR_DELAY.duration });
            this.router.navigate(['profile']);
          });
        },
        onCancel: () => {
          console.log('OnCancel');
          alert('Payment Cancelled');
        },
        onError: (err: any) => {
          console.error('Error occurred during PayPal payment:', err);
          alert('Payment Failed');
        }
      }).render('#paypal-button');
  }
}

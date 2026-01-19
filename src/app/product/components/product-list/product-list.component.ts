import { MatSnackBar } from '@angular/material/snack-bar';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { ProductService } from '../../../../app/dashboard/services/product/product.service';
import { CommonService } from '../../../../app/shared/services/common/common.service';
import { WishListService } from '../../services/wish-list/wish-list.service';
import { AppConstants } from '../../../../app/app.constants';
import { TranslateService } from '@ngx-translate/core';
import { AddToCartService } from '../../services/add-to-cart/add-to-cart.service';
import { CommonBaseComponent } from '../../../../app/shared/components/common-base/common-base.component';
import { StorageService } from '../../../../app/shared/services/storage/storage.service';
import { TranslateConfigService } from '../../../../app/shared/services/translate/translate-config.service';
import { CartStore } from '../../../../app/shared/services/cart/cart.store.service';
import { WishListStore } from 'src/app/shared/services/wish-list/wish-list.store.service';
declare let $: any;

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss'],
    standalone: false
})
export class ProductListComponent extends CommonBaseComponent implements OnInit, AfterViewInit {
  products: any[] = [];
  responseData: any;
  categoryName: any;
  productDetail: any;
  constructor(private route: ActivatedRoute, private productService: ProductService, private commonService: CommonService,
    private router: Router, private wishListService: WishListService, protected override translateService: TranslateService,
    protected override storageService: StorageService, 
    protected override translateConfigService: TranslateConfigService,
    private snackBar: MatSnackBar, private addToCartService: AddToCartService,
    private cartStore: CartStore,
    private wishListStore: WishListStore
  ) {
    super(translateConfigService, translateService, storageService);
    super.ngOnInit();
   }

  override ngOnInit(): void {
    // Id=8&ThumnailImage=product-images%2FMobile%26Computers.jpg&Name=Accessories&Slug=Accessories&Status=1&createdAt=2025-12-20T11:45:19.407Z&updatedAt=2025-12-20T11:45:19.407Z
    // Id=4&ThumnailImage=product-images%2Fgame.png&Name=Controller&Category=2&Slug=Controller&Status=1
    this.route.queryParams.subscribe((params: any) => {
      const catergoryId = params.Category;
      this.categoryName = params.Name;
      if (catergoryId) {
        const subCatergoryId = params.Id
        this.productService.getProductsByCategoryId(catergoryId, subCatergoryId, '').subscribe((response: any) => {
          console.log(response);
          this.responseData = response;
          this.products = response.data;
          this.processImgToBase64(this.products).subscribe((products: any) => {
            console.log(products);
            this.products = this.products.map((item: any, index: number) => ({
              position: index + 1,
              name: item.Name,
              image: item.ThumnailImage || 'assets/images/products/product-1.jpg',
              price: item.Price,
              status: item.Status,
              date: new Date(item.createdAt).toLocaleDateString(),
              ...item
            }));
          });
        });
      } else {
        const idParam = params.Id;
        if (idParam) {
          this.productService.getProductsByCategoryId(idParam, '', '').subscribe((response: any) => {
            console.log(response);
            this.responseData = response;
            this.products = response.data;
            this.processImgToBase64(this.products).subscribe((products: any) => {
              console.log(products);
              this.products = this.products.map((item: any, index: number) => ({
                position: index + 1,
                name: item.Name,
                image: item.ThumnailImage || 'assets/images/products/product-1.jpg',
                price: item.Price,
                status: item.Status,
                date: new Date(item.createdAt).toLocaleDateString(),
                ...item
              }));
            });
          });
        } else {
          console.error('Invalid or missing category ID in route');
        }
      }
      
    });
  }

  processImgToBase64(data: any) {
    const imageObservables = data.map((product: {
      ThumnailImagePath: string; ThumnailImage: string 
    }) => {
      return this.productService.getImageBase64({ url: product.ThumnailImage }).pipe(
        map((response: any) => {
          product.ThumnailImagePath = product.ThumnailImage;
          product.ThumnailImage = response? response.img: '';
          return product;
        })
      );
    });
    return forkJoin(imageObservables); 
  }

  closeModal() {
    setTimeout(() => {
      $(".modal-backdrop.fade.show").not(":first").remove();
      $('#quickViewModal').modal('hide');
      $(".zoomContainer").remove();
      $('body').css('padding', '0px');
    }, 500);
  }

  openProductDetails(product: any) {
    $(".modal-backdrop.fade.show").not(":first").remove();
    this.productDetail = product;
    this.commonService.loadScriptsInOrder([
      "./assets/js/vendor/modernizr-3.6.0.min.js",
      "./assets/js/vendor/jquery-3.6.0.min.js",
      "./assets/js/vendor/jquery-migrate-3.3.0.min.js",
      "./assets/js/vendor/bootstrap.bundle.min.js",
      "./assets/js/plugins/slick.js",
      "./assets/js/plugins/jquery.syotimer.min.js",
      "./assets/js/plugins/wow.js",
      "./assets/js/plugins/perfect-scrollbar.js",
      "./assets/js/plugins/magnific-popup.js",
      "./assets/js/plugins/select2.min.js",
      "./assets/js/plugins/waypoints.js",
      "./assets/js/plugins/counterup.js",
      "./assets/js/plugins/jquery.countdown.min.js",
      "./assets/js/plugins/images-loaded.js",
      "./assets/js/plugins/isotope.js",
      "./assets/js/plugins/scrollup.js",
      "./assets/js/plugins/jquery.vticker-min.js",
      "./assets/js/plugins/jquery.theia.sticky.js",
      "./assets/js/plugins/jquery.elevatezoom.js",
      "./assets/js/main.js?v=4.0",
      "./assets/js/shop.js?v=4.0"
    ]);
  }

  addToWishList(product: any) {
    console.log("Add to wishlist", product);
    this.wishListService.addToWishList(product.Id).subscribe((response) => {
      console.log("Added to wishlist", response);
      this.wishListStore.increase(1);
      this.snackBar.open(this.translateService.instant('ADDEDTOWISHLIST'), this.translateService.instant('CLOSE'), AppConstants.SNACK_BAR_DELAY);
    }, (error) => {
      console.log("Error adding to wishlist", error);
    });
  }

  addToCart(productDetail: any) {
    console.log("Add to cart", productDetail);
    const product = {
      ...productDetail,
      quantity: productDetail.quantity ? productDetail.Quantity : 1
    }
    this.addToCartService.addToCart(product.Id, product.quantity).subscribe((response) => {
      console.log("Added to cart", response);
      this.cartStore.increase(product.quantity);
      this.snackBar.open(this.translateService.instant('ADDEDTOCART'), this.translateService.instant('CLOSE'), AppConstants.SNACK_BAR_DELAY);
      // this.router.navigate(['product/add-to-cart']);
    }, (error) => {
      console.log("Error adding to cart", error);
    });
  }

  navigatToDetail(product: any) {
    this.router.navigate(['product/detail'], {
      queryParams: {
        product: JSON.stringify(product)
      }
    });
  }
  
  ngAfterViewInit() {
    this.loadJqueryScripts();
  }

  loadJqueryScripts() {
    /*-------------------------------
      Sort by active
    -----------------------------------*/
    if ($(".sort-by-product-area").length) {
      var $body = $("body"),
          $cartWrap = $(".sort-by-product-area"),
          $cartContent = $cartWrap.find(".sort-by-dropdown");
      $cartWrap.on("click", ".sort-by-product-wrap", (e: any) => {
        console.log("e", e);
        e.preventDefault();
        var $this = $(e.currentTarget);
        if (!$this.parent().hasClass("show")) {
            $this.siblings(".sort-by-dropdown").addClass("show").parent().addClass("show");
        } else {
            $this.siblings(".sort-by-dropdown").removeClass("show").parent().removeClass("show");
        }
      });
      /*Close When Click Outside*/
      $body.on("click", function (e: { target: any; }) {
        var $target = e.target;
        if (!$($target).is(".sort-by-product-area") && !$($target).parents().is(".sort-by-product-area") && $cartWrap.hasClass("show")) {
          $cartWrap.removeClass("show");
          $cartContent.removeClass("show");
        }
      });
    }

    /*-----------------------
      Shop filter active 
    ------------------------- */
    $(".shop-filter-toogle").on("click", function (e: { preventDefault: () => void; }) {
      e.preventDefault();
      $(".shop-product-fillter-header").slideToggle();
    });
    var shopFiltericon = $(".shop-filter-toogle");
    shopFiltericon.on("click", function () {
      $(".shop-filter-toogle").toggleClass("active");
    });
  }

}

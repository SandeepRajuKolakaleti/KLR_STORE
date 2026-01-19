import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common/common.service';
import { AddToCartService } from '../../services/add-to-cart/add-to-cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../../../app/shared/services/storage/storage.service';
import { TranslateConfigService } from '../../../../app/shared/services/translate/translate-config.service';
import { CommonBaseComponent } from '../../../../app/shared/components/common-base/common-base.component';
import { CartStore } from 'src/app/shared/services/cart/cart.store.service';
import { AppConstants } from 'src/app/app.constants';
import { WishListService } from '../../services/wish-list/wish-list.service';
import { WishListStore } from '../../../shared/services/wish-list/wish-list.store.service';
declare let $: any;

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss'],
    standalone: false
})
export class ProductDetailComponent extends CommonBaseComponent implements OnInit, AfterViewInit {
    productDetail: any;
  constructor(private commonService: CommonService, private router: ActivatedRoute, private addToCartService: AddToCartService,
      protected override translateService: TranslateService,
      protected override storageService: StorageService, 
      protected override translateConfigService: TranslateConfigService,
    private snackBar: MatSnackBar, private cartStore: CartStore, private wishListService: WishListService,
    private wishListStore: WishListStore
  ) { 
    super(translateConfigService, translateService, storageService);
    super.ngOnInit();
  }

  override ngOnInit(): void {
    this.router.queryParams.subscribe((params: any) => {
      const product = params.product;
      this.productDetail = JSON.parse(product);
      console.log(product);
    });
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

  ngAfterViewInit() {
    this.commonService.loadScriptsInOrder([
        "assets/js/vendor/modernizr-3.6.0.min.js",
        "assets/js/vendor/jquery-3.6.0.min.js",
        "assets/js/vendor/jquery-migrate-3.3.0.min.js",
        "assets/js/vendor/bootstrap.bundle.min.js",
        "assets/js/plugins/slick.js",
        "assets/js/plugins/jquery.syotimer.min.js",
        "assets/js/plugins/wow.js",
        "assets/js/plugins/perfect-scrollbar.js",
        "assets/js/plugins/magnific-popup.js",
        "assets/js/plugins/select2.min.js",
        "assets/js/plugins/waypoints.js",
        "assets/js/plugins/counterup.js",
        "assets/js/plugins/jquery.countdown.min.js",
        "assets/js/plugins/images-loaded.js",
        "assets/js/plugins/isotope.js",
        "assets/js/plugins/scrollup.js",
        "assets/js/plugins/jquery.vticker-min.js",
        "assets/js/plugins/jquery.theia.sticky.js",
        "assets/js/plugins/jquery.elevatezoom.js",
        "./assets/js/main.js?v=4.0",
        "./assets/js/shop.js?v=4.0"
      ]);
    this.loadJqueryScripts();
  }
  loadJqueryScripts() {

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

    /*-------------------------------------
        Product details big image slider
    ---------------------------------------*/
    $(".pro-dec-big-img-slider").slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        draggable: false,
        fade: false,
        asNavFor: ".product-dec-slider-small , .product-dec-slider-small-2"
    });

    /*---------------------------------------
        Product details small image slider
    -----------------------------------------*/
    $(".product-dec-slider-small").slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        asNavFor: ".pro-dec-big-img-slider",
        dots: false,
        focusOnSelect: true,
        fade: false,
        arrows: false,
        responsive: [
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 4
                }
            },
            {
                breakpoint: 575,
                settings: {
                    slidesToShow: 2
                }
            }
        ]
    });

    /*-----------------------
        Magnific Popup
    ------------------------*/
    $(".img-popup").magnificPopup({
        type: "image",
        gallery: {
            enabled: true
        }
    });
    $(".product-image-slider").slick("setPosition");
    $(".slider-nav-thumbnails").slick("setPosition");

    $(".product-image-slider .slick-active img").elevateZoom({
      zoomType: "inner",
      cursor: "crosshair",
      zoomWindowFadeIn: 500,
      zoomWindowFadeOut: 750
    });
  }

}

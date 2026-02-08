import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/categories/services/category.service';
import { ProductService } from '../../services/product/product.service';
import { forkJoin, map } from 'rxjs';
import { CommonBaseComponent } from '../../../../app/shared/components/common-base/common-base.component';
import { CommonService } from '../../../../app/shared/services/common/common.service';
import { TranslateService } from '@ngx-translate/core';
import { WishListService } from '../../../../app/product/services/wish-list/wish-list.service';
import { StorageService } from '../../../../app/shared/services/storage/storage.service';
import { TranslateConfigService } from '../../../../app/shared/services/translate/translate-config.service';
import { AddToCartService } from '../../../../app/product/services/add-to-cart/add-to-cart.service';
import { CartStore } from '../../../../app/shared/services/cart/cart.store.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WishListStore } from '../../../../app/shared/services/wish-list/wish-list.store.service';
import { AppConstants } from '../../../../app/app.constants';
import { OrdersService } from '../../../../app/product/services/orders/orders.service';
declare let $: any;

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent extends CommonBaseComponent implements AfterViewInit {
    products: any[] = [];
    recentProducts: any[] = [];
    bestProducts: any[] = [];
    newArrivalProducts: any[] = [];
    featuredProducts: any[] = [];
    topProducts: any[] = [];
    responseData: any;
    categories: any;
    productDetail: any;
    constructor(private categoryService: CategoryService,
        private route: ActivatedRoute, private productService: ProductService, private commonService: CommonService,
        private router: Router, private wishListService: WishListService, protected override translateService: TranslateService,
        protected override storageService: StorageService, 
        protected override translateConfigService: TranslateConfigService,
        private snackBar: MatSnackBar, private addToCartService: AddToCartService,
        private cartStore: CartStore,
        private wishListStore: WishListStore,
        private ordersService: OrdersService
    ) {
        super(translateConfigService, translateService, storageService);
        super.ngOnInit();
     }

    ngAfterViewInit(): void {
        this.getAllCategories();
        this.getAllProducts();
        this.getTopRecentProductsByOrders();
        this.getBestProducts();
        this.getNewArrivalProducts();
        this.getFeaturedProducts();
        this.getTopProducts();
    }

    getAllProducts() {
        this.selectCategory('');
    }

    getAllCategories() {
        this.categoryService.getAll().subscribe((response: any) => {
            console.log(response.data)
            this.categories = response.data;
            setTimeout(() => {
                this.loadJqueryScripts()
            }, 0);
        });
    }

    navigateTo(item: any) {
        console.log(item);
        this.router.navigate(['product/list'],{
            queryParams: item,
        })
    }

    selectCategory(id: string) {
        this.productService.getProductsByCategoryId(id, '', '').subscribe((response: any) => {
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
    }

    navigatToDetail(product: any) {
        this.router.navigate(['product/detail'], {
        queryParams: {
            product: JSON.stringify(product)
        }
        });
    }

    processImgToBase64(data: any) {
        const imageObservables = data.map((product: {
          ThumnailImagePath: string; ThumnailImage: string; image: string
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

    getTopRecentProductsByOrders() {
        this.ordersService.getTopRecentSoldProductssByOrders().subscribe((response: any) => {
            console.log("Recent products by orders", response);
            this.recentProducts = response;
            this.processImgToBase64(this.recentProducts).subscribe((products: any) => {
            console.log(products);
                this.recentProducts = this.recentProducts.map((item: any, index: number) => ({
                    position: index + 1,
                    name: item.name,
                    image: item.ThumnailImage || 'assets/images/products/product-1.jpg',
                    price: item.price,
                    vendor: item.vendorId,
                    date: new Date(item.createdAt).toLocaleDateString(),
                    ...item
                }));
                /*Carausel 4 columns*/
                $(".carausel-4-columns").each( (key: any, item: any) => {
                    var id = item.id;
                    var sliderID = "#" + id;
                    var appendArrowsClassName = "#" + id + "-arrows";

                    $(sliderID).slick({
                        dots: false,
                        infinite: true,
                        speed: 1000,
                        arrows: true,
                        autoplay: true,
                        slidesToShow: 4,
                        slidesToScroll: 1,
                        loop: true,
                        adaptiveHeight: true,
                        responsive: [
                            {
                                breakpoint: 1025,
                                settings: {
                                    slidesToShow: 3,
                                    slidesToScroll: 3
                                }
                            },
                            {
                                breakpoint: 480,
                                settings: {
                                    slidesToShow: 1,
                                    slidesToScroll: 1
                                }
                            }
                        ],
                        prevArrow: '<span class="slider-btn slider-prev"><i class="fi-rs-arrow-small-left"></i></span>',
                        nextArrow: '<span class="slider-btn slider-next"><i class="fi-rs-arrow-small-right"></i></span>',
                        appendArrows: appendArrowsClassName
                    });
                });
                /*Carausel 4 columns*/
            });
        });
    }

    getBestProducts() {
        this.productService.getBestProducts().subscribe((response: any) => {
            console.log(response);
            this.bestProducts = response;
            this.processImgToBase64(this.bestProducts).subscribe((products: any) => {
                console.log(products);
                this.bestProducts = this.bestProducts.map((item: any, index: number) => ({
                    position: index + 1,
                    name: item.Name,
                    image: item.ThumnailImage || 'assets/images/products/product-1.jpg',
                    price: item.Price,
                    vendor: item.vendor,
                    date: new Date(item.createdAt).toLocaleDateString(),
                    ...item
                }));
            });
        });
    }

    getNewArrivalProducts() {
        this.productService.getNewArrivalProducts().subscribe((response: any) => {
            console.log(response);
            this.newArrivalProducts = response;
            this.processImgToBase64(this.newArrivalProducts).subscribe((products: any) => {
                console.log(products);
                this.newArrivalProducts = this.newArrivalProducts.map((item: any, index: number) => ({
                    position: index + 1,
                    name: item.Name,
                    image: item.ThumnailImage || 'assets/images/products/product-1.jpg',
                    price: item.Price,
                    vendor: item.vendor,
                    date: new Date(item.createdAt).toLocaleDateString(),
                    ...item
                }));
            })
        });
    }

    getFeaturedProducts() {
        this.productService.getFeaturedProducts().subscribe((response: any) => {
            console.log(response);
            this.featuredProducts = response;
            this.processImgToBase64(this.featuredProducts).subscribe((products: any) => {
                console.log(products);
                this.featuredProducts = this.featuredProducts.map((item: any, index: number) => ({
                    position: index + 1,
                    name: item.Name,
                    image: item.ThumnailImage || 'assets/images/products/product-1.jpg',
                    price: item.Price,
                    vendor: item.vendor,
                    date: new Date(item.createdAt).toLocaleDateString(),
                    ...item
                }));
            })
        });
    }

    getTopProducts() {
        this.productService.getTopProducts().subscribe((response: any) => {
            console.log(response);
            this.topProducts = response;
            this.processImgToBase64(this.topProducts).subscribe((products: any) => {
                console.log(products);
                this.topProducts = this.topProducts.map((item: any, index: number) => ({
                    position: index + 1,
                    name: item.Name,
                    image: item.ThumnailImage || 'assets/images/products/product-1.jpg',
                    price: item.Price,
                    vendor: item.vendor,
                    date: new Date(item.createdAt).toLocaleDateString(),
                    ...item
                }));
            })
        });
    }

    loadJqueryScripts() {
        /*------ Hero slider 1 ----*/
        $(".hero-slider-1").slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: true,
            loop: true,
            dots: true,
            arrows: true,
            prevArrow: '<span class="slider-btn slider-prev"><i class="fi-rs-angle-left"></i></span>',
            nextArrow: '<span class="slider-btn slider-next"><i class="fi-rs-angle-right"></i></span>',
            appendArrows: ".hero-slider-1-arrow",
            autoplay: true
        });

        /*Carausel 8 columns*/
        $(".carausel-8-columns").each((key: any, item: any) => {
            var id = item.id;
            var sliderID = "#" + id;
            var appendArrowsClassName = "#" + id + "-arrows";

            $(sliderID).slick({
                dots: false,
                infinite: true,
                speed: 1000,
                arrows: true,
                autoplay: true,
                slidesToShow: 8,
                slidesToScroll: 1,
                loop: true,
                adaptiveHeight: true,
                responsive: [
                    {
                        breakpoint: 1025,
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1
                        }
                    }
                ],
                prevArrow: '<span class="slider-btn slider-prev"><i class="fi-rs-arrow-small-left"></i></span>',
                nextArrow: '<span class="slider-btn slider-next"><i class="fi-rs-arrow-small-right"></i></span>',
                appendArrows: appendArrowsClassName
            });
        });

        /*Carausel 10 columns*/
        $(".carausel-10-columns").each( (key: any, item: any) => {
            var id = item.id;
            var sliderID = "#" + id;
            var appendArrowsClassName = "#" + id + "-arrows";

            $(sliderID).slick({
                dots: false,
                infinite: true,
                speed: 1000,
                arrows: true,
                autoplay: false,
                slidesToShow: 10,
                slidesToScroll: 1,
                loop: true,
                adaptiveHeight: true,
                responsive: [
                    {
                        breakpoint: 1025,
                        settings: {
                            slidesToShow: 4,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 1
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1
                        }
                    }
                ],
                prevArrow: '<span class="slider-btn slider-prev"><i class="fi-rs-arrow-small-left"></i></span>',
                nextArrow: '<span class="slider-btn slider-next"><i class="fi-rs-arrow-small-right"></i></span>',
                appendArrows: appendArrowsClassName
            });
        });

        $(".carausel-3-columns").each( (key: any, item: any)  => {
            var id = item.id;
            var sliderID = "#" + id;
            var appendArrowsClassName = "#" + id + "-arrows";

            $(sliderID).slick({
                dots: false,
                infinite: true,
                speed: 1000,
                arrows: true,
                autoplay: true,
                slidesToShow: 3,
                slidesToScroll: 1,
                loop: true,
                adaptiveHeight: true,
                responsive: [
                    {
                        breakpoint: 1025,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 3
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }
                ],
                prevArrow: '<span class="slider-btn slider-prev"><i class="fi-rs-arrow-small-left"></i></span>',
                nextArrow: '<span class="slider-btn slider-next"><i class="fi-rs-arrow-small-right"></i></span>',
                appendArrows: appendArrowsClassName
            });
        });

    }

    getWowDelay(index: number) {
        return "."+index+"s";
    }

}

import { AfterViewInit, Component, computed, effect, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../../../app/auth/services/auth/auth.service';
import { CommonService } from '../../services/common/common.service';
import { CategoryService } from 'src/app/categories/services/category.service';
import { SubCategoryService } from 'src/app/categories/services/sub-category.service';
import { CartStore } from '../../services/cart/cart.store.service';
import { AddToCartService } from '../../../../app/product/services/add-to-cart/add-to-cart.service';
import { WishListService } from '../../../../app/product/services/wish-list/wish-list.service';
import { WishListStore } from '../../services/wish-list/wish-list.store.service';
import { ProductService } from '../../../../app/dashboard/services/product/product.service';
declare let $: any;

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements AfterViewInit {
  logo: string = 'assets/imgs/KLR-logo.png';
  categories: any;
  firstCategories: any;
  secoundCategories: any;
  isLoggedIn: Observable<boolean> | undefined = of(false);
  isUserLoggedIn: any = this.commonService.isUserLoggedIn;
  selectedCategory = 0;
  electornicsSubCategories: any;
  gamesSubCategories: any;
  accessoriesSubCateogires: any;
  addToCartItems: any[] = [];
  cartItems = signal<any[]>([]);
  subTotal = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  );
  constructor(public router: Router, private authService: AuthService, private commonService: CommonService, 
    private categoryService: CategoryService,
    public cartStore: CartStore,
    public wishListStore: WishListStore,
    private productService: ProductService,
    private addToCartService: AddToCartService,
    private wishListService: WishListService,
    private subCategoryService: SubCategoryService) {
      effect(() => {
        const count = this.cartStore.count(); // 👀 dependency tracking
        this.loadAddtoCartCount(count);
      });
  }
  
  ngAfterViewInit(): void {
    const isApiToken = localStorage.getItem('ApiToken');
    this.commonService.setAuthenticated(!!isApiToken);
    this.authService.isUserLoggedIn$.subscribe((data) => {
      console.log('12345678', data)
      this.isLoggedIn = of(data);
      this.getAllCategories();
      this.loadAddtoCartCount('');
      this.loadWishListCount();
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

  loadAddtoCartCount(count: any) {
    this.addToCartService.getCartItems().subscribe((response: any) => {
      console.log("Cart items loaded in header", response);
      this.getProductsByIds(response);
      const itemCount = response.data.reduce((acc: number, item: any) => acc + item.quantity, 0);
      this.cartStore.set(itemCount);
    });
  }
  loadWishListCount() {
    this.wishListService.getWishList().subscribe((response: any) => {
      console.log("Wishlist items loaded in header", response);
      this.wishListStore.set(response.total);
    });
  }

  getAllCategories() {
    this.categoryService.getAll().subscribe((response: any) => {
        this.categories = response.data;
        this.firstCategories = response.data.slice(0, response.data.length/2);
        this.secoundCategories = response.data.slice(response.data.length/2, response.data.length);
        this.categories.map((category: any) => {
          if (category.Name === "Electronics") {
            this.selectedCategory = category.Id;
            this.subCategoryService.getSubCategoriesByCategoryId(this.selectedCategory).subscribe((subCatergory) => {
              console.log(subCatergory);
              this.electornicsSubCategories = subCatergory;
            })
          } else if (category.Name === "Games") {
            this.selectedCategory = category.Id;
            this.subCategoryService.getSubCategoriesByCategoryId(this.selectedCategory).subscribe((subCatergory) => {
              console.log(subCatergory);
              this.gamesSubCategories = subCatergory;
            })
          } else if (category.Name === "Accessories") {
            this.selectedCategory = category.Id;
            this.subCategoryService.getSubCategoriesByCategoryId(this.selectedCategory).subscribe((subCatergory) => {
              console.log(subCatergory);
              this.accessoriesSubCateogires = subCatergory;
            })
          }
        })
        setTimeout(() => {
          this.sidebarSearch();
          this.mobileHeaderActive();
          this.loadJqueryScript();
        }, 0);
    });
  }

  navigateToCompare() {
    this.router.navigate(['product/compare']);
  }

  navigateToCheckout() {
    this.router.navigate(['product/checkout']);
  }

  navigateToAddToCart() {
    this.router.navigate(['product/add-to-cart']);
  }

  navigateToWishList() {
    this.router.navigate(['product/wish-list']);
  }

  navigateTo(subCategory: any) {
    console.log(subCategory);
    this.router.navigate(['product/list'],{
      queryParams: subCategory,
    })
  }

  loadJqueryScript() {

    /*---------------------
      Select active
    --------------------- */
    if ($(".select-active")) {
      $(".select-active").select2();
    }
    // console.log('deviceInfo', this.deviceInfo);
    /*--- categories-button-active-2 ----*/
    $(".categories-button-active-2").on("click", function (e: { preventDefault: () => void; }) {
      e.preventDefault();
      $(".categori-dropdown-active-small").slideToggle(900);
    });

    /*----------------------------
        Category toggle function
    ------------------------------*/
    var searchToggle = $(".categories-button-active");
    searchToggle.on("click",  (e: any) => {
        e.preventDefault();
        if ($(e.currentTarget).hasClass("open")) {
          $(e.currentTarget).removeClass("open");
          $(e.currentTarget).siblings(".categories-dropdown-active-large").removeClass("open");
        } else {
          $(e.currentTarget).addClass("open");
          $(e.currentTarget).siblings(".categories-dropdown-active-large").addClass("open");
        }
    });

    /*---------------------
    Mobile menu active
    ------------------------ */
    var $offCanvasNav = $(".mobile-menu"),
    $offCanvasNavSubMenu = $offCanvasNav.find(".dropdown");

    /*Add Toggle Button With Off Canvas Sub Menu*/
    $offCanvasNavSubMenu.parent().prepend('<span class="menu-expand"><i class="fi-rs-angle-small-down"></i></span>');

    /*Close Off Canvas Sub Menu*/
    $offCanvasNavSubMenu.slideUp();

    /*Category Sub Menu Toggle*/
    $offCanvasNav.on("click", "li a, li .menu-expand", (e: any) => {
      var $this = $(e.currentTarget);
      if (
        $this
          .parent()
          .attr("class")
          .match(/\b(menu-item-has-children|has-children|has-sub-menu)\b/) &&
        ($this.attr("href") === "#" || $this.hasClass("menu-expand"))
      ) {
        e.preventDefault();
        if ($this.siblings("ul:visible").length) {
          $this.parent("li").removeClass("active");
          $this.siblings("ul").slideUp();
        } else {
          $this.parent("li").addClass("active");
          $this.closest("li").siblings("li").removeClass("active").find("li").removeClass("active");
          $this.closest("li").siblings("li").find("ul:visible").slideUp();
          $this.siblings("ul").slideDown();
        }
      }
    });
      /*-----More Menu Open----*/
      $(".more_slide_open").slideUp();
      $(".more_categories").on("click", function (e: any) {
        e.preventDefault();
        $(e.currentTarget).toggleClass("show");
        $(".more_slide_open").slideToggle();
      });
  
      /*-----Modal----*/
  }

  /*====== SidebarSearch ======*/
  sidebarSearch() {
    var searchTrigger = $(".search-active"),
      endTriggersearch = $(".search-close"),
      container = $(".main-search-active");
    searchTrigger.on("click", function (e: { preventDefault: () => void; }) {
      e.preventDefault();
      container.addClass("search-visible");
    });
    endTriggersearch.on("click", function () {
      container.removeClass("search-visible");
    });
  }

  /*====== Sidebar menu Active ======*/
  mobileHeaderActive() {
    var navbarTrigger = $(".burger-icon"),
      endTrigger = $(".mobile-menu-close"),
      container = $(".mobile-header-active"),
      wrapper4 = $("body");

    wrapper4.prepend('<div class="body-overlay-1"></div>');

    navbarTrigger.on("click", function (e: { preventDefault: () => void; }) {
      e.preventDefault();
      container.addClass("sidebar-visible");
      wrapper4.addClass("mobile-menu-active");
    });

    endTrigger.on("click", function () {
      container.removeClass("sidebar-visible");
      wrapper4.removeClass("mobile-menu-active");
    });

    $(".body-overlay-1").on("click", function () {
      container.removeClass("sidebar-visible");
      wrapper4.removeClass("mobile-menu-active");
    });
  }

  signIn() {
    console.log('signIn');
    this.router.navigate(['login']);
  }

  signout() {
    console.log('signout');
    this.authService.setAuthenticated(false);
    this.router.navigate(['login']);
  }

  profile() {
    this.router.navigate(['profile']);
  }

}

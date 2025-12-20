import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../../../app/auth/services/auth/auth.service';
import { CommonService } from '../../services/common/common.service';
import { CategoryService } from 'src/app/categories/services/category.service';
import { SubCategoryService } from 'src/app/categories/services/sub-category.service';
declare let $: any;

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements AfterViewInit {
  categories: any;
  firstCategories: any;
  secoundCategories: any;
  isLoggedIn: Observable<boolean> | undefined = of(false);
  isUserLoggedIn: any = this.commonService.isUserLoggedIn;
  selectedCategory = 0;
  electornicsSubCategories: any;
  gamesSubCategories: any;
  accessoriesSubCateogires: any;
  constructor(public router: Router, private authService: AuthService, private commonService: CommonService, 
    private categoryService: CategoryService,
    private subCategoryService: SubCategoryService) { }

  ngAfterViewInit(): void {
    this.authService.isUserLoggedIn$.subscribe((data) => {
      console.log('12345678', data)
      this.isLoggedIn = of(data);
      this.getAllCategories();
    });
  }

  getAllCategories() {
    this.categoryService.getAll().subscribe((response: any) => {
        console.log(response.data)
        this.categories = response.data;
        this.firstCategories = response.data.slice(0, response.data.length/2);
        this.secoundCategories = response.data.slice(response.data.length/2, response.data.length);
        this.categories.map((category: any) => {
          console.log(category);
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

  navigateTo(subCategory: any) {
    console.log(subCategory);
    this.router.navigate(['product/list'],{
      queryParams: subCategory,
    })
  }

  loadJqueryScript() {
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

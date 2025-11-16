import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../../../app/auth/services/auth/auth.service';
import { CommonService } from '../../services/common/common.service';
declare let $: any;

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements AfterViewInit {

  isLoggedIn: Observable<boolean> | undefined = of(false);
  isUserLoggedIn: any = this.commonService.isUserLoggedIn;
  constructor(public router: Router, private authService: AuthService, private commonService: CommonService) { }

  ngAfterViewInit(): void {
    this.authService.isUserLoggedIn$.subscribe((data) => {
      console.log('12345678', data)
      this.isLoggedIn = of(data);
    });
    this.sidebarSearch();
    this.mobileHeaderActive();
    this.loadJqueryScript();
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

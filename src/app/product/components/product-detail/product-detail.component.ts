import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common/common.service';
declare let $: any;

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, AfterViewInit {

  constructor(private commonService: CommonService) { }

  ngOnInit(): void {
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

import { Component, OnInit } from '@angular/core';
declare let $: any;

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss'],
    standalone: false
})
export class ProductListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
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
      $cartWrap.on("click", ".sort-by-product-wrap", (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        var $this = $(this);
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

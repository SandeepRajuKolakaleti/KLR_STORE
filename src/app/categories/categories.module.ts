import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesRoutingModule } from './categories-routing.module';
import { SharedModule } from '../shared/shared.module';
import { CategoryService } from './services/category.service';
import { SubCategoryService } from './services/sub-category.service';
import { ChildCategoryService } from './services/child-category.service';
import { BrandsService } from './services/brands.service';

let modules = [
  CommonModule,
  CategoriesRoutingModule,
]

@NgModule({
  declarations: [
  ],
  imports: modules,
  exports: modules,
  providers: [CategoryService, SubCategoryService, ChildCategoryService, BrandsService]
})
export class CategoriesModule { }

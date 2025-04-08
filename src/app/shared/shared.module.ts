import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material/material.module';
import { TranslateLanguageModule } from './services/translate-language/translate-language.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonBaseComponent } from './components/common-base/common-base.component';
const declarations: any[] | Type<any> = [CommonBaseComponent];
const modules = [
  CommonModule,
  HttpClientModule,
  MaterialModule,
  TranslateLanguageModule,
  TranslateModule, 
  FormsModule,
  ReactiveFormsModule,
  RouterModule
];
@NgModule({
  declarations: declarations,
  imports: [modules],
  exports: [modules, declarations],
  providers: []
})
export class SharedModule { }

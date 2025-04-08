import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }, {
    path: '',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  }, {
		path: 'dashboard',
		loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
	}, {
    path: 'product',
		loadChildren: () => import('./product/product.module').then(m => m.ProductModule),
    canActivate: [AuthGuard]
  }, {
    path: 'order',
		loadChildren: () => import('./order/order.module').then(m => m.OrderModule),
    canActivate: [AuthGuard]
  }, {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

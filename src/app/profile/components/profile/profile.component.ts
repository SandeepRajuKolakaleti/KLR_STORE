import { Component, ViewChild } from '@angular/core';
import { Route, Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../../../../app/auth/services/auth/auth.service';
import { StorageService } from '../../../../app/shared/services/storage/storage.service';
import { OrdersService } from '../../../../app/product/services/orders/orders.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: false,
    animations: [
      trigger('fadeInOut', [
        state('in', style({ opacity: 1 })),
        state('out', style({ opacity: 0 })),
        transition('out => in', [animate('1s ease-in')]),
        transition('in => out', [animate('1s ease-out')])
      ])
    ]
})
export class ProfileComponent {
  totalProducts: number = 0;
  displayedColumns = ['orderId', 'date', 'status', 'total', 'transactionId'];
  profile: any;
  ELEMENT_DATA = [];
  dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
  selectedIndex = 0;
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  };
  offset: number = 0;
  limit: number = 10;

  constructor(private router: Router, private authService: AuthService, private storageService: StorageService, private ordersService: OrdersService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getUserInformation();
    this.loadUserOrders(this.offset, this.limit);
  }
  logout() {
    this.authService.setAuthenticated(false);
    this.router.navigate(['/login'])
  }

  onTabChange(event: any) {
    this.selectedIndex = event.index;
  }
  getUserInformation() {
    const accessToken = this.storageService.get('ApiToken');
    this.authService.getUserInformation(accessToken.id).subscribe((response)=> {
      console.log(response);
      this.profile = response;
    }, (error) => {
      console.log(error);
    });
  }
  loadUserOrders(offset: number, limit: number) {
    this.ordersService.getUserOrders(offset, limit).subscribe((response: any) => {
      console.log(response);
      this.totalProducts = response.total;
      this.dataSource = new MatTableDataSource<any>(response.data);
      this.dataSource.paginator = this.matPaginator;
    });
  }

  //  delete(element: any, event: any) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   console.log(element);
  //   this.ordersService.delete(element.Id).subscribe((data) => {
  //     if (data) {
  //       this.loadUserOrders(this.offset, this.limit);
  //       this.snackBar.open('order deleted successfully!', 'Close', {
  //         duration: 3000,
  //         panelClass: ['snackbar-success']
  //       });
  //     }
  //   });
  // }

  pageChanged(event: any) {
    this.limit = event.pageSize;
    this.offset = event.pageIndex * event.pageSize;
    this.loadUserOrders(this.offset, this.limit);
  }
}

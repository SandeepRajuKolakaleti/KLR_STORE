import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from 'src/app/auth/services/auth/auth.service';
import { StorageService } from 'src/app/shared/services/storage/storage.service';

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
  displayedColumns = ['position', 'name', 'weight', 'symbol'];
  profile: any;
  ELEMENT_DATA = [
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
    {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
    {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'}
  ];
  dataSource = this.ELEMENT_DATA;
  selectedIndex = 0;

  constructor(private router: Router, private authService: AuthService, private storageService: StorageService) {}

  ngOnInit() {
    this.getUserInformation();
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
}

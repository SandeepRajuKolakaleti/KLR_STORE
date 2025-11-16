import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/services/auth/auth.service';
import { AppConstants } from './app.constants';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'store';
  isUserLoggedIn: any;
  loggedIn =  AppConstants.user.loggedIn;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isUserLoggedIn;
  }
}

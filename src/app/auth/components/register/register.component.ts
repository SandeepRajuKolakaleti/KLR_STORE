import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { AppConstants } from 'src/app/app.constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TranslateConfigService } from 'src/app/shared/services/translate/translate-config.service';
import { CommonBaseComponent } from 'src/app/shared/components/common-base/common-base.component';
import { StorageService } from 'src/app/shared/services/storage/storage.service';
declare let google: any;
@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    standalone: false
})
export class RegisterComponent extends CommonBaseComponent implements OnInit, AfterViewInit {
  registerForm!: FormGroup;
  constructor(private formBuilder: FormBuilder, 
      private authService: AuthService,
      private route: Router,
      private snackBar: MatSnackBar,
      protected override translateService: TranslateService,
      protected override translateConfigService: TranslateConfigService,
      protected override storageService: StorageService
    ) { 
        super(translateConfigService, translateService, storageService);
        super.ngOnInit();
      }

  override ngOnInit(): void {
    this.createFormBuilder();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
          client_id: '600135194254-7te37b3mbihu09bo4n8o7mevn9ujtudu.apps.googleusercontent.com', // aws access id - 600135194254-pahtdj84mjp1c9b12tb323pu1b4862kq.apps.googleusercontent.com
          callback: (response: any) => {
            console.log(response);
            this.handleGoogleLoginResponse(response)
          }
        });
        google.accounts.id.renderButton(
          document.getElementById("google-btn"),
          { theme: 'filled_blue',
            size: 'large',
            shape: 'rectangle',
            width: 250 
          });
      } else {
        console.error("Google Sign-In library not loaded.");
      }
    }, 1000);
  }

  decodeToken(token: string) {
    return JSON.parse(atob(token.split(".")[1]));
  }

  handleGoogleLoginResponse(response: any) {
    if (response) {
      let payload = this.decodeToken(response.credential);
      this.storageService.set('userGoogleData', payload);
      // send the data to API
      this.authService.setAuthenticated(true);
      this.route.navigateByUrl("dashboard");
    }
  }

  createFormBuilder() {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phonenumber: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  login() {
    this.route.navigate(['login']);
  }

  submit() {
    console.log(this.registerForm.value);
    if (this.registerForm.controls['password'].value !== this.registerForm.controls['confirmPassword'].value) {
      this.snackBar.open(this.translateService.instant('PASSWORDNOTMATCH'), this.translateService.instant('CLOSE'), AppConstants.SNACK_BAR_DELAY);
      return;
    }
    const options = {
      name: this.registerForm.controls['name'].value,
			email: this.registerForm.controls['email'].value,
			phonenumber: this.registerForm.controls['phonenumber'].value,
			password: this.registerForm.controls['password'].value,
      userRole: 'user',
      permissionId: ''
		}
    this.authService.registerApi(options).subscribe((response) => {
      // console.log('****** response: ', response);
      this.route.navigate(['login']);
    }, (error) => {
      console.log('******error_loginCrApi******', error);
      this.snackBar.open(this.translateService.instant('INVALIDDETAILS'), this.translateService.instant('CLOSE'), AppConstants.SNACK_BAR_DELAY);
    });
  }

}

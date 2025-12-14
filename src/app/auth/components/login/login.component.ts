import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth/auth.service';
import { StorageService } from '../../../shared/services/storage/storage.service';
import { AppConstants } from '../../../app.constants';
import { CommonService } from '../../../shared/services/common/common.service';
import { TranslateConfigService } from '../../../shared/services/translate/translate-config.service';
import { CommonBaseComponent } from 'src/app/shared/components/common-base/common-base.component';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent extends CommonBaseComponent implements OnInit {
  showSpinner: boolean = false;
	hide = true;
	isUsernameFocused = false;
	isPasswordFocused = false;
	loginForm!: FormGroup ;
  constructor(protected override storageService: StorageService, 
    private route: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder,
		private snackBar: MatSnackBar,
		private dialogRef: MatDialog,
		protected override translateService: TranslateService,
		protected override translateConfigService: TranslateConfigService,
		private commonService: CommonService,) { 
			super(translateConfigService, translateService, storageService);
        	super.ngOnInit();
		}

  override ngOnInit(): void {
    this.dialogRef.closeAll();
	this.loginForm = this.formBuilder.group({
		email: ['', Validators.required],
		// phonenumber: ['', Validators.required],
		password: ['', Validators.required],
	});
	this.commonService.removeLocalStorageValues();
	let data = this.storageService.get('UserData');
	if (data) {
		this.loginForm.controls['email'].setValue(data.email);
		// this.loginForm.controls['phonenumber'].setValue(data.phonenumber);
		this.loginForm.controls['password'].setValue(data.password);
	}
  }

  login() {
    console.log('login submit');
    this.showSpinner = true;
	if(this.loginForm.controls['email'].value !== '' && this.loginForm.controls['password'].value !== '') {
		const options = {
			email: this.loginForm.controls['email'].value,
			// phonenumber: this.loginForm.controls['phonenumber'].value,
			password: this.loginForm.controls['password'].value
		}
		this.authService.loginApiToken(options).subscribe((response) => {
			// console.log('****** response: ', response);
			this.showSpinner = true;
			this.storageService.set('loggedIn', true);
			this.storageService.set('ApiToken', response);
			this.storageService.set('ApiSession', response.access_token_local);
			if (this.commonService.isMobileOrTabletView()) {
				this.storageService.set('UserData', options);
			}
			this.route.navigate(['dashboard']);
			this.authService.setAuthenticated(true);
		}, (error) => {
			console.log('******error_loginCrApi******', error);
			this.authService.setAuthenticated(false);
			this.showSpinner = false;
			this.snackBar.open(this.translateService.instant('INVALIDCREDENTIALS'), this.translateService.instant('CLOSE'), AppConstants.SNACK_BAR_DELAY);
		});
	} else {
		this.authService.setAuthenticated(false);
		this.snackBar.open(this.translateService.instant('USERNAMEPASSWORDINVALIDMESSAGE'), this.translateService.instant('CLOSE'), AppConstants.SNACK_BAR_DELAY);
		this.showSpinner = false;
	}
  }

  register() {
    this.route.navigate(['/register']);
  }

  forgot() {
	this.route.navigate(['/forgot-password']);
  }

}

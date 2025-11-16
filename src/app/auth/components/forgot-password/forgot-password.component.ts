import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonBaseComponent } from '../../../shared/components/common-base/common-base.component';
import { StorageService } from '../../../shared/services/storage/storage.service';
import { TranslateConfigService } from '../../../shared/services/translate/translate-config.service';
import { AuthService } from '../../services/auth/auth.service';
import { AppConstants } from '../../../app.constants';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    standalone: false
})
export class ForgotPasswordComponent extends CommonBaseComponent implements OnInit {
  forgotForm!: FormGroup;
  constructor(private formBuilder: FormBuilder, 
        private authService: AuthService,
        private route: Router,
        private snackBar: MatSnackBar,
        protected override translateService: TranslateService,
        protected override translateConfigService: TranslateConfigService,
        protected override storageService: StorageService) {
          super(translateConfigService, translateService, storageService);
          super.ngOnInit();
        }
  override ngOnInit(): void {
    this.createFormBuilder();
  }

  createFormBuilder() {
    this.forgotForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  login() {
    this.route.navigate(['login']);
  }

  submit() {
    console.log(this.forgotForm.value);
    if (this.forgotForm.controls['password'].value !== this.forgotForm.controls['confirmPassword'].value) {
      this.snackBar.open(this.translateService.instant('PASSWORDNOTMATCH'), this.translateService.instant('CLOSE'), AppConstants.SNACK_BAR_DELAY);
      return;
    }
    const options = {
      email: this.forgotForm.controls['email'].value,
      password: this.forgotForm.controls['password'].value
    }
    this.authService.resetPassword(options).subscribe((response) => {
      // console.log('****** response: ', response);
      this.route.navigate(['login']);
    }, (error) => {
      console.log('******error_loginCrApi******', error);
      this.snackBar.open(this.translateService.instant('INVALIDDETAILS'), this.translateService.instant('CLOSE'), AppConstants.SNACK_BAR_DELAY);
    });
  }
}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthenticationService} from "../service/authentication.service";
import {NotificationService} from "../service/notification.service";
import {User} from "../model/user";
import {Subscription} from "rxjs";
import {HttpErrorResponse, HttpResponse} from "@angular/common/http";
import {NotificationType} from "../enum/notification-type.enum";
import {HeaderType} from "../enum/header-type.enum";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  public showLoading!: boolean;
  private subscriptions : Subscription[] = [];

  constructor(private router: Router, private authenticationService : AuthenticationService, private notificationService : NotificationService) { }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()){
      this.router.navigateByUrl('/user/management');
    }else {
      this.router.navigateByUrl('/login');
    }
  }
  public onLogin(user: User): void {
    console.log(user);
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.login(user).subscribe(
        (response: HttpResponse<User>) => {
          const token = response.headers.get(HeaderType.JWT_TOKEN);
         // if (typeof token === "string") {
          if (token != null) {
            this.authenticationService.saveToken(token);
          }
         // }
        //  if (response.body instanceof User) {
            // @ts-ignore
          this.authenticationService.addUserToLocalCache(response.body);
          //}
          this.router.navigateByUrl('/user/management');
          this.showLoading = false;

        },
        (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse);
          this.sendErrorNotification(NotificationType.ERROR, errorResponse.error.message);
          this.showLoading = false;
        }
      )
    );
  }

  private sendErrorNotification(notificationType: NotificationType, message : string) {
    if(message){
      this.notificationService.notify(notificationType,message);

    }else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.')
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

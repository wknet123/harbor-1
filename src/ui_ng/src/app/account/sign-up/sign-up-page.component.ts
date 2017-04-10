import { Component, Output, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { NewUserFormComponent } from '../../shared/new-user-form/new-user-form.component';
import { User } from '../../user/user';

import { UserService } from '../../user/user.service';
import { errorHandler } from '../../shared/shared.utils';
import { AlertType } from '../../shared/shared.const';

import { MessageService } from '../../global-message/message.service';

@Component({
    selector: 'sign-up-page',
    templateUrl: "sign-up-page.component.html"
})
export class SignUpPageComponent implements OnInit {
    error: any;
    onGoing: boolean = false;
    formValueChanged: boolean = false;

    constructor(
        private userService: UserService,
        private msgService: MessageService,
        private router: Router) { }

    @ViewChild(NewUserFormComponent)
    newUserForm: NewUserFormComponent;

    getNewUser(): User {
        return this.newUserForm.getData();
    }

    public get inProgress(): boolean {
        return this.onGoing;
    }

    public get isValid(): boolean {
        return this.newUserForm.isValid && this.error == null;
    }

    public get canBeCancelled(): boolean {
        return this.formValueChanged && this.newUserForm && !this.newUserForm.isEmpty();
    }

    ngOnInit(): void {
        this.newUserForm.reset();//Reset form
        this.formValueChanged = false;
    }

    formValueChange(flag: boolean): void {
        if (flag) {
            this.formValueChanged = true;
        }
        if (this.error != null) {
            this.error = null;//clear error
        }
    }

    cancel(): void {
        if (this.newUserForm) {
            this.newUserForm.reset();
        }
    }

    //Create new user
    create(): void {
        //Double confirm everything is ok
        //Form is valid
        if (!this.isValid) {
            return;
        }

        //We have new user data
        let u = this.getNewUser();
        if (!u) {
            return;
        }

        //Start process
        this.onGoing = true;

        this.userService.addUser(u)
            .then(() => {
                this.onGoing = false;
                this.msgService.announceMessage(200, "", AlertType.SUCCESS);
                //Navigate to embeded sign-in
                this.router.navigate(['harbor', 'sign-in']);
            })
            .catch(error => {
                this.onGoing = false;
                this.error = error
                this.msgService.announceMessage(error.status | 500, "", AlertType.WARNING);
            });
    }
}
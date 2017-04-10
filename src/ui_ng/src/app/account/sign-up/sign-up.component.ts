import { Component, Output, ViewChild, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NewUserFormComponent } from '../../shared/new-user-form/new-user-form.component';
import { User } from '../../user/user';

import { SessionService } from '../../shared/session.service';
import { UserService } from '../../user/user.service';
import { InlineAlertComponent } from '../../shared/inline-alert/inline-alert.component';

import { Modal } from 'clarity-angular';

@Component({
    selector: 'sign-up',
    templateUrl: "sign-up.component.html"
})
export class SignUpComponent {
    opened: boolean = false;
    staticBackdrop: boolean = true;
    error: any;
    onGoing: boolean = false;
    formValueChanged: boolean = false;

    @Output() userCreation = new EventEmitter<User>();

    constructor(
        private session: SessionService,
        private userService: UserService) { }

    @ViewChild(NewUserFormComponent)
    newUserForm: NewUserFormComponent;

    @ViewChild(InlineAlertComponent)
    inlienAlert: InlineAlertComponent;

    @ViewChild(Modal)
    modal: Modal;

    getNewUser(): User {
        return this.newUserForm.getData();
    }

    public get inProgress(): boolean {
        return this.onGoing;
    }

    public get isValid(): boolean {
        return this.newUserForm.isValid && this.error == null;
    }

    formValueChange(flag: boolean): void {
        if (flag) {
            this.formValueChanged = true;
        }
        if (this.error != null) {
            this.error = null;//clear error
        }
        this.inlienAlert.close();//Close alert if being shown
    }

    open(): void {
        //Reset state
        this.newUserForm.reset();
        this.formValueChanged = false;
        this.error = null;
        this.onGoing = false;
        this.inlienAlert.close();

        this.modal.open();
    }

    close(): void {
        if (this.formValueChanged) {
            if (this.newUserForm.isEmpty()) {
                this.opened = false;
            } else {
                //Need user confirmation
                this.inlienAlert.showInlineConfirmation({
                    message: "ALERT.FORM_CHANGE_CONFIRMATION"
                });
            }
        } else {
            this.opened = false;
        }
    }

    confirmCancel($event: any): void {
        this.opened = false;
        this.modal.close();
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
                this.opened = false;
                this.modal.close();
                this.userCreation.emit(u);
            })
            .catch(error => {
                this.onGoing = false;
                this.error = error;
                this.inlienAlert.showInlineError(error);
            });
    }
}
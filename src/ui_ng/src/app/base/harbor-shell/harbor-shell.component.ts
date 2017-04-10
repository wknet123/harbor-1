import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ModalEvent } from '../modal-event';
import { modalEvents } from '../modal-events.const';

import { AccountSettingsModalComponent } from '../../account/account-settings/account-settings-modal.component';
import { PasswordSettingComponent } from '../../account/password/password-setting.component';
import { NavigatorComponent } from '../navigator/navigator.component';
import { SessionService } from '../../shared/session.service';

import { AboutDialogComponent } from '../../shared/about-dialog/about-dialog.component';

import { SearchTriggerService } from '../global-search/search-trigger.service';

import { Subscription } from 'rxjs/Subscription';

import { CommonRoutes } from '../../shared/shared.const';

@Component({
    selector: 'harbor-shell',
    templateUrl: 'harbor-shell.component.html',
    styleUrls: ["harbor-shell.component.css"]
})

export class HarborShellComponent implements OnInit, OnDestroy {

    @ViewChild(AccountSettingsModalComponent)
    accountSettingsModal: AccountSettingsModalComponent;

    @ViewChild(PasswordSettingComponent)
    pwdSetting: PasswordSettingComponent;

    @ViewChild(NavigatorComponent)
    navigator: NavigatorComponent;

    @ViewChild(AboutDialogComponent)
    aboutDialog: AboutDialogComponent;

    //To indicator whwther or not the search results page is displayed
    //We need to use this property to do some overriding work
    isSearchResultsOpened: boolean = false;

    searchSub: Subscription;
    searchCloseSub: Subscription;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private session: SessionService,
        private searchTrigger: SearchTriggerService) { }

    ngOnInit() {
        this.searchSub = this.searchTrigger.searchTriggerChan$.subscribe(searchEvt => {
            if(searchEvt && searchEvt.trim() != ""){
                this.isSearchResultsOpened = true;
            }
        });

        this.searchCloseSub = this.searchTrigger.searchCloseChan$.subscribe(close => {
           this.isSearchResultsOpened = false;
        });
    }

    ngOnDestroy(): void {
        if (this.searchSub) {
            this.searchSub.unsubscribe();
        }

        if (this.searchCloseSub) {
            this.searchCloseSub.unsubscribe();
        }
    }

    public get shouldOverrideContent(): boolean {
        return this.router.routerState.snapshot.url.toString().startsWith(CommonRoutes.EMBEDDED_SIGN_IN);
    }

    public get showSearch(): boolean {
        return this.isSearchResultsOpened;
    }

    public get isSystemAdmin(): boolean {
        let account = this.session.getCurrentUser();
        return account != null && account.has_admin_role > 0;
    }

    public get isUserExisting(): boolean {
        let account = this.session.getCurrentUser();
        return account != null;
    }

    //Open modal dialog
    openModal(event: ModalEvent): void {
        switch (event.modalName) {
            case modalEvents.USER_PROFILE:
                this.accountSettingsModal.open();
                break;
            case modalEvents.CHANGE_PWD:
                this.pwdSetting.open();
                break;
            case modalEvents.ABOUT:
                this.aboutDialog.open();
                break;
            default:
                break;
        }
    }
}
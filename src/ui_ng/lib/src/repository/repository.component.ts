// Copyright (c) 2017 VMware, Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RepositoryService } from '../service/repository.service';
import { Repository } from '../service/interface';

import { ErrorHandler } from '../error-handler/error-handler';
import { ConfirmationState, ConfirmationTargets, ConfirmationButtons } from '../shared/shared.const';

import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ConfirmationMessage } from '../confirmation-dialog/confirmation-message';
import { ConfirmationAcknowledgement } from '../confirmation-dialog/confirmation-state-message';
import { Subscription } from 'rxjs/Subscription';

import { State } from 'clarity-angular';

import { toPromise } from '../utils';

import { REPOSITORY_TEMPLATE } from './repository.component.html';
import { REPOSITORY_STYLE } from './repository.component.css';

@Component({
  selector: 'hbr-repository',
  template: REPOSITORY_TEMPLATE,
  styles: [REPOSITORY_STYLE]
})
export class RepositoryComponent implements OnInit {
  changedRepositories: Repository[];

  projectId: number;

  lastFilteredRepoName: string;

  totalPage: number;
  totalRecordCount: number;

  hasProjectAdminRole: boolean;

  subscription: Subscription;

  @ViewChild('confirmationDialog')
  confirmationDialog: ConfirmationDialogComponent;

  constructor(
    private errorHandler: ErrorHandler,
    private repositoryService: RepositoryService
  ) {}

  confirmDeletion(message: ConfirmationAcknowledgement) {
    if (message &&
      message.source === ConfirmationTargets.REPOSITORY &&
      message.state === ConfirmationState.CONFIRMED) {
      let repoName = message.data;
      toPromise<number>(this.repositoryService
        .deleteRepository(repoName))
        .then(
          response => {
            this.refresh();
            this.errorHandler.error('REPOSITORY.DELETED_REPO_SUCCESS');
        }).catch(error => this.errorHandler.error(error));
    }
  }

  cancelDeletion(message: ConfirmationAcknowledgement) {
    console.log('Received message from cancelAction:' + JSON.stringify(message));
  }

  ngOnInit(): void {
    // this.projectId = this.route.snapshot.parent.params['id'];
    // let resolverData = this.route.snapshot.parent.data;
    // if(resolverData) {
    //   this.hasProjectAdminRole = (<Project>resolverData['projectResolver']).has_project_admin_role;
    // }
    this.projectId = 1; //TODO: project agnostic;
    this.hasProjectAdminRole = true; //TODO: Assume it as admin;

    this.lastFilteredRepoName = '';
    this.retrieve();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  retrieve(state?: State) {
    toPromise<Repository[]>(this.repositoryService
      .getRepositories(this.projectId, this.lastFilteredRepoName))
      .then(
        response => {
          this.changedRepositories = response;
      },
      error => this.errorHandler.error(error));
  }

  doSearchRepoNames(repoName: string) {
    this.lastFilteredRepoName = repoName;
    this.retrieve();

  }

  deleteRepo(repoName: string) {
    let message = new ConfirmationMessage(
      'REPOSITORY.DELETION_TITLE_REPO',
      'REPOSITORY.DELETION_SUMMARY_REPO',
      repoName,
      repoName,
      ConfirmationTargets.REPOSITORY,
      ConfirmationButtons.DELETE_CANCEL);
    this.confirmationDialog.open(message);
  }

  refresh() {
    this.retrieve();
  }
}
import { Component, Input, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Comparator } from 'clarity-angular';

import { REPOSITORY_STACKVIEW_TEMPLATE } from './repository-stackview.component.html';
import { REPOSITORY_STACKVIEW_STYLES } from './repository-stackview.component.css';

import { Repository } from '../service/interface';
import { ErrorHandler } from '../error-handler/error-handler';
import { RepositoryService } from '../service/repository.service';

import { toPromise, CustomComparator } from '../utils';

import { ConfirmationState, ConfirmationTargets, ConfirmationButtons } from '../shared/shared.const';

import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ConfirmationMessage } from '../confirmation-dialog/confirmation-message';
import { ConfirmationAcknowledgement } from '../confirmation-dialog/confirmation-state-message';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'hbr-repository-stackview',
  template: REPOSITORY_STACKVIEW_TEMPLATE,
  styles: [ REPOSITORY_STACKVIEW_STYLES ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepositoryStackviewComponent implements OnInit {

  @Input() projectId: number;

  @Input() hasSignedIn: boolean;
  @Input() hasProjectAdminRole: boolean;

  lastFilteredRepoName: string;
  repositories: Repository[];

  @ViewChild('confirmationDialog')
  confirmationDialog: ConfirmationDialogComponent;

  pullCountComparator: Comparator<Repository> = new CustomComparator<Repository>('pull_count', 'number');
  
  tagsCountComparator: Comparator<Repository> = new CustomComparator<Repository>('tags_count', 'number');

  constructor(
    private errorHandler: ErrorHandler,
    private translateService: TranslateService,
    private repositoryService: RepositoryService,
    private ref: ChangeDetectorRef){}
  
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
            this.translateService.get('REPOSITORY.DELETED_REPO_SUCCESS')
                .subscribe(res=>this.errorHandler.info(res));
        }).catch(error => this.errorHandler.error(error));
    }
  }

  ngOnInit(): void {
    if(!this.projectId) {
      this.errorHandler.error('Project ID cannot be unset.');
      return;
    }      
    this.lastFilteredRepoName = '';
    this.retrieve();
  }

  retrieve() {
    toPromise<Repository[]>(this.repositoryService
      .getRepositories(this.projectId, this.lastFilteredRepoName))
      .then(
        repos => this.repositories = repos,
        error => this.errorHandler.error(error));
    let hnd = setInterval(()=>this.ref.markForCheck(), 100);
    setTimeout(()=>clearInterval(hnd), 1000);
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
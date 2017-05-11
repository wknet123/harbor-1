export const LIST_REPOSITORY_TEMPLATE = `
<clr-datagrid (clrDgRefresh)="refresh($event)">
  <clr-dg-column>{{'REPOSITORY.NAME' | translate}}</clr-dg-column>
  <clr-dg-column>{{'REPOSITORY.TAGS_COUNT' | translate}}</clr-dg-column>
  <clr-dg-column>{{'REPOSITORY.PULL_COUNT' | translate}}</clr-dg-column>
  <clr-dg-row *clrDgItems="let r of repositories" [clrDgItem]='r'>
     <clr-dg-action-overflow [hidden]="!hasProjectAdminRole">
       <button class="action-item" (click)="deleteRepo(r.name)">{{'REPOSITORY.DELETE' | translate}}</button>
     </clr-dg-action-overflow>
     <clr-dg-cell><a href="javascript:void(0)" (click)="gotoLink(projectId || r.project_id, r.name || r.repository_name)">{{r.name || r.repository_name}}</a></clr-dg-cell>
     <clr-dg-cell>{{r.tags_count}}</clr-dg-cell>
     <clr-dg-cell>{{r.pull_count}}</clr-dg-cell>
  </clr-dg-row>
  <clr-dg-footer>
    {{(repositories ? repositories.length : 0)}} {{'REPOSITORY.ITEMS' | translate}}
    <clr-dg-pagination [clrDgPageSize]="15"></clr-dg-pagination>
  </clr-dg-footer>
</clr-datagrid>`;
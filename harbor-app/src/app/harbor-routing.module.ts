import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { SignInComponent } from './account/sign-in/sign-in.component';
import { HarborShellComponent } from './base/harbor-shell/harbor-shell.component';
import { ProjectComponent } from './project/project.component';
import { UserComponent } from './user/user.component';
import { ReplicationManagementComponent } from './replication/replication-management/replication-management.component';

import { TotalReplicationComponent } from './replication/total-replication/total-replication.component';
import { DestinationComponent } from './replication/destination/destination.component';

import { ProjectDetailComponent } from './project/project-detail/project-detail.component';

import { RepositoryComponent } from './repository/repository.component';
import { ReplicationComponent } from './replication/replication.component';
import { MemberComponent } from './project/member/member.component';
import { AuditLogComponent } from './log/audit-log.component';

import { BaseRoutingResolver } from './shared/route/base-routing-resolver.service';
import { ProjectRoutingResolver } from './project/project-routing-resolver.service';
import { SystemAdminGuard } from './shared/route/system-admin-activate.service';
import { SignUpComponent } from './account/sign-up/sign-up.component';
import { ResetPasswordComponent } from './account/password/reset-password.component';

const harborRoutes: Routes = [
  { path: '', redirectTo: '/harbor', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent},
  { path: 'reset_password', component: ResetPasswordComponent},
  {
    path: 'harbor',
    component: HarborShellComponent,
    resolve: {
      authResolver: BaseRoutingResolver
    },
    children: [
      {
        path: 'projects',
        component: ProjectComponent
      },
      {
        path: 'users',
        component: UserComponent,
        canActivate: [SystemAdminGuard]
      },
      {
        path: 'replications',
        component: ReplicationManagementComponent,
        canActivate: [SystemAdminGuard],
        children: [
          {
            path: 'rules',
            component: TotalReplicationComponent
          },
          {
            path: 'endpoints',
            component: DestinationComponent
          }
        ]
      },
      {
        path: 'projects/:id',
        component: ProjectDetailComponent,
        resolve: {
          projectResolver: ProjectRoutingResolver
        },
        children: [
          {
            path: 'repository',
            component: RepositoryComponent
          },
          {
            path: 'replication',
            component: ReplicationComponent
          },
          {
            path: 'member',
            component: MemberComponent
          },
          {
            path: 'log',
            component: AuditLogComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(harborRoutes)
  ],
  exports: [RouterModule]
})
export class HarborRoutingModule {

}
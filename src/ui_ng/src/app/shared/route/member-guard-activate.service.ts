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
import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild
} from '@angular/router';
import { SessionService } from '../../shared/session.service';
import { ProjectService } from '../../project/project.service';
import { CommonRoutes } from '../../shared/shared.const';

@Injectable()
export class MemberGuard implements CanActivate, CanActivateChild {
  constructor(
    private sessionService: SessionService,
    private projectService: ProjectService, 
    private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    let projectId = route.params['id'];
    this.sessionService.setProjectMembers([]);
    return new Promise((resolve, reject) => {
      if(!this.sessionService.getCurrentUser()) {
        return resolve(true);
      }
      this.projectService.checkProjectMember(projectId)
        .subscribe(
          res=>{
            this.sessionService.setProjectMembers(res);
            return resolve(true)
          },
          error => {
            //Add exception for repository in project detail router activation.
            if(state.url.endsWith('repository')) {
                return resolve(true);
            }
            this.projectService.getProject(projectId).subscribe(project=>{
              if(project.public === 1) {
                return resolve(true);
              } else {
                this.router.navigate([CommonRoutes.HARBOR_DEFAULT]);
                return resolve(false);
              }
            });
          });
    });
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    return this.canActivate(route, state);
  }
}

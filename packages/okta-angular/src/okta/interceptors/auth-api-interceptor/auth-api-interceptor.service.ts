/*
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { forwardRef, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { concatMap } from 'rxjs/operators';

import { OktaAuthService } from '../../services/okta.service';

export const AUTH_API_INTERCEPTOR: any = {
  provide: HTTP_INTERCEPTORS,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => AuthApiInterceptor),
  deps: [OktaAuthService],
  multi: true,
};

@Injectable()
export class AuthApiInterceptor implements HttpInterceptor {
  constructor(private oktaService: OktaAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return fromPromise(this.oktaService.getAccessToken()).pipe(
      concatMap(accessToken => {
        if (accessToken) {
          return next.handle(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${accessToken}`,
              },
            })
          );
        } else {
          return next.handle(req);
        }
      })
    );
  }
}

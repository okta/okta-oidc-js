import { Router } from '@angular/router';

import { OktaAuthService } from '../services/okta.service';

export type AuthRequiredFunction = (oktaAuth: OktaAuthService, router: Router) => void;

import { TestBed, async, ComponentFixture } from '@angular/core/testing';

import {
  OktaAuthService,
  OKTA_CONFIG,
  OktaLoginRedirectComponent
} from '../../src/okta-angular';

describe('OktaLoginRedirectComponent', () => {
  let component: OktaLoginRedirectComponent;
  let fixture: ComponentFixture<OktaLoginRedirectComponent>;
  let service: OktaAuthService;

  beforeEach(() => {
    const config = {
      clientId: 'foo',
      issuer: 'https://foo',
      redirectUri: 'https://foo'
    };

    TestBed.configureTestingModule({
      declarations: [
        OktaLoginRedirectComponent
      ],
      providers: [
        OktaAuthService,
        {
          provide: OKTA_CONFIG,
          useValue: config
        },
      ],
    });
    fixture = TestBed.createComponent(OktaLoginRedirectComponent);
    component = fixture.componentInstance;
    service = TestBed.get(OktaAuthService);
  });

  it('should create the component', async(() => {
    expect(component).toBeTruthy();
  }));

  it('should call loginRedirect', async(() => {
    jest.spyOn(service, 'loginRedirect').mockReturnValue(Promise.resolve());
    fixture.detectChanges();
    expect(service.loginRedirect).toHaveBeenCalled();
  }));
});

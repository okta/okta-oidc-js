import { TestBed, async, ComponentFixture } from '@angular/core/testing';

import {
  OktaAuthService,
  OKTA_CONFIG,
  OktaCallbackComponent
} from '../../src/okta-angular';

describe('OktaCallbackComponent', () => {
  let component: OktaCallbackComponent;
  let fixture: ComponentFixture<OktaCallbackComponent>;
  let service: OktaAuthService;
  let originalLocation: any;
  beforeEach(() => {
    originalLocation = window.location;
    delete window.location;
    (window.location as any) = {
      replace: jest.fn()
    };
    const config = {
      clientId: 'foo',
      issuer: 'https://foo',
      redirectUri: 'https://foo'
    };

    TestBed.configureTestingModule({
      declarations: [
        OktaCallbackComponent
      ],
      providers: [
        OktaAuthService,
        {
          provide: OKTA_CONFIG,
          useValue: config
        },
      ],
    });
    fixture = TestBed.createComponent(OktaCallbackComponent);
    component = fixture.componentInstance;
    service = TestBed.get(OktaAuthService);
  });
  afterEach(() => {
    window.location = originalLocation;
  });
  it('should create the component', async(() => {
    expect(component).toBeTruthy();
  }));

  it('should call handleAuthentication', async(() => {
    jest.spyOn(service, 'handleAuthentication').mockReturnValue(Promise.resolve());
    fixture.detectChanges();
    expect(service.handleAuthentication).toHaveBeenCalled();
  }));

  it('should call location.replace with the saved uri', async(() => {
    const uri = 'http://fakey.local';
    const fakePromise: unknown = {
      then: function(cb: Function) {
        cb();
        return {
          catch: jest.fn()
        };
      }
    };
    jest.spyOn(service, 'handleAuthentication').mockReturnValue(fakePromise as Promise<void>);
    jest.spyOn(service, 'getFromUri').mockReturnValue(uri);
    fixture.detectChanges();
    expect(service.handleAuthentication).toHaveBeenCalled();
    expect(service.getFromUri).toHaveBeenCalled();
    expect(window.location.replace).toHaveBeenCalledWith(uri);
  }));

  it('catches errors from handleAuthentication', async(() => {
    const error = new Error('test error');
    const fakePromise: unknown = {
      then: function() {
        return {
          catch: function(cb: Function) {
            cb(error);
          }
        };
      }
    };
    jest.spyOn(service, 'handleAuthentication').mockReturnValue(fakePromise as Promise<void>);
    jest.spyOn(service, 'getFromUri').mockReturnValue('');
    fixture.detectChanges();
    expect(service.handleAuthentication).toHaveBeenCalled();
    expect(service.getFromUri).not.toHaveBeenCalled();
    expect(window.location.replace).not.toHaveBeenCalled();
    expect(component.error).toBe('Error: test error');
  }));
});

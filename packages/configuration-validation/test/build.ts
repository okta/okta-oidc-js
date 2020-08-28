import {
  buildConfigObject
} from '@okta/configuration-validation';

describe('buildConfigObject', () => {

  it('can be called with no arguments', () => {
    expect(buildConfigObject()).toEqual({});
  });

  it('pass-through: empty config', () => {
    const passedConfig = {};
    expect(buildConfigObject(passedConfig)).toEqual(passedConfig);
  });

  it('pass-through: leaves config object unchanged when all parameters are passed in preferred format', () => {
    const passedConfig = {
      clientId: '{clientId}',
      issuer: '{issuer}',
      redirectUri: '{redirectUri}',
      responseType: '{responseType}',
      scopes: ['a', 'b', 'c'],
      tokenManager: {
        storage: '{storage}',
        autoRenew: false,
        secure: true,
      }
    };

    expect(buildConfigObject(passedConfig)).toEqual(passedConfig);
  });

  it('does not allow "autoRenew: false" to be overridden by undefined "auto_renew"', () => { 
    const passedConfig = {
      autoRenew: false,
    };

    expect(buildConfigObject(passedConfig)).toEqual({
      autoRenew: false,
      tokenManager: { 
        autoRenew: false
      },
    });
  });


  it('pass-through: Allows passing extra config properties at top-level', () => {
    function f() {}
    const passedConfig = {
      onAuthComplete: f
    }

    expect(buildConfigObject(passedConfig as any)).toEqual(passedConfig);
  });

  it('pass-through: tokenManager section', () => {
    const passedConfig = {
      tokenManager: {
        blar: 'foo',
        storage: 'a',
        autoRenew: false,
      }
    };

    expect(buildConfigObject(passedConfig)).toEqual(passedConfig);
  });

  it('returns correct config object when parameters are passed in camelCase', () => {
    const passedConfig = {
      clientId: '{clientId}',
      redirectUri: '{redirectUri}',
      responseType: '{responseType}',
      autoRenew: false
    }

    expect(buildConfigObject(passedConfig)).toEqual({
      clientId: '{clientId}',
      redirectUri: '{redirectUri}',
      responseType: '{responseType}',
      autoRenew: false,
      tokenManager: {
        autoRenew: false
      }
    });
  });

  it('returns correct config object when parameters are passed in underscore_case', () => {
    const passedConfig = {
      client_id: '{client_id}',
      redirect_uri: '{redirect_uri}',
      response_type: '{response_type}',
      auto_renew: false
    }

    expect(buildConfigObject(passedConfig)).toEqual({
      clientId: '{client_id}',
      client_id: '{client_id}',
      redirectUri: '{redirect_uri}',
      redirect_uri: '{redirect_uri}',
      responseType: '{response_type}',
      response_type: '{response_type}',
      auto_renew: false,
      tokenManager: {
        autoRenew: false,
      }
    });
  });

  it('returns correct config object from camelCase parameters when both camelCase and underscore_case parameters are passed', () => {
    const passedConfig = {
      clientId: '{clientId}',
      client_id: '{client_id}',
      redirectUri: '{redirectUri}',
      redirect_uri: '{redirect_uri}',
      autoRenew: false,
      auto_renew: true
    }

    expect(buildConfigObject(passedConfig)).toEqual({
      clientId: '{clientId}',
      client_id: '{client_id}',
      redirectUri: '{redirectUri}',
      redirect_uri: '{redirect_uri}',
      autoRenew: false,
      auto_renew: true,
      tokenManager: {
        autoRenew: false, // used value from camel-case
      }
    });
  });

  it('tokenManager section: accepts top-level "storage" prop', () => {
    const passedConfig = {
      storage: 'foo',
    };

    expect(buildConfigObject(passedConfig)).toEqual({
      storage: 'foo',
      tokenManager: {
        storage: 'foo'
      }
    });
  });

  it('tokenManager section: will not overwrite "storage" prop if set within section', () => {
    const passedConfig = {
      storage: 'foo',
      tokenManager: {
        storage: 'bar'
      }
    };

    expect(buildConfigObject(passedConfig)).toEqual({
      storage: 'foo',
      tokenManager: {
        storage: 'bar'
      }
    });
  });

  it('tokenManager section: accepts top-level "autoRenew" prop', () => {
    const passedConfig = {
      autoRenew: true,
    };

    expect(buildConfigObject(passedConfig)).toEqual({
      autoRenew: true,
      tokenManager: {
        autoRenew: true,
      }
    });
  });

  it('tokenManager section: will not overwrite "autoRenew" prop if set within section', () => {
    const passedConfig = {
      autoRenew: true,
      tokenManager: {
        autoRenew: false,
      }
    };

    expect(buildConfigObject(passedConfig)).toEqual({
      autoRenew: true,
      tokenManager: {
        autoRenew: false,
      }
    });
  });

  it('tokenManager section: Allows passing extra config to tokenManager + top-level props', () => {
    const passedConfig = {
      storage: '{storage}',
      autoRenew: false,
      tokenManager: {
        secure: true
      }
    }

    expect(buildConfigObject(passedConfig)).toEqual({
      storage: '{storage}',
      autoRenew: false,
      tokenManager: {
        storage: '{storage}',
        autoRenew: false,
        secure: true
      }
    });
  });

  it('Converts "scope" (string) to "scopes" (array)', () => {
    const scope = 'a b c';
    const passedConfig = {
      scope
    };

    expect(buildConfigObject(passedConfig)).toEqual({
      scopes: ['a', 'b', 'c'],
      scope,
    });
  });

  it('Converts "scope" (string) to "scopes" (array) (multiple spaces)', () => {
    const scope = 'a  b  c';
    const passedConfig = {
      scope
    };

    expect(buildConfigObject(passedConfig)).toEqual({
      scopes: ['a', 'b', 'c'],
      scope,
    });
  });


  it('Accepts "scope" (as an array)', () => {
    const scope = ['a', 'b', 'c'];
    const passedConfig = {
      scope
    };

    expect(buildConfigObject(passedConfig)).toEqual({
      scopes: scope,
      scope,
    });
  });


  it('Accepts single "responseType" (as a string)', () => {
    const responseType = 'a';
    const passedConfig = {
      responseType
    };

    expect(buildConfigObject(passedConfig)).toEqual({
      responseType: 'a'
    });
  });

  it('Accepts multiple "responseType" (as a string) and converts to array', () => {
    const responseType = 'a b';
    const passedConfig = {
      responseType
    };

    expect(buildConfigObject(passedConfig)).toEqual({
      responseType: ['a', 'b']
    });
  });


  it('Accepts multiple "responseType" (as a string) and converts to array (multi space)', () => {
    const responseType = 'a   b   x';
    const passedConfig = {
      responseType
    };

    expect(buildConfigObject(passedConfig)).toEqual({
      responseType: ['a', 'b', 'x']
    });
  });


  it('Accepts multiple "responseType" (as an array)', () => {
    const responseType = ['a', 'b'];
    const passedConfig = {
      responseType
    };

    expect(buildConfigObject(passedConfig)).toEqual({
      responseType: ['a', 'b']
    });
  });
});

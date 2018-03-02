import TokenVerifier from '../src/token-verifier';
import * as mocks from './mocks';

describe('TokenVerifier', () => {

  describe('constructor', () => {
    it('throws an error when a jwks_uri is not provided', () => {
      expect(() => new TokenVerifier()).toThrow('Must provide a jwks_uri');
    });
  });

  describe('verify', () => {
    let context;
    beforeEach(() => {
      context = {};
      context.tokenVerifier = new TokenVerifier({
        jwks_uri: 'http://dummy_issuer/jwks'
      });
      mocks.mockFetch([mocks.requests.jwks]);
    });

    it('throws an error when the token does not have a kid', () => {
      return expect(context.tokenVerifier.verify(
        'eyJhbGciOiJIUzI1NiJ9.e30.XmNK3GpH3Ys_7wsYBfq4C3M6goz71I7dTgUkuIa5lyQ'
      ))
      .rejects.toThrow('No token header kid to verify signature');
    });
    it('throws an error when the kid is not available', () => {
      return expect(context.tokenVerifier.verify(
        'eyJraWQiOiJkdW1teSIsImFsZyI6IkhTMjU2In0.e30.uaNtTuciiJDzY2ATA-E5L8tYWGRut1uHsHVWD1szNMM'
      ))
      .rejects.toThrow('No key available with an id of dummy');
    });
    it('throws an error on an invalid token', () => {
      return expect(context.tokenVerifier.verify(
        'eyJraWQiOiJVNVI4Y0hiR3c0NDVRYnE4elZPMVBjQ3BYTDh5RzZJY292VmEzbGFDb3hNIiwiYWxnIjoiUlMyNTYiLCJ0eXAiOiJKV1QifQ.eyJhIjoiYiJ9.ljX5UtZtXL1srg0Edefpxoi55u8d9Uxh_rpAuAL8MlTpUplyF2E_Ofb2170_baB9rmAUfbomUqAp0ltRvi7OcKE1_mvtFauSvng51tu26i2LaoyACWG5x7kMbkTd4AbiXuifHf2p4ThDxqsRvEyjN6pOwlrJIM1FpTal85M3XSA'
      ))
      .rejects.toThrow(/Unable to verify token:/);
    });
    it('verifies a valid token', async () => {
      expect(await context.tokenVerifier.verify(
        'eyJraWQiOiJVNVI4Y0hiR3c0NDVRYnE4elZPMVBjQ3BYTDh5RzZJY292VmEzbGFDb3hNIiwiYWxnIjoiUlMyNTYiLCJ0eXAiOiJKV1QifQ.eyJyZWFsIjoiY29udGVudCJ9.SA5fET44QbmTjSfL3H-XHQJVPKGcU93qhJIhGzxMP7Jm5dko6Z-G5bhNGUHorFREAlhGzuo4WwcmIlfW7gyTzFiMaw_az6FWxF-HyKbe9AeEjTpj4pdOgrs05BpUiO4KXEc0t8rF3A1sE-foEE2MANtcVxUVS0558begagRmf_g'
      )).toEqual({ real: 'content' });
    });
  });
});

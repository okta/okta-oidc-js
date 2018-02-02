export class Address {
  street_address: string;
  locality: string;
  region: string;
  postal_code: string;
  country: string;
}

export class UserInfo {
  sub: string;
  name: string;
  nickname: string;
  given_name: string;
  middle_name: string;
  family_name: string;
  profile: string;
  zoneinfo: string;
  locale: string;
  updated_at: number;
  email: string;
  email_verified: boolean;
  address: Address;
  phone_number: string;
}

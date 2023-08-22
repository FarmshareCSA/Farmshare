export enum UserRole {
  None,
  User,
  Donor,
  Manager,
  Farmer,
  Admin,
}

export type Community = {
  uid: string;
  name: string;
  description: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  websiteURL: string;
  imageURL: string;
};

export type UserRegistration = {
  uid: string;
  account: string;
  name: string;
  emailHash: string;
  location: string;
  role: UserRole;
};

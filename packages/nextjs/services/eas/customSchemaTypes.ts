export enum UserRole {
  None,
  User,
  Donor,
  Manager,
  Farmer,
  Admin,
}

export type UserRegistration = {
  uid: string;
  account: string;
  name: string;
  emailHash: string;
  location: string;
  role: UserRole;
};

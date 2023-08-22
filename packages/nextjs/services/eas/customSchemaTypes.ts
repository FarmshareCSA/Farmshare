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

export type Farm = {
  uid: string;
  name: string;
  owner: string;
  description: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  websiteURL: string;
  imageURL: string;
};

export type Task = {
  uid: string;
  communityUID: string;
  name: string;
  description: string;
  creator: string;
  startTime: number;
  endTime: number;
  recurring: boolean;
  frequency: number;
  imageURL: string;
  rewards: TaskReward[];
};

export type TaskReward = {
  uid: string;
  taskUID: string;
  tokenAddress: string;
  isErc1155: boolean;
  isErc20: boolean;
  amount: number;
  tokenId: number;
  tokenName: string;
};

export type UserRegistration = {
  uid: string;
  account: string;
  name: string;
  emailHash: string;
  location: string;
  role: UserRole;
};

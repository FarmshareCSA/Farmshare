export enum UserRole {
    None,
    User,
    Donor,
    Manager,
    Farmer,
    Admin
}

export type UserRegistration = {
    account: string,
    name: string,
    email: string,
    phone: string,
    location: string,
    role: UserRole
}

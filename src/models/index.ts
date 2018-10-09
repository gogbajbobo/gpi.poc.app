export interface UserModel {
    id: number,
    username: string,
    roles: string,
    exp: number
}

const isAdmin = (user: UserModel): boolean => user.roles.split(',').includes('admin');
const isUser = (user: UserModel): boolean => user.roles.split(',').includes('user');
const isVisitor = (user: UserModel): boolean => user.roles.split(',').includes('visitor');

export default { isAdmin, isUser, isVisitor }

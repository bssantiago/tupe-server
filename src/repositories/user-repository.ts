import { UserEntity } from '../entities/user-entity';
import { getManager } from 'typeorm';

export class UserRepo {

    public getAllUsers(): Promise<Array<UserEntity>> {
        return getManager().getRepository(UserEntity).find();
    }

    public getUserById(user_email: string): Promise<Array<UserEntity>> {
        return getManager().getRepository(UserEntity).find({ where: { user_email: user_email } });
    }

    public getUserByToken(token: string): Promise<UserEntity> {
        return getManager().getRepository(UserEntity).findOne({ where: { token: token } });
    }

    public saveUser(user: UserEntity): Promise<UserEntity> {
        return getManager().getRepository(UserEntity).save(user);
    }

    public updateUser(user_email: string, token: string, user_join_date: Date): Promise<void> {
        return getManager().getRepository(UserEntity).update(
            { user_email: user_email },
            { token: token, user_join_date: user_join_date });
    }

    public updatePassword(token: string, user_password: string): Promise<void> {
        return getManager().getRepository(UserEntity).update({ token: token }, { user_password: user_password });
    }

    public login(user_email: string, user_password: string): Promise<UserEntity> {
        return getManager().getRepository(UserEntity).findOne({ where: { user_email: user_email, user_password: user_password } });
    }

}

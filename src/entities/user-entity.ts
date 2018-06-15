import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_login')
export class UserEntity {

    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({
        length: 45
    })
    user_email: string;

    @Column({
        length: 600
    })
    user_password: string;

    @Column()
    user_join_date: Date;

    @Column({
        length: 100
    })
    token: string;


}


import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('predictions')
export class PredictionEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
    })
    iduser: string;

    @Column({
    })
    match_id: string;

    @Column({
    })
    team1_pred: number;

    @Column({
    })
    team2_pred: number;

    @Column({
    })
    username: string;

}

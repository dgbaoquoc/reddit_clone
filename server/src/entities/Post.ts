import { User } from './User';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    title!: string

    @Field()
    @Column()
    text!: string

    @Field()
    @Column()
    creatorId!: number

    @Field()
    @ManyToOne(() => User, user => user.posts)
    creator: User;

    @Field()
    @CreateDateColumn({type: 'timestamptz'})
    createdAt: Date

    @Field()
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date

}
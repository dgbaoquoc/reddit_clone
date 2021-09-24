import { Post } from '../entities/Post';

import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class PaginatedPosts {
    @Field()
    total: number

    @Field(() => Date)
    cursor: Date

    @Field()
    hasMore!: boolean

    @Field(() => [Post])
    paginatedPosts!: Post[]
}
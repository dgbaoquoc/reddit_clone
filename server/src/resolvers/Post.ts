import { Context } from './../types/Context';
import { PaginatedPosts } from './../types/PaginatedPost';

import { isAuth } from './../middleware/auth';
import { UpdatePostInput } from './../types/UpdatePostInput';
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { Post } from './../entities/Post';
import { CreatePostInput } from './../types/CreatePostInput';
import { PostMutationResponse } from './../types/PostMutationResponse';
import { User } from '../entities/User';
import { LessThan } from 'typeorm';



@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() post: Post) {
        return post.text.slice(0, 50);
    }

    @FieldResolver(() => User)
    creator(@Root() post: Post) {
        return User.findOne(post.creatorId)
    }

    @Mutation(() => PostMutationResponse)
    async createPost(
        @Arg('createPostInput') { title, text }: CreatePostInput,
        @Ctx() { req }: Context
    ): Promise<PostMutationResponse> {
        try {
            const newPost = Post.create({
                title,
                text,
                creatorId: req.session.userId
            })

            await Post.save(newPost)
            return {
                code: 200,
                success: true,
                message: "Post created successfully",
                post: newPost
            }
        } catch (error) {
            console.log(error)
            return {
                code: 500,
                success: false,
                message: 'Unknown error'
            }
        }
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', { nullable: true }) cursor?: string
    ): Promise<PaginatedPosts | null> {
        const totalPostCount = await Post.count()
        const realLimit = Math.min(10, limit)
        const findOptions: { [key: string]: any } = {
            order: {
                createdAt: 'DESC'
            },
            take: realLimit
        }

        let lastPost: Post[] = []
        if (cursor) {
            findOptions.where = {
                createdAt: LessThan(cursor)
            }

            let postSortASC = await Post.find({
                order: {
                    createdAt: 'ASC'
                },
                take: 1
            })
            lastPost = postSortASC
        }

        const posts = await Post.find(findOptions)
        return {
            // if cursor exist, lastpost created diff from lastpost from database => hasmore, else compare post length vs total post
            hasMore: cursor ? posts[posts.length - 1].createdAt.toString() !== lastPost[0].createdAt.toString() : posts.length !== totalPostCount,
            cursor: posts[posts.length - 1].createdAt,
            total: totalPostCount,
            paginatedPosts: posts
        }
    }

    @Query(() => Post, { nullable: true })
    async post(
        @Arg('id', () => Int) id: number
    ): Promise<Post | undefined> {
        return Post.findOne(id)
    }

    @Mutation(() => PostMutationResponse)
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('updatePostInput') { id, title, text }: UpdatePostInput,
        @Ctx() { req }: Context
    ): Promise<PostMutationResponse> {
        try {
            const post = await Post.findOne(id)
            if (!post) {
                return {
                    code: 400,
                    success: false,
                    message: "Post not found"
                }
            }

            post.title = title
            post.text = text
            if (post.creatorId != req.session.userId) {
                return {
                    code: 401,
                    success: false,
                    message: "Not authorized"
                }
            }

            await post.save()

            return {
                code: 200,
                success: true,
                message: "Updated post successfully",
                post
            }
        } catch (error) {
            console.log(error)
            return {
                code: 500,
                success: false,
                message: 'Unknown error'
            }
        }
    }

    @Mutation(() => PostMutationResponse)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { req }: Context
    ): Promise<PostMutationResponse> {
        try {
            const post = await Post.findOne(id)
            if (!post) {
                return {
                    code: 400,
                    success: false,
                    message: "Post not found"
                }
            }
            if (post.creatorId != req.session.userId) {
                return {
                    code: 401,
                    success: false,
                    message: "Not authorized"
                }
            }

            await Post.delete(id)

            return {
                code: 200,
                success: true,
                message: "Post deleted successfully",
                post
            }
        } catch (error) {
            console.log(error)
            return {
                code: 500,
                success: false,
                message: 'Unknown error'
            }
        }

    }
}
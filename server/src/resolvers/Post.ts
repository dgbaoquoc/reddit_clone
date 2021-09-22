
import { isAuth } from './../middleware/auth';
import { UpdatePostInput } from './../types/UpdatePostInput';
import { Arg, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { Post } from './../entities/Post';
import { CreatePostInput } from './../types/CreatePostInput';
import { PostMutationResponse } from './../types/PostMutationResponse';
import { User } from '../entities/User';



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
        @Arg('createPostInput') { title, text }: CreatePostInput
    ): Promise<PostMutationResponse> {
        try {
            const newPost = Post.create({
                title,
                text
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

    @Query(() => [Post])
    async posts(): Promise<Post[]> {
        return Post.find()
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
        @Arg('updatePostInput') { id, title, text }: UpdatePostInput
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
        @Arg('id', () => Int) id: number
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
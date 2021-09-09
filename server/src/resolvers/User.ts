import { COOKIE_NAME } from './../ultils/constant';
import { Context } from './../types/Context';
import { LoginInput } from './../types/LoginInput';
import { validateRegisterInput } from './../ultils/validateRegisterInput';
import { RegisterInput } from './../types/RegisterInput';
import { UserMutationResponse } from './../types/UserMutationResponse';
import { User } from './../entities/User';
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';



@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return 'hello world'
    }

    @Mutation(() => UserMutationResponse)
    async register(
        @Arg('registerInput') input: RegisterInput,
        @Ctx() { req }: Context
    ): Promise<UserMutationResponse> {
        const validateRegisterInputErrors = validateRegisterInput(input)
        if (validateRegisterInputErrors) {
            return {
                code: 400,
                success: false,
                ...validateRegisterInputErrors
            }
        }

        try {
            const { username, email, password } = input
            const existingUser = await User.findOne({
                where: [{ username }, { email }]
            })
            if (existingUser) {
                return {
                    code: 400,
                    success: false,
                    message: 'User is already created',
                    errors: [
                        { field: existingUser.username === username ? 'username' : 'email', message: 'Username/Email is already taken.' }
                    ]
                }
            }
            const hastedPassword = await argon2.hash(password)
            const newUser = await User.create({
                username,
                password: hastedPassword,
                email
            }).save()

            // await User.save(newUser)

            // Store session
            req.session.userId = newUser.id

            return {
                code: 200,
                success: true,
                message: "You have registed successfully",
                user: newUser
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

    @Mutation(() => UserMutationResponse)
    async login(
        @Arg('loginInput') input: LoginInput,
        @Ctx() { req }: Context
    ): Promise<UserMutationResponse> {
        try {
            const { usernameOrEmail, password } = input
            const existingUser = await User.findOne(usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail })

            if (!existingUser) {
                return {
                    code: 400,
                    success: false,
                    message: 'User not found',
                    errors: [{ field: 'usernameOrEmail', message: 'Username or Email incorrect' }]
                }
            }

            const passwordValid = await argon2.verify(existingUser.password, password)

            if (!passwordValid) {
                return {
                    code: 400,
                    success: false,
                    message: 'Password is incorrect',
                    errors: [{ field: 'password', message: 'Password is incorrect' }]
                }
            }

            // Create seession and return cookie
            req.session.userId = existingUser.id

            return {
                code: 400,
                success: true,
                message: 'Login successfully',
                user: existingUser
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

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: Context): Promise<boolean> {
        return new Promise((resolve) => {
            req.session.destroy(err => {
                res.clearCookie(COOKIE_NAME)
                if (err) {
                    console.log("Destroy session error", err)
                    resolve(false)
                    return;
                }

                resolve(true)
            })
        })
    }
}
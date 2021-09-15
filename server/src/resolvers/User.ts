import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from './../ultils/constant';
import { Context } from './../types/Context';
import { LoginInput } from './../types/LoginInput';
import { validateRegisterInput } from './../ultils/validateRegisterInput';
import { RegisterInput } from './../types/RegisterInput';
import { UserMutationResponse } from './../types/UserMutationResponse';
import { User } from './../entities/User';
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';
import { sendMail } from './../ultils/sendEmail';
import { v4 } from 'uuid'



@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req }: Context
    ): Promise<User | null | undefined> {
        if (!req.session.userId) {
            return null
        }

        const user = User.findOne(req.session.userId)
        return user
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
            const existingUser = await User.findOne(usernameOrEmail.includes('@') ? { email: usernameOrEmail.toLowerCase() } : { username: usernameOrEmail.toLowerCase() })

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
                code: 200,
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

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: Context
    ): Promise<boolean> {
        const user = await User.findOne({ email })
        if (!user) {
            return true
        }

        const token = v4()

        await redis.set(
            FORGET_PASSWORD_PREFIX + token,
            user.id,
            "ex",
            1000 * 60 * 60 * 24 * 3
        ); // 3 days

        await sendMail(
            email,
            'Forgot password.',
            `<a href="http://localhost:3000/change-password/${token}" target="_blank">reset password</a>`
        );

        return true
    }

    @Mutation(() => UserMutationResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { redis, req }: Context
    ): Promise<UserMutationResponse> {
        if (newPassword.length <= 2) {
            return {
                code: 400,
                success: false,
                message: 'Invalid password',
                errors: [
                    { field: 'newPassword', message: 'Length must be greater than 2' }
                ]
            }
        }
        try {
            const key = FORGET_PASSWORD_PREFIX + token
            const userId = await redis.get(key)

            if (!userId) {
                return {
                    code: 400,
                    success: false,
                    message: 'Invalid or expired token.',
                    errors: [
                        { field: 'token', message: 'Invalid or expired token.' }
                    ]
                }
            }

            const userIdNum = parseInt(userId)
            const user = await User.findOne(userIdNum)

            if (!user) {
                return {
                    code: 400,
                    success: false,
                    message: 'Invalid user',
                    errors: [
                        { field: 'token', message: 'Can not found any user is our system.' }
                    ]
                }
            }

            await User.update(
                { id: userIdNum },
                {
                    password: await argon2.hash(newPassword)
                }
            )

            await redis.del(key)

            req.session.userId = user.id

            return {
                code: 200,
                success: true,
                message: 'Change password successfully',
                user
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
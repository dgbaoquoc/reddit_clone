import { validateRegisterInput } from './../ultils/validateRegisterInput';
import { RegisterInput } from './../types/RegisterInput';
import { UserMutationResponse } from './../types/UserMutationResponse';
import { User } from './../entities/User';
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';



@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return 'hello world'
    }

    @Mutation(() => UserMutationResponse, { nullable: true })
    async register(
        @Arg('registerInput') input: RegisterInput
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
            const newUsser = User.create({
                username,
                password: hastedPassword,
                email
            })

            return {
                code: 200,
                success: true,
                message: "You have registed successfully",
                user: await User.save(newUsser)
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
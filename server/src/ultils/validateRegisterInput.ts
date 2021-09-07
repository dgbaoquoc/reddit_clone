import { RegisterInput } from './../types/RegisterInput';
export const validateRegisterInput = (input: RegisterInput) => {
    if (!input.email.includes("@")) {
        return {
            message: 'Invalid email',
            errors: [
                { field: 'email', message: 'Your email is in incorrect format' }
            ]
        }
    }

    if (input.username.length <= 2) {
        return {
            message: 'Invalid username',
            errors: [
                { field: 'username', message: 'Your username must be greater than 2 characters' }
            ]
        }
    }

    if (input.password.length <= 2) {
        return {
            message: 'Invalid password',
            errors: [
                { field: 'password', message: 'Your password must be greater than 2 characters' }
            ]
        }
    }

    return null
}
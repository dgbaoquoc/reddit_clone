import { MiddlewareFn } from 'type-graphql';
import { Context } from './../types/Context';

export const isAuth: MiddlewareFn<Context> = async ({ context: { req } }, next) => {
    if (!req.session.userId) {
        throw new Error("Not authenticated!");
    }

    return next();
};
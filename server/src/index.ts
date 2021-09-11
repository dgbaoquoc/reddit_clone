import 'reflect-metadata'
require('dotenv').config()

import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import express from 'express'
import session from 'express-session'
import redis from 'redis'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'
import { Post } from './entities/Post'
import { User } from './entities/User'
import { PostResolver } from './resolvers/Post'
import { UserResolver } from './resolvers/User'
import { COOKIE_NAME, __prod__ } from './ultils/constant'
import cors from 'cors'
// import { Context } from './types/Context';



const main = async () => {
    await createConnection({
        type: 'postgres',
        database: 'reddit',
        host: 'localhost',
        username: process.env.DB_USERNAME_DEV,
        password: process.env.DB_PASSWORD_DEV,
        logging: true, // dev,
        synchronize: true, //  dev
        entities: [User, Post]
    })

    const app = express()

    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true
    }))

    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient()

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redisClient,
                disableTouch: true,
                disableTTL: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60, // 1 hour
                httpOnly: true, // JS fe cannot access cookie
                sameSite: 'lax', // CSRF
                secure: __prod__ // cookie only works in https
            },
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET as string,
            resave: false
        })
    )


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver, PostResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, redis }),
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground]
    })

    await apolloServer.start()

    apolloServer.applyMiddleware({ app, cors: false })

    app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`))
}

main().catch(error => console.log(error))
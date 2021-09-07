
import 'reflect-metadata'
require('dotenv').config()
import express from 'express'
import { createConnection } from 'typeorm'
import { User } from './entities/User'
import { Post } from './entities/Post'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { UserResolver } from './resolvers/User';

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

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver],
            validate: false
        }),
        context: ({ req, res }): any => ({ req, res }),
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground]
    })

    await apolloServer.start()

    apolloServer.applyMiddleware({ app, cors: false })

    app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`))
}

main().catch(error => console.log(error))
require('dotenv').config()
import 'reflect-metadata'
import express from 'express'
import { createConnection } from 'typeorm'

const main = async () => {
    await createConnection({
        type: 'postgres',
        database: 'reddit',
        host: 'localhost',
        username: process.env.DB_USERNAME_DEV,
        password: process.env.DB_PASSWORD_DEV,
        logging: true, // dev,
        synchronize: true //  dev
    })

    const app = express()

    app.listen(4000, () => console.log(`Server started on port ${process.env.PORT}`))
}

main().catch(error => console.log(error))
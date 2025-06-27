//main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import { ValidationPipe } from '@nestjs/common';
import dotenv  from'dotenv';
dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    const sessionSecret = process.env.SESSION_SECRET;

    app.use(cookieParser());

    app.use(
        session({
            secret: sessionSecret!,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: false,
                maxAge: 1000 * 60 * 60 * 24, // 1 day
            },
            store: MongoStore.create({
                mongoUrl: process.env.MONGODB_URI, 
                collectionName: 'sessions'
            })
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());
    app.useGlobalPipes(new ValidationPipe());

    // CIRCULAR STRUCTURE DEBUGGER
  /*app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      try {
        JSON.stringify(data);
      } catch (err) {
        console.error('🚨 Circular structure detected in response data:', err.message);
        console.dir(data, { depth: 5 });
        throw err;
      }
      return originalJson.call(this, data);
    };
    next();
  });*/

    app.enableCors({
        origin: '*', //http://localhost:3000
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });

    await app.listen(port);
    console.log(`Server listening on port ${port}`);
}

bootstrap();

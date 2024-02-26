1. create a db
2. run `npx prisma init`
3. edit schema.prisma
4. run `npx prisma format` to create relationships and format code
5. run `npm i @prisma/client --save`
6. run `npx prisma migrate dev --name init` to create a migration
7. run `npm i morgan --save` to install morgan
8. `npm i cors --save`
9. https://hendrixer.github.io/API-design-v4/lessons/auth/auth-middleware
10. `npm i jsonwebtoken bcrypt dotenv`
    ...
11. config tests
12. npx ts-jest config:init

## Deploy

1. push to github
2. go to render.com
3. new web service
4. connect to github
5. select repo
   name: proj name
   root directory: not change
   environment: node
   branch: main
   build command: npm i && npm run build
   start command: npm start
   free plan
   create web service
6. environment
   add new variable
   name: DATABASE_URL
   value: postgres://username:password@host:port/dbname

   add new variable
   name: JWT_SECRET
   value: secret

   add new variable
   name: STAGE
   value: production

# Bookstore Management
This project is built by bugwarez. It is a bookstore management built in:
- NestJS
- PrismaORM
- PassportJS
- JWT
- PostgreSQL

It contains Authentication, Authorization, Role Management and bookstore management.

## Setup
1. #### Clone the Project
```
git clone https://github.com/bugwarez/bookstore-management.git
```
2. #### Install the dependencies
```
pnpm install
```
3. #### run prisma generate
```
npx prisma generate
```
4. #### Run the project
```
pnpm run start:dev
```



## Postman Collection
```
https://www.postman.com/loremsoft/workspace/book-store-management
```

### To run the tests
![image](https://github.com/user-attachments/assets/8c3b3cd7-8f19-4e30-9be1-ceecc4df4edd)

``` 
pnp run test:e2e
```


### Features
#### As a user
- [x] Ability to view all bookstores
- [x] Can view the books available in each store and query which books are available in
which bookstores.
#### As a store manager
- [x] Can add or remove a specific quantity of a book to/from a store (from the Book table. Quantities might be negative numbers in order to define "requested/needed" books in this store.)
#### As an admin
- [x] Can create a new bookstore. (Can create a new bookstore.)
- [x] Can
- [x] Can add or remove a specific quantity of a particular book to/from a specific
bookstore.
- [x] Adding new users and roles can only be done by the Admin.(With the first admin user is created with the postman collection(https://www.postman.com/loremsoft/book-store-management/request/b0zeiuf/register-user?tab=body), things will work smoothly.)

Database is hosted on neon.tech free tier. Feel free to run without any db/docker setup.

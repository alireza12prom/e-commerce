## E-Commerce API

### Quick start

1. Install packages:

```
npm install
```

2. Run the project:

```
npm run start
```

### How to run unit tests

```
npm test
```

it will run all tests that there are in `__tests__` folder.

## My thoughts...

1. I tried to make security as much as i could with the `apikey` that there is in `x-api-key` in request header. by default the apikey will expire after `12 hr`.
2. I tried to implement access control for the client depending on the client is just a `user` or an `admin`.
3. I used `Joi` to validate the inputs.
4. I used `Jest` to write unite tests for all controllers.
5. In the `product` route I defined many queries to sort or filter the results.
6. I defined request limit for the client (if it was a user). by defalt `10 requests` per `12 hr`.
7. In some situation database cannot connect to server and I tried to cover this problem. the server tries to connect to mongodb per 10 seconds for 5 times and if failed, server tries to close.

## What I'll do next

1. Use indexes, ... for more performance.
2. Add more tests for every middlewares, etc.....

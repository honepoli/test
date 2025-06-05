# test

## Server Setup

This project includes a small Express server backed by SQLite. To run it locally:

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server:
   ```sh
   node server.js
   ```
   The server listens on port `3000` by default. You can change the port by setting the `PORT` environment variable.

During development you can use nodemon:

```sh
npm run dev
```

The server provides several routes:

- `GET /items` – fetch all items from the database.
- `POST /items` – add a new item by providing a JSON body with a `name` field.
- `POST /signup` – create a new user. Requires `userId`, `passcode`, `username`, and optional `profile` in the request body. The request is rejected if a valid `Authorization` token is provided (i.e. when already signed in).
- `POST /signin` – sign in with `userId` and `passcode`. Returns an authentication token.
- `POST /logout` – invalidate the current session. Requires `Authorization: Bearer <token>` header.
- `GET /me` – retrieve the currently signed-in user's info.
- `PUT /me` – update the signed-in user's `username`, `profile`, or `passcode`.

The server provides two routes:

- `GET /items` – fetch all items from the database.
- `POST /items` – add a new item by providing a JSON body with a `name` field.

The database file (`db.sqlite`) is created automatically when the server first runs.

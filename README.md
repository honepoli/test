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

The server provides two routes:

- `GET /items` – fetch all items from the database.
- `POST /items` – add a new item by providing a JSON body with a `name` field.

The database file (`db.sqlite`) is created automatically when the server first runs.

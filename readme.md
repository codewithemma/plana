# Plana

Plana is a web application designed to handle user authentication, including registration, email verification, and password reset functionalities. The application is built using Node.js, Express, TypeScript, and Prisma ORM with MongoDB as the database.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/plana.git
   cd plana
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up the environment variables:
   Create a [.env](http://_vscodecontentref_/0) file in the root directory and add the following variables:

   ```env
   DATABASE_URL=your_mongodb_connection_string
   ORIGIN=http://localhost:3000
   GMAIL_HOST=smtp.gmail.com
   GMAIL_PORT=587
   GMAIL_USER=your_gmail_user
   GMAIL_PASSWORD=your_gmail_password
   MAILTRAP_HOST=smtp.mailtrap.io
   MAILTRAP_PORT=2525
   MAILTRAP_USER=your_mailtrap_user
   MAILTRAP_PASSWORD=your_mailtrap_password
   ```

4. Generate Prisma client:

   ```sh
   npx prisma generate
   ```

5. Start the application:
   ```sh
   npm run start
   ```

## Usage

Once the application is running, you can access it at `http://localhost:3000`.

## API Endpoints

### Authentication

- **Register**: `POST /api/v1/auth/register`

  - Request Body:
    ```json
    {
      "username": "your_username",
      "email": "your_email",
      "password": "your_password"
    }
    ```
  - Response:
    ```json
    {
      "message": "Please verify your email"
    }
    ```

- **Verify Email**: `POST /api/v1/auth/verify-email`

  - Request Body:
    ```json
    {
      "otp": "your_otp",
      "uid": "your_uid"
    }
    ```
  - Response:
    ```json
    {
      "message": "Email verified successfully"
    }
    ```

- **Login**: `POST /api/v1/auth/login`
  - Request Body:
    ```json
    {
      "email": "your_email",
      "password": "your_password"
    }
    ```
  - Response:
    ```json
    {
      "message": "login"
    }
    ```

## Environment Variables

The application requires the following environment variables to be set:

- `DATABASE_URL`: MongoDB connection string.
- [ORIGIN](http://_vscodecontentref_/1): The origin URL of your application.
- [GMAIL_HOST](http://_vscodecontentref_/2): Gmail SMTP host.
- [GMAIL_PORT](http://_vscodecontentref_/3): Gmail SMTP port.
- [GMAIL_USER](http://_vscodecontentref_/4): Gmail user email.
- [GMAIL_PASSWORD](http://_vscodecontentref_/5): Gmail user password.
- [MAILTRAP_HOST](http://_vscodecontentref_/6): Mailtrap SMTP host.
- [MAILTRAP_PORT](http://_vscodecontentref_/7): Mailtrap SMTP port.
- [MAILTRAP_USER](http://_vscodecontentref_/8): Mailtrap user email.
- [MAILTRAP_PASSWORD](http://_vscodecontentref_/9): Mailtrap user password.

## Project Structure

- **app.ts**: Entry point of the application.
- **controllers/**: Contains the controller logic for handling requests.
- **dtos/**: Data Transfer Objects (DTOs) for request validation.
- **errors/**: Custom error classes.
- **lib/**: Contains schema definitions using Zod.
- **middleware/**: Middleware functions for error handling and validation.
- **prisma/**: Prisma schema and client setup.
- **routes/**: API route definitions.
- **utils/**: Utility functions for email generation and sending.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License.

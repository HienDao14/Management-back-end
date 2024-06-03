# Backend code for Management App
## Overview

This project is a backend REST API server built using JavaScript (Node.js with Express). It provides a set of endpoints for managing and retrieving data for a web or mobile application. The server handles various operations such as creating, reading, updating, and deleting resources.

## Features

- **CRUD Operations**: Full support for Create, Read, Update, and Delete operations on resources.
- **Authentication**: User authentication and authorization using JWT (JSON Web Tokens).
- **Validation**: Input validation to ensure data integrity.
- **Error Handling**: Consistent and informative error responses.
- **Logging**: Request and error logging for debugging and monitoring.

## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)

## Getting Started

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/HienDao14/Management-back-end.git
   
2. **Install dependencies:**

   ```bash
   npm install 
### Configuration

1. **Environment Variables:**
Create a .env file in the root directory and add the following environment variables:

    ```bash
    DB_URL= your_mongodb_url
    ACCESS_TOKEN_SECRET= your_access_token_secret
    EMAIL=your_email
    PASS=your_app_password_email
    
### Running the Server
1. **Start the server**:

    ```bash
    npm run server
The server will be running at http://localhost:5000.

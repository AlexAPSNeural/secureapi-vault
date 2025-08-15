To create a robust API-first security layer using Express.js, you can implement a solution using JWT for authentication and encryption with HTTPS to ensure data protection. Below is a sample implementation:

1. **Install Necessary Packages**:

First, install the necessary packages using npm.

```bash
npm install express express-jwt jsonwebtoken bcryptjs dotenv helmet cors
```

2. **Server Code Setup**:

Create an `index.js` file for the server code:

```javascript
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const cors = require('cors');
const { expressjwt: expressJwt } = require("express-jwt");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors());

// Simple in-memory user store (replace with database in production)
const users = [];

// JWT Secret
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

// Middleware for checking JWT tokens
const authenticateToken = expressJwt({ secret: jwtSecret, algorithms: ["HS256"] });

// Helper function to generate JWT token
function generateAccessToken(username) {
    return jwt.sign({ username }, jwtSecret, { expiresIn: '1h' });
}

// Routes
// 1. User registration
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

// 2. User login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find(u => u.username === username);

        if (user && await bcrypt.compare(password, user.password)) {
            const token = generateAccessToken(username);
            res.json({ token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

// 3. Protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.send(`Hello ${req.auth.username}, this is a protected route.`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Invalid token');
    } else {
        res.status(500).send('Internal server error');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
});
```

3. **Run with HTTPS**:

To use HTTPS in production, you would typically obtain and use an SSL certificate from a Certificate Authority (CA). This code illustrates how to implement HTTPs using self-signed certificates for local testing and development purposes.

Generate self-signed certificates for testing:

```bash
openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
```

And modify your Express server setup to use HTTPS (replacing the `app.listen` line):

```javascript
const https = require('https');
const fs = require('fs');

const key = fs.readFileSync('key.pem');
const cert = fs.readFileSync('cert.pem');

https.createServer({ key: key, cert: cert }, app).listen(port, () => {
    console.log(`Server running securely on https://localhost:${port}`);
});
```

Ensure that you test the code in a secure environment and follow best practices for managing environment variables and secret keys. In production, secure your endpoints against potential threats, use more advanced user management, and leverage trusted CAs for your SSL/TLS certificates.
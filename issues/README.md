# 📘 Authentication & SMTP System - Root Cause Analysis (RCA) & Fixes Guide

Is directory (`issues/`) mein aapke Video Conferencing App ke backend authentication aur email system mein aaye sabhi critical issues ka **Root Cause Analysis (RCA)** aur **Step-by-Step Fixes** documented hain.

---

## 📑 Table of Contents
1. [Issue 1: Login Failure / Crash (`select: false` on Password)](#issue-1-login-failure--crash-select-false-on-password)
2. [Issue 2: Forgot Password Tokens Not Saving (Mongoose Schema Arguments Bug)](#issue-2-forgot-password-tokens-not-saving-mongoose-schema-arguments-bug)
3. [Issue 3: Unimplemented Password Reset Controller](#issue-3-unimplemented-password-reset-controller)
4. [Issue 4: Gmail SMTP 535 BadCredentials Error (Email Typo & App Password)](#issue-4-gmail-smtp-535-badcredentials-error-email-typo--app-password)
5. [Issue 5: Dotenv Path Resolution across Working Directories](#issue-5-dotenv-path-resolution-across-working-directories)
6. [Issue 6: Signup Duplicate Key Handling (Username vs Email)](#issue-6-signup-duplicate-key-handling-username-vs-email)
7. [🧪 Complete API Testing & Verification Guide](#-complete-api-testing--verification-guide)

---

## Issue 1: Login Failure / Crash (`select: false` on Password)

### 📌 Symptoms
- User valid credentials enter karne ke bawajood login nahi kar pata.
- API response: `500 Internal Server Error` (Error: `data and hash arguments required`) ya hamesha `401 Unauthorized` (`Invalid credentials`).

### 🔍 Root Cause Analysis (RCA)
1. In `server/modals/userModel.js`, `password` field par security best practice ke taur par `select: false` define kiya gaya tha:
   ```javascript
   password: {
     type: String,
     required: [true, 'Password is required'],
     select: false, // ⚠️ Default queries will NOT fetch password
   }
   ```
2. In `server/controllers/authController.js`, user fetch karne ke liye standard query use hui:
   ```javascript
   const user = await User.findOne({ email });
   ```
3. Because `select: false` active tha, Mongoose ne `user.password` ko omit kar diya (`user.password === undefined`).
4. Jab `user.comparePassword(password)` call hua:
   ```javascript
   userSchema.methods.comparePassword = async function (plainPassword) {
     return compare(plainPassword, this.password); // this.password is UNDEFINED!
   };
   ```
   `bcrypt.compare(password, undefined)` ne error throw kiya (`data and hash arguments required`), jisse server crash ho kar 500 error return kar raha tha.

### 🛠️ Steps to Fix
1. In `server/controllers/authController.js`, login query mein `.select('+password')` explicitly chain karein:
   ```javascript
   // ✅ FIX:
   const user = await User.findOne({ email }).select('+password');
   ```
2. Password match hone ke baad JWT token generate karke client ko return karein taaki authentication session persist rahe.
3. Empty email ya password aane par early validation check lagayein (`400 Bad Request`).

---

## Issue 2: Forgot Password Tokens Not Saving (Mongoose Schema Arguments Bug)

### 📌 Symptoms
- Forgot password request successful response deti hai, lekin database mein reset token ya expiry date save nahi hoti.
- Jab user reset link par click karta hai, token match nahi hota.

### 🔍 Root Cause Analysis (RCA)
1. In Mongoose, `new Schema(...)` constructor sirf **2 arguments** accept karta hai:
   - `Argument 1`: Fields definition object `{ [field]: options }`
   - `Argument 2`: Schema options object `{ timestamps: true, ... }`
2. In `server/modals/userModel.js`, schema definition mein **4 alag-alag objects** pass kiye gaye the:
   ```javascript
   // ❌ BUGGY CODE:
   const userSchema = new Schema(
     { name, username, email, password, profileUrl }, // Arg 1: Fields
     { passwordResetToken: { type: String, select: false } }, // Arg 2: Treated as options!
     { passwordResetExpires: { type: Date, select: false } }, // Arg 3: Discarded!
     { timestamps: true }                                     // Arg 4: Discarded!
   );
   ```
3. Mongoose ne Arg 2 ko options samajhkar discard kar diya, aur Arg 3 & 4 ko poori tarah ignore kar diya.
4. Mongoose strict mode enabled hone ki wajah se, jab `user.passwordResetToken = ...` assign kiya gaya, Mongoose ne use unregistered schema field maan kar database mein persist hi nahi kiya.

### 🛠️ Steps to Fix
1. Dono fields (`passwordResetToken` aur `passwordResetExpires`) ko **Argument 1 (main schema object)** ke andar move karein:
   ```javascript
   // ✅ FIX:
   const userSchema = new Schema(
     {
       name: { type: String },
       username: { type: String, required: true, unique: true },
       email: { type: String, required: true, unique: true },
       password: { type: String, required: true, select: false },
       profileUrl: { type: String, default: '' },
       passwordResetToken: { type: String, select: false },
       passwordResetExpires: { type: Date, select: false },
     },
     {
       timestamps: true, // Arg 2: Options
     }
   );
   ```

---

## Issue 3: Unimplemented Password Reset Controller

### 📌 Symptoms
- User reset link (`/reset-password/:token`) par naya password bhejta hai, par password change nahi hota.

### 🔍 Root Cause Analysis (RCA)
- `server/controllers/authController.js` mein `resetPassword` controller function completely empty tha:
  ```javascript
  export const resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
      // ⚠️ Missing implementation
    } catch (error) { ... }
  };
  ```

### 🛠️ Steps to Fix
1. URL se aane wale plain `token` ko SHA-256 se hash karein (kyunki DB mein hashed token store hota hai).
2. Database mein user search karein jahan `passwordResetToken` match kare aur `passwordResetExpires > Date.now()` ho.
3. New password set karein (`user.password = newPassword`) — Mongoose pre-save hook automatically naye password ko bcrypt se hash kar dega.
4. `passwordResetToken` aur `passwordResetExpires` ko `undefined` set karke clear karein.
5. Save karne ke baad naya JWT token return karein taaki user automatically logged-in state mein chala jaye.

---

## Issue 4: Gmail SMTP 535 BadCredentials Error (Email Typo & App Password)

### 📌 Symptoms
- Console log:
  ```text
  ❌ SMTP FAIL: Invalid login: 535-5.7.8 Username and Password not accepted.
     Code: EAUTH
  ```

### 🔍 Root Cause Analysis (RCA)
1. **Email Typo in `.env`**:
   - `.env` file mein email likha tha: `sameersheikhmasoori@gmail.com` (letter **`n`** missing tha).
   - Actual Google account email tha: `sameersheikhmansoori@gmail.com`.
   - Google SMTP server ne username aur password ke mismatch ki wajah se authentication reject kar diya (`BadCredentials`).
2. **Invalid `.env` Syntax**:
   - `.env` file mein `=====================` jaisi invalid separator lines maujood theen jisse variables sahi tarah se parse nahi ho rahe the.

### 🛠️ Steps to Fix
1. In `server/.env`, email address ko correct karein:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=sameersheikhmansoori@gmail.com
   SMTP_PASS=eatpzqxfudyhmkqt
   ```
2. **Google App Password Verification**:
   - Gmail par normal password use nahi ho sakta. Google **App Password** zaroori hai.
   - Naya App Password generate karne ke steps:
     1. Open [Google Account Security](https://myaccount.google.com/security).
     2. Ensure **2-Step Verification** is turned **ON**.
     3. Search **App passwords** (ya visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
     4. App Name: `VideoApp` likhein aur **Create** karein.
     5. 16-character code copy karein aur `server/.env` mein `SMTP_PASS` par paste karein (without spaces).
3. Server restart karein (`npm run dev`). Ab console par aayega:
   ```text
   ✅ SMTP ready — Gmail connected
   ```

---



## Issue 6: Signup Duplicate Key Handling (Username vs Email)

### 📌 Symptoms
- Jab do users alag-alag email se register karte hain par username same hota hai, to application 500 Server Error throw karti hai instead of user-friendly 400 error.

### 🔍 Root Cause Analysis (RCA)
- In `server/modals/userModel.js`, `username` aur `email` dono fields par `unique: true` constraint hai.
- Lekin `authController.js` ke `signup` mein sirf email check kiya ja raha tha:
  ```javascript
  const existingUser = await User.findOne({ email });
  ```
- Jab duplicate username aata hai, MongoDB unique index violation error (`E11000`) throw karta hai jo `catch(error)` block mein 500 error ban jata hai.

### 🛠️ Steps to Fix
- Signup validation mein dono fields check karein:
  ```javascript
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    const conflictField = existingUser.email === email ? 'Email' : 'Username';
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: `${conflictField} already exists`,
    });
  }
  ```

---

## Issue 7: Socket.IO Room Not Creating / Nothing Logged (Dual Port & Immediate Disconnect Bug)

### 📌 Symptoms
- Browser mein form submit karne par server terminal par kuch bhi print/log nahi ho raha tha.
- Room join nahi ho raha tha aur events deliver nahi ho rahe the.

### 🔍 Root Cause Analysis (RCA)
1. **Connection Par Hi Instant Disconnect**:
   - `server/server.js` mein `io.on('connection')` ke andar yeh line likhi thi:
     ```javascript
     // ❌ BUG:
     socket.disconnect(
       socket.leave('some room')
     );
     ```
   - Jaise hi koi browser client connect hota tha, server use connect hote hi agle microsecond disconnect kar deta tha! Is wajah se client ka koi bhi `socket.emit` server tak pahunch hi nahi pata tha.
2. **`socket.join()` Missing Tha**:
   - Room join karne ka code tha hi nahi. Sirf `socket.leave('some room')` likha tha.
3. **Do Alag Ports Ka Conflict (`app.listen` vs `server.listen`)**:
   - `mongoose.connect()` ke andar `app.listen(PORT)` (port 5000) chal raha tha.
   - Socket.IO HTTP server par `server.listen(4000)` alag se chal raha tha.
   - Jab user browser mein `http://localhost:5000` open karta tha, to page Express se 5000 par load hota tha, lekin wahan Socket.IO attached hi nahi tha!
4. **Duplicate Routes**:
   - Express mein do jagah `app.get('/')` define tha.

### 🛠️ Steps to Fix
1. `socket.disconnect(...)` ko remove kiya gaya.
2. `socket.join(roomId)` add kiya gaya taaki user officially room ka part bane.
3. `app.listen(PORT)` aur `server.listen(4000)` ko hata kar ek single `server.listen(PORT)` kiya gaya taaki Express HTTP aur Socket.IO WebSockets dono same port (5000) par smoothly chalein.
4. `dummyHtml/index.html` mein event feedback aur connection status listeners add kiye gaye.
---

## Issue 8: React Client TypeScript Errors in `App.tsx`

### 📌 Symptoms
- `client/client/src/App.tsx` mein red squiggly lines / TypeScript errors show ho rahe the (`Cannot find module 'react'`, `Cannot find module './assets/...'`, etc.).
- Build run karne par errors:
  - `ERESOLVE unable to resolve dependency tree: Found typescript@7.0.2, peer typescript@">=4.8.4 <6.1.0"`.
  - `error TS5023: Unknown compiler option 'erasableSyntaxOnly'`.

### 🔍 Root Cause Analysis (RCA)
1. **`node_modules` Not Installed**:
   - `npm create vite@latest client` run karne ke baad `npm install` run nahi hua tha (ya dependency conflict ki wajah se fail ho gaya tha), jisse `@types/react` aur `react` types missing the.
2. **Invalid `"typescript": "~7.0.2"` in `package.json`**:
   - `package.json` mein TypeScript version `~7.0.2` set tha jo `typescript-eslint` ke peer dependency limit (`<6.1.0`) ko tod raha tha aur `npm install` ko crash kar raha tha.
3. **Unknown Compiler Option `erasableSyntaxOnly`**:
   - `tsconfig.app.json` aur `tsconfig.node.json` mein `erasableSyntaxOnly: true` compiler option use ho raha tha jo TypeScript 5.7 ke sath incompatible tha.

### 🛠️ Steps to Fix
1. In `client/client/package.json`, TypeScript version ko `~5.7.2` par align kiya gaya.
2. `client/client` folder mein `npm install` run kiya gaya.
3. `tsconfig.app.json` aur `tsconfig.node.json` se `erasableSyntaxOnly: true` remove kiya gaya.
4. `npm run build` verify kiya gaya (`tsc -b && vite build` passed successfully in 321ms).

---

## 🧪 Complete API Testing & Verification Guide


### 1. User Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "sameer_dev",
    "email": "testuser@gmail.com",
    "password": "Password@123"
  }'
```
**Expected Response**: `201 Created` with user info & JWT token.

---

### 2. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com",
    "password": "Password@123"
  }'
```
**Expected Response**: `200 OK` with `token` and user details.

---

### 3. Forgot Password Request
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com"
  }'
```
**Expected Response**: `200 OK` (`"If that email exists, a reset link has been sent"`). Email inbox mein reset link aayega.

---

### 4. Reset Password
```bash
curl -X POST http://localhost:5000/api/auth/reset-password/<RAW_TOKEN_FROM_EMAIL> \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewStrongPassword@123"
  }'
```
**Expected Response**: `200 OK` (`"Password reset successful"`).


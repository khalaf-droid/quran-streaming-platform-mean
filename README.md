# 📖 Quran Streaming & Learning Platform (MEAN Stack)
> **A secure, highly reactive, production-grade Quran audio streaming and learning platform powered by Angular 19, Express.js, Node.js, and MongoDB.**

---

### 🚀 Production-Grade Features & Recent Hardening

This platform has undergone rigorous technical auditing and production hardening to ensure state consistency, high security, and seamless UI/UX:

- **⚡ Modern Reactive Frontend (Angular 19 Signals):** Replaced legacy local state variables with centralized Angular **Signals** (`computed()`, `signal()`) inside `AuthService` for instant, global cross-component UI synchronization (favorites, follows) without layout shifts or flashes.
- **🛡️ Multi-layered Security (Express Backend):** 
  - **Rate Limiting:** Mitigated brute-force attacks via `express-rate-limit` on authentication (`authLimiter`) and api actions (`apiLimiter`).
  - **Input Sanitization:** Deployed strict request validators using `express-validator` to guarantee payload integrity.
  - **Account Takeover Protection:** Hardened profile and password updates to verify current credentials with `bcrypt` before allowing mutations.
- **💾 Concurrency & Database Integrity (MongoDB/Mongoose):**
  - **Atomic Updates:** Replaced standard increments with `$inc` operations for likes and follows to eliminate race conditions under high load.
  - **Performance Indexing:** Configured Mongoose indexes on high-traffic read fields (`likes`, `followers`, `createdAt`) for lightning-fast queries.
- **✨ Premium UI/UX Consistency:** 
  - **Centralized Error UX:** Global `errorInterceptor` intercepts 4xx/5xx requests and translates them into elegant, user-friendly notifications via a customized `ToastService`.
  - **Smooth Skeletons:** Implemented shimming HTML skeleton loaders during API hydration to eliminate jarring visual flashes.
  - **Interactive Empty States:** Reusable `EmptyStateComponent` guides guests and users across search, profile, and favorites.

---

## Overview

This API and frontend provide a complete, interactive, and beautifully designed streaming experience for managing users, Quranic recitations (audio), reciters (Sheikhs/Qaris), Surahs (chapters), and listening collections. It includes JWT authentication, localized audio/image file uploads, Tafsir (interpretation) support, and a responsive media player.

## Features

- **User Management**

  - Registration and authentication with JWT
  - Profile management with profile picture upload
  - Favorite recitations, follow reciters, and follow collections
  - Bookmark Ayahs and track reading progress

- **Recitations (Audio Layer)**

  - Upload recitations with metadata (title, reciter, surah, duration, etc.)
  - Audio file storage in Cloudinary
  - Categorize recitations by style (Murattal, Mujawwad, Tilawa)
  - Track play count and favorites
  - Tafsir (interpretation) and translation storage

- **Reciters (Sheikhs / Qaris)**

  - Reciter profiles with images and bio
  - Catalog of recitations and Surahs covered
  - Reciter verification status
  - Track follower count

- **Surahs (Chapters)**

  - Create and manage Surahs with cover images
  - Associate recitations with Surahs
  - Surah metadata (revelation type, number of Ayahs, Juz, description)
  - Track favorites

- **Collections (Reading Plans / Playlists)**

  - Create public and private listening collections
  - Collaborative collections with multiple users
  - Add/remove recitations
  - Custom collection cover images
  - Track follower count

- **Media Uploads**
  - Image uploads for profile pictures, reciter images, surah covers, and collection covers
  - Audio file uploads for recitations
  - Secure storage in Cloudinary

## Tech Stack

- **Frontend Framework**: Angular (MEAN Stack)
- **Backend Framework**: Express.js + Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer (local) + Cloudinary (cloud storage)
- **Status Codes**: HTTP Status Codes package for standardized responses
- **Error Handling**: Express Async Handler for clean error management

## Database Association Diagram

```
┌─────────┐       ┌───────────┐       ┌─────────┐
│   User  │───────│Recitation │───────│ Reciter │
└─────────┘       └───────────┘       └─────────┘
     │                  │                   │
     │                  │                   │
     │              ┌───────┐               │
     └──────────────│ Surah │───────────────┘
                    └───────┘
                        │
                        │
                  ┌───────────┐
                  │Collection │
                  └───────────┘
```

### Association Details

1. **User**

   - Has many favorite recitations (Recitation)
   - Has many bookmarked Ayahs (Surah reference)
   - Has many followed reciters (Reciter)
   - Has many followed collections (Collection)
   - Can create many collections (Collection)
   - Can collaborate on many collections (Collection)

2. **Recitation**

   - Belongs to one reciter (Reciter)
   - Can belong to one surah (Surah)
   - Can have many featured reciters (Reciter)
   - Can be in many collections (Collection)
   - Can be favorited by many users (User)

3. **Reciter**

   - Has many recitations (Recitation)
   - Has many surahs covered (Surah)
   - Can be featured on many recitations (Recitation)
   - Can be followed by many users (User)

4. **Surah**

   - Belongs to one primary reciter (Reciter) or multiple
   - Has many recitations (Recitation)
   - Can be favorited by many users (User)

5. **Collection**
   - Belongs to one creator (User)
   - Can have many collaborators (User)
   - Contains many recitations (Recitation)
   - Can be followed by many users (User)

## Application Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│   Client    │◄────┤    API      │◄────┤  Database   │
│  (Angular)  │     │  (Express)  │     │ (MongoDB)   │
│             │────►│             │────►│             │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          │
                    ┌─────▼─────┐
                    │           │
                    │ Cloudinary│
                    │ (Storage) │
                    │           │
                    └───────────┘
```

### Data Flow Description

1. **Client-API Interaction**:

   - Angular client sends HTTP requests to the API endpoints
   - API validates requests and authenticates users via JWT
   - API returns appropriate responses with status codes

2. **API-Database Interaction**:

   - API uses Mongoose schemas to structure data
   - Performs CRUD operations on MongoDB collections
   - Handles relationships between collections through references

3. **Media Management Flow**:

   - Client uploads media (images/audio) through the API
   - API processes files with Multer
   - Files are uploaded to Cloudinary
   - Cloudinary URLs are stored in the database

4. **Authentication Flow**:
   - User registers/logs in via API
   - API validates credentials
   - JWT token generated and returned to client
   - Client includes token in subsequent requests
   - Token is verified for protected routes

## API Routes

### Authentication & User Routes

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get token
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)
- `PUT /api/users/favorite-recitation/:id` - Favorite/unfavorite a recitation (authenticated)
- `PUT /api/users/follow-reciter/:id` - Follow/unfollow a reciter (authenticated)
- `PUT /api/users/follow-collection/:id` - Follow/unfollow a collection (authenticated)

### Recitation Routes

- `GET /api/recitations` - Get all recitations (with filtering and pagination)
- `GET /api/recitations/top` - Get top recitations by plays
- `GET /api/recitations/new-releases` - Get recently added recitations
- `GET /api/recitations/:id` - Get recitation details
- `POST /api/recitations` - Upload a new recitation (admin only)
- `PUT /api/recitations/:id` - Update recitation details (admin only)
- `DELETE /api/recitations/:id` - Delete a recitation (admin only)

### Reciter Routes

- `GET /api/reciters` - Get all reciters (with filtering and pagination)
- `GET /api/reciters/top` - Get top reciters by followers
- `GET /api/reciters/:id` - Get reciter details
- `GET /api/reciters/:id/top-recitations` - Get reciter's top recitations
- `POST /api/reciters` - Create a new reciter (admin only)
- `PUT /api/reciters/:id` - Update reciter details (admin only)
- `DELETE /api/reciters/:id` - Delete a reciter (admin only)

### Surah Routes

- `GET /api/surahs` - Get all surahs (with filtering and pagination)
- `GET /api/surahs/new-releases` - Get recently released surahs
- `GET /api/surahs/:id` - Get surah details
- `POST /api/surahs` - Create a new surah (admin only)
- `PUT /api/surahs/:id` - Update surah details (admin only)
- `DELETE /api/surahs/:id` - Delete a surah (admin only)
- `PUT /api/surahs/:id/add-recitations` - Add recitations to surah (admin only)
- `PUT /api/surahs/:id/remove-recitation/:recitationId` - Remove recitation from surah (admin only)

### Collection Routes

- `GET /api/collections` - Get all public collections
- `GET /api/collections/featured` - Get featured collections
- `GET /api/collections/:id` - Get collection details
- `GET /api/collections/user/me` - Get user's collections (authenticated)
- `POST /api/collections` - Create a new collection (authenticated)
- `PUT /api/collections/:id` - Update collection details (authenticated)
- `DELETE /api/collections/:id` - Delete a collection (authenticated)
- `PUT /api/collections/:id/add-recitations` - Add recitations to collection (authenticated)
- `PUT /api/collections/:id/remove-recitation/:recitationId` - Remove recitation from collection (authenticated)
- `PUT /api/collections/:id/add-collaborator` - Add collaborator to collection (authenticated)
- `PUT /api/collections/:id/remove-collaborator` - Remove collaborator from collection (authenticated)

## API Samples

### Authentication & User Routes

#### Register User

```http
POST /api/users/register
Content-Type: application/json

{
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b5e",
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "isAdmin": false,
  "profilePicture": "",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b5e",
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "isAdmin": false,
  "profilePicture": "",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get User Profile

```http
GET /api/users/profile
Authorization: Bearer {token}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b5e",
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "isAdmin": false,
  "profilePicture": "",
  "favoriteRecitations": [],
  "favoriteSurahs": [],
  "followedReciters": [],
  "followedCollections": []
}
```

#### Update User Profile

```http
PUT /api/users/profile
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "name": "Ahmed M. Hassan",
  "email": "ahmed.updated@example.com",
  "password": "newpassword123",
  "profilePicture": [file]
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b5e",
  "name": "Ahmed M. Hassan",
  "email": "ahmed.updated@example.com",
  "isAdmin": false,
  "profilePicture": "https://cloudinary.com/...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Favorite/Unfavorite Recitation

```http
PUT /api/users/favorite-recitation/60d5ecb8b5c9c62b3c3c1b61
Authorization: Bearer {token}
```

Response:

```json
{
  "favoriteRecitations": ["60d5ecb8b5c9c62b3c3c1b61"],
  "message": "Recitation added to favorites"
}
```

#### Follow/Unfollow Reciter

```http
PUT /api/users/follow-reciter/60d5ecb8b5c9c62b3c3c1b5f
Authorization: Bearer {token}
```

Response:

```json
{
  "followedReciters": ["60d5ecb8b5c9c62b3c3c1b5f"],
  "message": "Reciter followed"
}
```

#### Follow/Unfollow Collection

```http
PUT /api/users/follow-collection/60d5ecb8b5c9c62b3c3c1b62
Authorization: Bearer {token}
```

Response:

```json
{
  "followedCollections": ["60d5ecb8b5c9c62b3c3c1b62"],
  "message": "Collection followed"
}
```

#### Get Top Recitations

```http
GET /api/recitations/top?limit=5
```

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b61",
    "title": "Surah Al-Baqarah - Full",
    "reciter": {
      "_id": "60d5ecb8b5c9c62b3c3c1b5f",
      "name": "Mishary Rashid Alafasy",
      "image": "https://cloudinary.com/..."
    },
    "surah": {
      "_id": "60d5ecb8b5c9c62b3c3c1b60",
      "title": "Al-Baqarah",
      "coverImage": "https://cloudinary.com/..."
    },
    "plays": 150000
  }
]
```

#### Get New Recitation Releases

```http
GET /api/recitations/new-releases?limit=5
```

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b61",
    "title": "Surah Ar-Rahman - New Recording",
    "reciter": {
      "_id": "60d5ecb8b5c9c62b3c3c1b5f",
      "name": "Abdul Rahman Al-Sudais",
      "image": "https://cloudinary.com/..."
    },
    "surah": {
      "_id": "60d5ecb8b5c9c62b3c3c1b60",
      "title": "Ar-Rahman",
      "coverImage": "https://cloudinary.com/..."
    },
    "createdAt": "2024-03-20T00:00:00.000Z"
  }
]
```

#### Update Recitation

```http
PUT /api/recitations/60d5ecb8b5c9c62b3c3c1b61
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "title": "Surah Al-Mulk - Revised",
  "style": "Mujawwad",
  "tafsir": "Updated tafsir notes...",
  "featuredReciters": "[\"60d5ecb8b5c9c62b3c3c1b5f\"]",
  "audio": [file],
  "cover": [file]
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b61",
  "title": "Surah Al-Mulk - Revised",
  "style": "Mujawwad",
  "tafsir": "Updated tafsir notes...",
  "featuredReciters": ["60d5ecb8b5c9c62b3c3c1b5f"],
  "audioUrl": "https://cloudinary.com/...",
  "coverImage": "https://cloudinary.com/..."
}
```

#### Get Top Reciters

```http
GET /api/reciters/top?limit=5
```

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b5f",
    "name": "Mishary Rashid Alafasy",
    "image": "https://cloudinary.com/...",
    "followers": 250000
  }
]
```

#### Get Reciter's Top Recitations

```http
GET /api/reciters/60d5ecb8b5c9c62b3c3c1b5f/top-recitations?limit=5
```

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b61",
    "title": "Surah Yasin",
    "duration": "25:30",
    "audioUrl": "https://cloudinary.com/...",
    "coverImage": "https://cloudinary.com/...",
    "plays": 95000,
    "surah": {
      "title": "Yasin",
      "coverImage": "https://cloudinary.com/..."
    }
  }
]
```

#### Update Surah

```http
PUT /api/surahs/60d5ecb8b5c9c62b3c3c1b60
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "title": "Al-Baqarah",
  "revelationType": "Medinan",
  "numberOfAyahs": "286",
  "description": "The longest Surah in the Quran...",
  "cover": [file]
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b60",
  "title": "Al-Baqarah",
  "revelationType": "Medinan",
  "numberOfAyahs": 286,
  "description": "The longest Surah in the Quran...",
  "coverImage": "https://cloudinary.com/..."
}
```

#### Get New Surah Releases

```http
GET /api/surahs/new-releases?limit=5
```

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b60",
    "title": "Al-Kahf",
    "reciter": {
      "_id": "60d5ecb8b5c9c62b3c3c1b5f",
      "name": "Maher Al-Muaiqly",
      "image": "https://cloudinary.com/..."
    },
    "revelationType": "Meccan",
    "coverImage": "https://cloudinary.com/..."
  }
]
```

#### Update Collection

```http
PUT /api/collections/60d5ecb8b5c9c62b3c3c1b62
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "name": "Ramadan Evening Listening",
  "description": "Curated recitations for Taraweeh nights",
  "isPublic": "false",
  "cover": [file]
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b62",
  "name": "Ramadan Evening Listening",
  "description": "Curated recitations for Taraweeh nights",
  "isPublic": false,
  "coverImage": "https://cloudinary.com/..."
}
```

#### Get Featured Collections

```http
GET /api/collections/featured?limit=5
```

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b62",
    "name": "Juz Amma Essentials",
    "creator": {
      "_id": "60d5ecb8b5c9c62b3c3c1b5e",
      "name": "Ahmed Hassan",
      "profilePicture": "https://cloudinary.com/..."
    },
    "coverImage": "https://cloudinary.com/...",
    "followers": 8500
  }
]
```

#### Remove Recitation from Collection

```http
PUT /api/collections/60d5ecb8b5c9c62b3c3c1b62/remove-recitation/60d5ecb8b5c9c62b3c3c1b61
Authorization: Bearer {token}
```

Response:

```json
{
  "message": "Recitation removed from collection"
}
```

#### Remove Collaborator from Collection

```http
PUT /api/collections/60d5ecb8b5c9c62b3c3c1b62/remove-collaborator
Content-Type: application/json
Authorization: Bearer {token}

{
  "userId": "60d5ecb8b5c9c62b3c3c1b63"
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b62",
  "name": "Juz Amma Essentials",
  "collaborators": []
}
```

#### Get User's Collections

```http
GET /api/collections/user
Authorization: Bearer {token}
```

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b62",
    "name": "My Daily Adhkar",
    "creator": {
      "_id": "60d5ecb8b5c9c62b3c3c1b5e",
      "name": "Ahmed Hassan",
      "profilePicture": "https://cloudinary.com/..."
    },
    "coverImage": "https://cloudinary.com/...",
    "isPublic": true,
    "createdAt": "2024-03-20T00:00:00.000Z"
  }
]
```

#### Delete Collection

```http
DELETE /api/collections/60d5ecb8b5c9c62b3c3c1b62
Authorization: Bearer {token}
```

Response:

```json
{
  "message": "Collection removed"
}
```

#### Add Recitations to Collection

```http
PUT /api/collections/60d5ecb8b5c9c62b3c3c1b62/add-recitations
Content-Type: application/json
Authorization: Bearer {token}

{
  "recitationIds": ["60d5ecb8b5c9c62b3c3c1b61", "60d5ecb8b5c9c62b3c3c1b64"]
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b62",
  "name": "My Daily Adhkar",
  "recitations": ["60d5ecb8b5c9c62b3c3c1b61", "60d5ecb8b5c9c62b3c3c1b64"],
  "collaborators": [],
  "followers": 0
}
```

#### Add Collaborator to Collection

```http
PUT /api/collections/60d5ecb8b5c9c62b3c3c1b62/add-collaborator
Content-Type: application/json
Authorization: Bearer {token}

{
  "userId": "60d5ecb8b5c9c62b3c3c1b63"
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b62",
  "name": "My Daily Adhkar",
  "collaborators": ["60d5ecb8b5c9c62b3c3c1b63"],
  "recitations": ["60d5ecb8b5c9c62b3c3c1b61", "60d5ecb8b5c9c62b3c3c1b64"]
}
```

#### Get All Public Collections

```http
GET /api/collections?page=1&limit=10&search=ramadan
```

Response:

```json
{
  "collections": [
    {
      "_id": "60d5ecb8b5c9c62b3c3c1b62",
      "name": "Ramadan Evening Listening",
      "creator": {
        "_id": "60d5ecb8b5c9c62b3c3c1b5e",
        "name": "Ahmed Hassan",
        "profilePicture": "https://cloudinary.com/..."
      },
      "coverImage": "https://cloudinary.com/...",
      "isPublic": true
    }
  ],
  "page": 1,
  "pages": 1,
  "totalCollections": 1
}
```

#### Get Collection by ID

```http
GET /api/collections/60d5ecb8b5c9c62b3c3c1b62
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b62",
  "name": "Ramadan Evening Listening",
  "description": "Curated recitations for Taraweeh nights",
  "creator": {
    "_id": "60d5ecb8b5c9c62b3c3c1b5e",
    "name": "Ahmed Hassan",
    "profilePicture": "https://cloudinary.com/..."
  },
  "coverImage": "https://cloudinary.com/...",
  "isPublic": true,
  "recitations": [
    {
      "_id": "60d5ecb8b5c9c62b3c3c1b61",
      "title": "Surah Yasin",
      "reciter": {
        "_id": "60d5ecb8b5c9c62b3c3c1b5f",
        "name": "Mishary Rashid Alafasy"
      },
      "duration": "25:30",
      "audioUrl": "https://cloudinary.com/...",
      "coverImage": "https://cloudinary.com/..."
    }
  ],
  "collaborators": [
    {
      "_id": "60d5ecb8b5c9c62b3c3c1b63",
      "name": "Omar Khaled",
      "profilePicture": "https://cloudinary.com/..."
    }
  ],
  "followers": 120
}
```

#### Get All Users (Admin Only)

```http
GET /api/users
Authorization: Bearer {token}
```

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b5e",
    "name": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "isAdmin": false,
    "profilePicture": "https://cloudinary.com/..."
  },
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b63",
    "name": "Admin User",
    "email": "admin@example.com",
    "isAdmin": true,
    "profilePicture": "https://cloudinary.com/..."
  }
]
```

#### Delete Recitation

```http
DELETE /api/recitations/60d5ecb8b5c9c62b3c3c1b61
Authorization: Bearer {token}
```

Response:

```json
{
  "message": "Recitation removed"
}
```

#### Delete Reciter

```http
DELETE /api/reciters/60d5ecb8b5c9c62b3c3c1b5f
Authorization: Bearer {token}
```

Response:

```json
{
  "message": "Reciter removed"
}
```

#### Delete Surah

```http
DELETE /api/surahs/60d5ecb8b5c9c62b3c3c1b60
Authorization: Bearer {token}
```

Response:

```json
{
  "message": "Surah removed"
}
```

#### Add Recitations to Surah

```http
PUT /api/surahs/60d5ecb8b5c9c62b3c3c1b60/add-recitations
Content-Type: application/json
Authorization: Bearer {token}

{
  "recitationIds": ["60d5ecb8b5c9c62b3c3c1b61", "60d5ecb8b5c9c62b3c3c1b64"]
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b60",
  "title": "Al-Baqarah",
  "recitations": ["60d5ecb8b5c9c62b3c3c1b61", "60d5ecb8b5c9c62b3c3c1b64"]
}
```

#### Remove Recitation from Surah

```http
PUT /api/surahs/60d5ecb8b5c9c62b3c3c1b60/remove-recitation/60d5ecb8b5c9c62b3c3c1b61
Authorization: Bearer {token}
```

Response:

```json
{
  "message": "Recitation removed from surah"
}
```

#### Create Recitation

```http
POST /api/recitations
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "title": "Surah Al-Fatiha - Full",
  "reciterId": "60d5ecb8b5c9c62b3c3c1b5f",
  "surahId": "60d5ecb8b5c9c62b3c3c1b60",
  "duration": "3:45",
  "style": "Murattal",
  "tafsir": "Opening chapter of the Quran...",
  "featuredReciters": "[]"
}
Files:
- audio: [file] (required)
- cover: [file] (optional)
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b61",
  "title": "Surah Al-Fatiha - Full",
  "reciter": "60d5ecb8b5c9c62b3c3c1b5f",
  "surah": "60d5ecb8b5c9c62b3c3c1b60",
  "duration": "3:45",
  "audioUrl": "https://cloudinary.com/...",
  "coverImage": "https://cloudinary.com/...",
  "style": "Murattal",
  "tafsir": "Opening chapter of the Quran...",
  "featuredReciters": [],
  "plays": 0
}
```

#### Get Recitation by ID

```http
GET /api/recitations/60d5ecb8b5c9c62b3c3c1b61
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b61",
  "title": "Surah Al-Fatiha - Full",
  "reciter": {
    "_id": "60d5ecb8b5c9c62b3c3c1b5f",
    "name": "Mishary Rashid Alafasy",
    "image": "https://cloudinary.com/..."
  },
  "surah": {
    "_id": "60d5ecb8b5c9c62b3c3c1b60",
    "title": "Al-Fatiha",
    "coverImage": "https://cloudinary.com/..."
  },
  "duration": "3:45",
  "audioUrl": "https://cloudinary.com/...",
  "coverImage": "https://cloudinary.com/...",
  "style": "Murattal",
  "tafsir": "Opening chapter of the Quran...",
  "plays": 1
}
```

#### Get Recitations with Filtering

```http
GET /api/recitations?page=1&limit=10&style=Murattal&search=fatiha
```

Response:

```json
{
  "recitations": [
    {
      "_id": "60d5ecb8b5c9c62b3c3c1b61",
      "title": "Surah Al-Fatiha - Full",
      "reciter": {
        "_id": "60d5ecb8b5c9c62b3c3c1b5f",
        "name": "Mishary Rashid Alafasy",
        "image": "https://cloudinary.com/..."
      },
      "surah": {
        "_id": "60d5ecb8b5c9c62b3c3c1b60",
        "title": "Al-Fatiha",
        "coverImage": "https://cloudinary.com/..."
      }
    }
  ],
  "page": 1,
  "pages": 1,
  "totalRecitations": 1
}
```

#### Create Reciter

```http
POST /api/reciters
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "name": "Mishary Rashid Alafasy",
  "bio": "Renowned Kuwaiti Qari, Imam of the Grand Mosque in Kuwait...",
  "styles": "[\"Murattal\", \"Mujawwad\"]",
  "isVerified": "true",
  "image": [file]
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b5f",
  "name": "Mishary Rashid Alafasy",
  "bio": "Renowned Kuwaiti Qari, Imam of the Grand Mosque in Kuwait...",
  "image": "https://cloudinary.com/...",
  "styles": ["Murattal", "Mujawwad"],
  "isVerified": true,
  "followers": 0,
  "recitations": [],
  "surahs": []
}
```

#### Get Reciters with Filtering

```http
GET /api/reciters?page=1&limit=10&style=Murattal&search=alafasy
```

Response:

```json
{
  "reciters": [
    {
      "_id": "60d5ecb8b5c9c62b3c3c1b5f",
      "name": "Mishary Rashid Alafasy",
      "bio": "Renowned Kuwaiti Qari, Imam of the Grand Mosque in Kuwait...",
      "image": "https://cloudinary.com/...",
      "styles": ["Murattal", "Mujawwad"],
      "isVerified": true,
      "followers": 0
    }
  ],
  "page": 1,
  "pages": 1,
  "totalReciters": 1
}
```

#### Update Reciter

```http
PUT /api/reciters/60d5ecb8b5c9c62b3c3c1b5f
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "name": "Sheikh Mishary Rashid Alafasy",
  "bio": "Updated biography of the renowned Kuwaiti Qari",
  "styles": "[\"Murattal\", \"Tilawa\"]",
  "isVerified": "true",
  "image": [file]
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b5f",
  "name": "Sheikh Mishary Rashid Alafasy",
  "bio": "Updated biography of the renowned Kuwaiti Qari",
  "image": "https://cloudinary.com/...",
  "styles": ["Murattal", "Tilawa"],
  "isVerified": true
}
```

#### Create Surah

```http
POST /api/surahs
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "title": "Al-Fatiha",
  "reciterId": "60d5ecb8b5c9c62b3c3c1b5f",
  "revelationType": "Meccan",
  "numberOfAyahs": "7",
  "description": "The Opening - the first chapter of the Holy Quran",
  "juz": "1",
  "cover": [file]
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b60",
  "title": "Al-Fatiha",
  "reciter": "60d5ecb8b5c9c62b3c3c1b5f",
  "revelationType": "Meccan",
  "numberOfAyahs": 7,
  "coverImage": "https://cloudinary.com/...",
  "juz": 1,
  "description": "The Opening - the first chapter of the Holy Quran",
  "recitations": []
}
```

#### Get Surahs with Filtering

```http
GET /api/surahs?page=1&limit=10&revelationType=Meccan&search=fatiha
```

Response:

```json
{
  "surahs": [
    {
      "_id": "60d5ecb8b5c9c62b3c3c1b60",
      "title": "Al-Fatiha",
      "reciter": {
        "_id": "60d5ecb8b5c9c62b3c3c1b5f",
        "name": "Mishary Rashid Alafasy",
        "image": "https://cloudinary.com/..."
      },
      "revelationType": "Meccan",
      "coverImage": "https://cloudinary.com/...",
      "numberOfAyahs": 7
    }
  ],
  "page": 1,
  "pages": 1,
  "totalSurahs": 1
}
```

#### Create Collection

```http
POST /api/collections
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "name": "Morning Adhkar Collection",
  "description": "Beautiful recitations for morning remembrance",
  "isPublic": "true",
  "cover": [file]
}
```

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b62",
  "name": "Morning Adhkar Collection",
  "description": "Beautiful recitations for morning remembrance",
  "creator": "60d5ecb8b5c9c62b3c3c1b5e",
  "coverImage": "https://cloudinary.com/...",
  "isPublic": true,
  "recitations": [],
  "collaborators": [],
  "followers": 0
}
```

import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quran App Clone API",
      version: "1.0.0",
      description:
        "A RESTful API for a Quran streaming & learning platform. Built with Node.js, Express, and MongoDB.\n\n" +
        "## Authentication\n" +
        "Most protected routes require a **Bearer JWT Token** in the Authorization header.\n\n" +
        "```\nAuthorization: Bearer <your_token>\n```\n\n" +
        "## How to get a token\n" +
        "1. Register a new user via `POST /api/users/register`\n" +
        "2. Or login via `POST /api/users/login`\n" +
        "3. Copy the `token` from the response and click **Authorize** above.",
      contact: {
        name: "Quran App Team",
        email: "support@quranapp.com",
      },
      license: {
        name: "ISC",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        // ─── User ───────────────────────────────────────────────
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "664a1b2c3d4e5f6789012345" },
            name: { type: "string", example: "Ahmed Hassan" },
            email: { type: "string", example: "ahmed@example.com" },
            profilePicture: { type: "string", example: "https://res.cloudinary.com/..." },
            isAdmin: { type: "boolean", example: false },
            favoriteRecitations: { type: "array", items: { type: "string" } },
            followedReciters: { type: "array", items: { type: "string" } },
            followedCollections: { type: "array", items: { type: "string" } },
          },
        },
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Ahmed Hassan" },
            email: { type: "string", example: "ahmed@example.com" },
            password: { type: "string", example: "password123" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "ahmed@example.com" },
            password: { type: "string", example: "password123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          },
        },

        // ─── Reciter ─────────────────────────────────────────────
        Reciter: {
          type: "object",
          properties: {
            _id: { type: "string", example: "664a1b2c3d4e5f6789012346" },
            name: { type: "string", example: "Mishary Rashid Al-Afasy" },
            bio: { type: "string", example: "Famous Kuwaiti reciter..." },
            image: { type: "string", example: "https://res.cloudinary.com/..." },
            styles: { type: "array", items: { type: "string" }, example: ["Murattal", "Mujawwad"] },
            isVerified: { type: "boolean", example: true },
            followers: { type: "number", example: 12500 },
          },
        },

        // ─── Surah ────────────────────────────────────────────────
        Surah: {
          type: "object",
          properties: {
            _id: { type: "string", example: "664a1b2c3d4e5f6789012347" },
            title: { type: "string", example: "Al-Fatiha" },
            titleArabic: { type: "string", example: "الفاتحة" },
            surahNumber: { type: "number", example: 1 },
            revelationType: { type: "string", enum: ["Meccan", "Medinan"], example: "Meccan" },
            numberOfAyahs: { type: "number", example: 7 },
            juz: { type: "number", example: 1 },
            coverImage: { type: "string", example: "https://res.cloudinary.com/..." },
          },
        },

        // ─── Recitation ───────────────────────────────────────────
        Recitation: {
          type: "object",
          properties: {
            _id: { type: "string", example: "664a1b2c3d4e5f6789012348" },
            title: { type: "string", example: "Surah Al-Fatiha - Murattal" },
            reciter: { $ref: "#/components/schemas/Reciter" },
            surah: { $ref: "#/components/schemas/Surah" },
            audioUrl: { type: "string", example: "https://res.cloudinary.com/..." },
            duration: { type: "number", example: 180 },
            style: { type: "string", example: "Murattal" },
            plays: { type: "number", example: 5420 },
          },
        },

        // ─── Collection ───────────────────────────────────────────
        Collection: {
          type: "object",
          properties: {
            _id: { type: "string", example: "664a1b2c3d4e5f6789012349" },
            name: { type: "string", example: "Morning Adhkar" },
            description: { type: "string", example: "A collection of morning recitations" },
            isPublic: { type: "boolean", example: true },
            creator: { $ref: "#/components/schemas/User" },
            recitations: { type: "array", items: { $ref: "#/components/schemas/Recitation" } },
          },
        },

        // ─── Error ────────────────────────────────────────────────
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Resource not found" },
          },
        },

        // ─── Pagination ───────────────────────────────────────────
        PaginatedResponse: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            pages: { type: "integer", example: 5 },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth & Users", description: "User registration, login, and profile management" },
      { name: "Surahs", description: "Quran chapter management" },
      { name: "Reciters", description: "Quran reciter profiles and management" },
      { name: "Recitations", description: "Audio recitation management and streaming" },
      { name: "Collections", description: "User-curated recitation collections" },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

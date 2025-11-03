# CMS_JSON - JSON-Based Blog CMS

A Next.js 14 blog CMS system that uses JSON files for data storage instead of PostgreSQL/Prisma. This is a complete clone of the main CMS_Nextjs project, converted to work entirely with JSON-based data storage.

## 🎯 Overview

This project maintains the exact same features and structure as the PostgreSQL-based CMS but stores all data in JSON files within the `/data` directory. All CRUD operations (Create, Read, Update, Delete) work seamlessly with JSON storage.

## 📁 Project Structure

```
CMS_JSON/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard & post management
│   ├── api/               # API routes (auth, posts, blocks, revisions)
│   └── blog/              # Public blog pages
├── components/            # React components
│   ├── blocks/           # Content block components (TextEditor, Image, Card, etc.)
│   └── ...
├── data/                  # JSON database files
│   ├── users.json        # User accounts
│   ├── posts.json        # Blog posts
│   ├── post_blocks.json  # Post content blocks
│   ├── post_revisions.json  # Post revision history
│   └── roadmap_submissions.json  # Form submissions
├── lib/                   # Core libraries
│   ├── json-db/          # JSON database layer
│   │   ├── index.ts      # Main exports
│   │   ├── connection.ts # File I/O handler
│   │   ├── users.ts      # Users CRUD operations
│   │   ├── posts.ts      # Posts CRUD operations
│   │   ├── post-blocks.ts  # Blocks CRUD operations
│   │   ├── post-revisions.ts  # Revisions CRUD operations
│   │   └── roadmap-submissions.ts  # Submissions CRUD operations
│   ├── api.ts            # High-level API layer
│   ├── auth.ts           # Authentication service
│   ├── client-api.ts     # Client-side API wrapper
│   ├── sanitize.ts       # HTML sanitization
│   └── security/         # Security utilities (rate limiting, CSRF, etc.)
└── ...

```

## 🗄️ JSON Database Structure

### Data Models

#### Users (`data/users.json`)
```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@blog.com",
      "display_name": "Blog Administrator",
      "password": "$2a$10$...",
      "role": "admin",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Posts (`data/posts.json`)
```json
{
  "posts": [
    {
      "id": 1,
      "title": "Sample Post",
      "slug": "sample-post",
      "excerpt": "Post excerpt...",
      "meta_title": "SEO Title",
      "meta_description": "SEO Description",
      "status": "published",
      "tags": ["tag1", "tag2"],
      "category": "Category Name",
      "canonical_url": "https://example.com/blog/sample-post",
      "featured_image": "https://...",
      "featured_image_id": 1,
      "language": "en",
      "author_id": 1,
      "author": {
        "id": 1,
        "name": "Admin"
      },
      "published_at": "2025-09-03T00:00:00.000Z",
      "created_at": "2025-09-01T00:00:00.000Z",
      "updated_at": "2025-10-08T10:44:27.166Z",
      "active": 1
    }
  ]
}
```

#### Post Blocks (`data/post_blocks.json`)
```json
{
  "post_blocks": [
    {
      "id": "b1-texteditor-001",
      "post_id": 1,
      "index": 0,
      "type": "texteditor",
      "content": {
        "json": { ... },
        "html": "<h2>...</h2>"
      },
      "settings": {
        "alignment": "left",
        "maxWidth": "100%"
      },
      "order": 1,
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2025-09-01T00:00:00.000Z",
      "updated_at": "2025-10-08T10:44:27.959Z"
    }
  ]
}
```

## 🚀 Key Features

### ✅ Complete Feature Parity
- User authentication (JWT-based)
- Post creation, editing, and deletion
- Rich text editing with Tiptap
- Block-based content system
- Post revisions tracking
- Draft/Published status management
- SEO metadata management
- Rate limiting (Upstash with in-memory fallback)
- HTML sanitization (DOMPurify)

### 🔧 JSON Database Layer

The `lib/json-db/` module provides a complete abstraction layer that mimics Prisma's API but works with JSON files:

**Features:**
- Atomic file operations (write-to-temp → rename)
- Transaction-like updates
- Auto-generated IDs
- Timestamps (created_at, updated_at)
- Cascading deletes
- Sorting and filtering
- Pagination support

**Available Methods:**
```typescript
// Users
UsersDB.findAll()
UsersDB.findById(id)
UsersDB.findByEmail(email)
UsersDB.create(data)
UsersDB.update(id, data)
UsersDB.delete(id)

// Posts
PostsDB.findAll()
PostsDB.findById(id)
PostsDB.findBySlug(slug)
PostsDB.findByStatus(status)
PostsDB.findByCategory(category)
PostsDB.findByAuthor(authorId)
PostsDB.create(data)
PostsDB.update(id, data)
PostsDB.delete(id) // Soft delete
PostsDB.hardDelete(id)
PostsDB.findPublished()
PostsDB.findDrafts()
PostsDB.search(query)
PostsDB.findPaginated(limit, offset)

// Post Blocks
PostBlocksDB.findAll()
PostBlocksDB.findById(id)
PostBlocksDB.findByPostId(postId)
PostBlocksDB.create(data)
PostBlocksDB.update(id, data)
PostBlocksDB.delete(id)
PostBlocksDB.deleteByPostId(postId)
PostBlocksDB.updateOrder(postId, blockIds)
PostBlocksDB.bulkCreate(blocksData)

// Post Revisions
PostRevisionsDB.findAll()
PostRevisionsDB.findById(id)
PostRevisionsDB.findByPostId(postId)
PostRevisionsDB.create(data)
PostRevisionsDB.delete(id)
PostRevisionsDB.getNextRevisionNumber(postId)

// Roadmap Submissions
RoadmapSubmissionsDB.findAll()
RoadmapSubmissionsDB.findById(id)
RoadmapSubmissionsDB.create(data)
RoadmapSubmissionsDB.delete(id)
```

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Steps

1. **Install Dependencies**
   ```bash
   cd CMS_JSON
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your settings:
   ```env
   JWT_SECRET=your-secret-key-here
   
   # Optional: Upstash Redis for production rate limiting
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

3. **Verify Data Files**
   Ensure these files exist in the `/data` directory:
   - `users.json` (with at least one admin user)
   - `posts.json`
   - `post_blocks.json`
   - `post_revisions.json`
   - `roadmap_submissions.json`

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Public blog: `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin`
   - API: `http://localhost:3000/api/*`

## 🔐 Default Credentials

```
Email: admin@blog.com
Password: admin123

Email: editor@blog.com
Password: editor123
```

## 🛠️ Development

### Adding a New Post
1. Navigate to `/admin`
2. Log in with admin credentials
3. Click "New Post"
4. Add content using the block editor
5. Save as draft or publish

### Available Block Types
- **TextEditor**: Rich text with formatting, lists, tables
- **Image**: Images with captions and links
- **Card**: Content cards with images
- **Accordion**: Collapsible content sections
- **Tabs**: Tabbed content
- **Button**: Call-to-action buttons
- **Layout**: Multi-column layouts (2, 3, or 4 columns)

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login

#### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts?status=published` - Get published posts
- `GET /api/posts?status=draft` - Get drafts
- `POST /api/posts` - Create new post (auth required)
- `GET /api/posts/[id]` - Get specific post
- `PUT /api/posts/[id]` - Update post (auth required)
- `DELETE /api/posts/[id]` - Delete post (auth required)

#### Blocks
- `GET /api/blocks?postId=[id]` - Get blocks for a post
- `POST /api/blocks` - Create block (auth required)
- `PUT /api/blocks/[id]` - Update block (auth required)
- `DELETE /api/blocks/[id]` - Delete block (auth required)

#### Revisions
- `GET /api/posts/[id]/revisions` - Get post revisions

## 🔒 Security Features

### Implemented
- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ HTML sanitization (isomorphic-dompurify)
- ✅ Rate limiting (Upstash + in-memory fallback)
- ✅ Input validation
- ✅ Role-based access control

### Rate Limiting
- Login endpoint: 5 attempts / 60 seconds
- 30-minute ban on exceed
- In-memory fallback for local development

## 📊 Data Backup

Since all data is stored in JSON files, backing up is simple:

```bash
# Backup data directory
cp -r data data_backup_$(date +%Y%m%d)

# Or tar it
tar -czf data_backup_$(date +%Y%m%d).tar.gz data/
```

## 🔄 Migration from PostgreSQL

This project was created from the PostgreSQL-based CMS_Nextjs project. Key changes:

1. **Removed**:
   - Prisma schema and migrations
   - PostgreSQL database connection
   - Prisma Client

2. **Added**:
   - `lib/json-db/` - Complete JSON database layer
   - File-based CRUD operations
   - Atomic write operations

3. **Modified**:
   - `lib/auth.ts` - Uses `UsersDB` instead of Prisma
   - `lib/api.ts` - Uses JSON database modules
   - All API routes updated for JSON storage

## 🚀 Deployment

### Vercel/Netlify
1. Push code to GitHub
2. Import project in Vercel/Netlify
3. Set environment variables:
   - `JWT_SECRET`
   - `UPSTASH_REDIS_REST_URL` (optional)
   - `UPSTASH_REDIS_REST_TOKEN` (optional)
4. Deploy

**Note**: JSON files persist in the deployment filesystem. For production, consider:
- Regular backups to external storage (S3, etc.)
- Using a proper database for high-traffic sites
- Implementing file locking for concurrent writes

## 📝 License

Same as parent project.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Known Limitations

1. **Concurrency**: JSON file writes are not optimized for high concurrency
2. **Performance**: Large datasets (>10,000 records) may be slow
3. **Transactions**: No true ACID transactions (uses atomic file operations)
4. **Relationships**: Manually managed (no automatic cascade)

**Recommendation**: Use this for:
- Small to medium blogs (<1,000 posts)
- Development/testing environments
- Projects where simple deployment is prioritized

For production high-traffic sites, consider the PostgreSQL version.

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ using Next.js 14, TypeScript, and JSON**

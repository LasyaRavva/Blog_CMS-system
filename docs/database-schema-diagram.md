# Database Schema Diagram

This ER diagram reflects the current Supabase database structure used by the backend.

```mermaid
erDiagram
    USERS {
        uuid id PK
        text username UK
        text email UK
        text password_hash
        text role
        timestamptz created_at
        timestamptz updated_at
    }

    POSTS {
        uuid id PK
        text title
        text slug UK
        text body
        text status
        uuid author_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    COMMENTS {
        uuid id PK
        text body
        uuid post_id FK
        uuid author_id FK
        timestamptz created_at
    }

    USERS ||--o{ POSTS : writes
    USERS ||--o{ COMMENTS : writes
    POSTS ||--o{ COMMENTS : contains
```

## Relationship Summary

- One `user` can create many `posts`.
- One `user` can create many `comments`.
- One `post` can have many `comments`.
- Each `comment` belongs to exactly one `post` and one `user`.

## Constraints

- `users.username` is unique.
- `users.email` is unique.
- `posts.slug` is unique.
- `posts.author_id` references `users.id`.
- `comments.post_id` references `posts.id`.
- `comments.author_id` references `users.id`.

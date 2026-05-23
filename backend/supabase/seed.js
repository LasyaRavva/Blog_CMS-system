require('dotenv').config();

const bcrypt = require('bcryptjs');
const supabase = require('../src/utils/supabase');

async function upsertUser({ username, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        username,
        email,
        password_hash: passwordHash,
        role,
      },
      { onConflict: 'email' }
    )
    .select('id, email')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function upsertPost(post) {
  const { error } = await supabase.from('posts').upsert(post, { onConflict: 'slug' });

  if (error) {
    throw error;
  }
}

async function main() {
  console.log('Seeding Supabase database...');

  const admin = await upsertUser({
    username: 'admin',
    email: 'admin@blog.com',
    password: 'admin123',
    role: 'ADMIN',
  });

  const user = await upsertUser({
    username: 'jane',
    email: 'jane@blog.com',
    password: 'user123',
    role: 'USER',
  });

  const posts = [
    {
      title: 'Getting Started with Node.js and Express',
      slug: 'getting-started-with-nodejs-and-express',
      body: `# Getting Started with Node.js and Express

Node.js is a powerful JavaScript runtime built on Chrome's V8 engine. Combined with Express, you can build fast and scalable web APIs.

## Installation

First, make sure you have Node.js installed. Then create a new project:

\`\`\`bash
mkdir my-api
cd my-api
npm init -y
npm install express
\`\`\`

## Your First Server

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
\`\`\`

That's all it takes to get a basic API up and running!`,
      status: 'PUBLISHED',
      author_id: admin.id,
    },
    {
      title: 'Understanding JWT Authentication',
      slug: 'understanding-jwt-authentication',
      body: `# Understanding JWT Authentication

JSON Web Tokens (JWT) are a compact, self-contained way to securely transmit information between parties.

## How It Works

1. User logs in with credentials
2. Server verifies credentials and issues a JWT
3. Client stores the JWT and sends it with every request
4. Server validates the JWT on each protected route

## Structure

A JWT has three parts separated by dots:
- **Header**: Algorithm and token type
- **Payload**: Claims (user data)
- **Signature**: Verifies the token hasn't been tampered with

## When to Use JWT

JWTs work well for stateless APIs where you don't want to store session data on the server.`,
      status: 'PUBLISHED',
      author_id: admin.id,
    },
    {
      title: 'React Context API vs Redux',
      slug: 'react-context-api-vs-redux',
      body: `# React Context API vs Redux

Choosing the right state management solution is an important architectural decision.

## Context API

Built into React, Context is great for:
- Auth state
- Theme / UI preferences
- Small to medium apps

## Redux

Redux shines when you have:
- Complex state interactions
- Large teams needing predictable state
- Heavy use of derived state or middleware

## The Verdict

For most apps, start with Context. Reach for Redux when Context feels awkward.`,
      status: 'PUBLISHED',
      author_id: user.id,
    },
    {
      title: 'My Draft Post',
      slug: 'my-draft-post',
      body: 'This is a draft that should not appear publicly.',
      status: 'DRAFT',
      author_id: user.id,
    },
  ];

  for (const post of posts) {
    await upsertPost(post);
  }

  const { data: firstPost, error: postError } = await supabase
    .from('posts')
    .select('id')
    .eq('slug', 'getting-started-with-nodejs-and-express')
    .maybeSingle();

  if (postError) {
    throw postError;
  }

  if (firstPost) {
    const { error } = await supabase.from('comments').insert({
      body: 'Great introduction! Really helped me get started.',
      post_id: firstPost.id,
      author_id: user.id,
    });

    if (error && error.code !== '23505') {
      throw error;
    }
  }

  console.log('Seed complete.');
  console.log('Admin: admin@blog.com / admin123');
  console.log('User:  jane@blog.com / user123');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

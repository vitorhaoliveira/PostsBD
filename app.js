const express = require('express');
const bodyParser = require('body-parser');

const { getStoredPosts, storePosts } = require('./data/posts');

const app = express();

app.use(bodyParser.json());

// Usando variáveis de ambiente para a configuração da porta e CORS
const PORT = process.env.PORT || 8080;
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use((req, res, next) => {
  // Attach CORS headers
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE'); // Adicionado DELETE
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Rota para buscar todos os posts
app.get('/posts', async (req, res) => {
  const storedPosts = await getStoredPosts();
  res.json({ posts: storedPosts });
});

// Rota para buscar um post pelo ID
app.get('/posts/:id', async (req, res) => {
  const storedPosts = await getStoredPosts();
  const post = storedPosts.find((post) => post.id === req.params.id);
  res.json({ post });
});

// Rota para adicionar um novo post
app.post('/posts', async (req, res) => {
  const existingPosts = await getStoredPosts();
  const postData = req.body;
  const newPost = {
    ...postData,
    id: Math.random().toString(),
  };
  const updatedPosts = [newPost, ...existingPosts];
  await storePosts(updatedPosts);
  res.status(201).json({ message: 'Stored new post.', post: newPost });
});

// Rota para deletar um post pelo ID
app.delete('/posts/:id', async (req, res) => {
  const existingPosts = await getStoredPosts();
  const postId = req.params.id;

  const postIndex = existingPosts.findIndex((post) => post.id === postId);

  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  // Remover o post da lista de posts
  const updatedPosts = existingPosts.filter((post) => post.id !== postId);
  await storePosts(updatedPosts);

  res.status(200).json({ message: 'Post deleted.' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

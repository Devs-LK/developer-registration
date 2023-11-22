// server.js
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');

dotenv.config();

const app = express();
const port = 3000;

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const githubRedirectUri = `http://localhost:${port}/auth/github/callback`;

app.get('/auth/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${githubRedirectUri}&scope=user`;
  res.redirect(githubAuthUrl);
});

app.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const { data } = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: githubClientId,
      client_secret: githubClientSecret,
      code: code,
      redirect_uri: githubRedirectUri,
    }, {
      headers: {
        Accept: 'application/json',
      },
    });

    const accessToken = data.access_token;

    const { data: userData } = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    saveUserData(userData.id, {
      githubUsername: userData.login,
      email: userData.email,
      photoURL: userData.avatar_url,
    });

    res.send('User authenticated successfully. You can close this window.');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error during GitHub authentication.');
  }
});

function saveUserData(uid, data) {
  firebase.database().ref('users/' + uid).set(data);
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

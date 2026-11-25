const fs = require('fs');
const path = require('path');

const FIREBASE_VARS = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
];

// Load .env into process.env before the inline plugin runs. The .env file is
// git-ignored; only .env.example is committed.
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match && !match[2].startsWith('#')) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    });
}

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'transform-inline-environment-variables',
      {
        include: FIREBASE_VARS,
      },
    ],
  ],
};

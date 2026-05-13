const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'emotions.json');

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function readData() {
  if (!fs.existsSync(DATA_FILE)) return { sessions: [] };
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return { sessions: [] }; }
}

function writeData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ─── Emotion Content Map ──────────────────────────────────────────────────────
const emotionContent = {
  happy: {
    label: 'Happy 😊',
    theme: 'happy',
    score: 95,
    headline: "You're on fire! Let's go deeper.",
    tagline: "Your positive energy unlocks advanced knowledge.",
    lessons: [
      {
        id: 'h1',
        title: 'Advanced Machine Learning Concepts',
        description: 'Dive into neural networks, transformers, and cutting-edge AI architectures.',
        duration: '45 min',
        difficulty: 'Advanced',
        icon: '🧠',
        tags: ['AI', 'Deep Learning', 'Python'],
        steps: [
          'Understand backpropagation mechanics',
          'Explore attention mechanisms in transformers',
          'Implement a mini neural network from scratch',
          'Analyze loss landscapes and optimization',
        ],
      },
      {
        id: 'h2',
        title: 'System Design Mastery',
        description: 'Design scalable systems used by millions — databases, caching, load balancers.',
        duration: '60 min',
        difficulty: 'Advanced',
        icon: '⚙️',
        tags: ['Architecture', 'Scalability', 'Engineering'],
        steps: [
          'CAP Theorem deep-dive',
          "Design Twitter's feed system",
          'Choose SQL vs NoSQL for your use case',
          'Implement rate limiting & circuit breakers',
        ],
      },
      {
        id: 'h3',
        title: 'Competitive Programming Challenges',
        description: 'Tackle hard LeetCode-style problems with optimal time & space complexity.',
        duration: '50 min',
        difficulty: 'Expert',
        icon: '🏆',
        tags: ['Algorithms', 'Data Structures', 'Coding'],
        steps: [
          'Segment trees & lazy propagation',
          'Solve 3 hard graph problems',
          'Dynamic programming on trees',
          'Bitmasking techniques',
        ],
      },
    ],
  },

  sad: {
    label: 'Sad 😢',
    theme: 'sad',
    score: 55,
    headline: "It's okay — small steps lead to big wins.",
    tagline: "You don't have to be perfect. Just begin.",
    lessons: [
      {
        id: 's1',
        title: 'You Are Enough — A Growth Mindset',
        description: 'Science-backed ways to rebuild confidence and embrace learning at your own pace.',
        duration: '10 min',
        difficulty: 'Beginner',
        icon: '🌱',
        tags: ['Motivation', 'Mindset', 'Wellness'],
        steps: [
          'The neuroscience of self-compassion',
          '3-minute journaling exercise',
          'Celebrate tiny wins every day',
          'Build a 5-minute learning habit',
        ],
      },
      {
        id: 's2',
        title: 'Intro to Python — Your First Program',
        description: 'Write your very first "Hello World" and feel the joy of making a computer do your bidding.',
        duration: '15 min',
        difficulty: 'Beginner',
        icon: '🐍',
        tags: ['Python', 'Coding Basics', 'Beginner'],
        steps: [
          'Install Python & VS Code',
          'Print your name to the screen',
          'Write a simple calculator',
          'Run your first script — feel proud!',
        ],
      },
      {
        id: 's3',
        title: 'Stories of Famous Failures',
        description: "Einstein, Rowling, Jobs — how the world's greatest learners overcame rejection.",
        duration: '8 min',
        difficulty: 'Beginner',
        icon: '💪',
        tags: ['Inspiration', 'History', 'Stories'],
        steps: [
          'J.K. Rowling rejected 12 times',
          'Einstein failed his entrance exam',
          'Steve Jobs fired from Apple',
          'Your setback is your setup',
        ],
      },
    ],
  },

  neutral: {
    label: 'Neutral 😐',
    theme: 'neutral',
    score: 75,
    headline: 'Steady focus. Solid progress.',
    tagline: "Consistency beats intensity. Let's build on what you know.",
    lessons: [
      {
        id: 'n1',
        title: 'JavaScript ES2024 — Modern Patterns',
        description: 'Master async/await, optional chaining, and the latest ES features.',
        duration: '30 min',
        difficulty: 'Intermediate',
        icon: '💛',
        tags: ['JavaScript', 'Web Dev', 'ES2024'],
        steps: [
          'Nullish coalescing & optional chaining',
          'Top-level await in modules',
          'Array groupBy & structuredClone',
          'Build a mini promise library',
        ],
      },
      {
        id: 'n2',
        title: 'Database Design Fundamentals',
        description: 'Normalization, indexing, transactions — the backbone of every great application.',
        duration: '35 min',
        difficulty: 'Intermediate',
        icon: '🗄️',
        tags: ['SQL', 'Databases', 'Design'],
        steps: [
          '1NF → 3NF normalization with examples',
          'Index types & query optimization',
          'ACID properties explained simply',
          'Design a library management schema',
        ],
      },
      {
        id: 'n3',
        title: 'React Hooks — Practical Guide',
        description: 'useState, useEffect, useCallback, useMemo — build real components with hooks.',
        duration: '40 min',
        difficulty: 'Intermediate',
        icon: '⚛️',
        tags: ['React', 'Frontend', 'Hooks'],
        steps: [
          'useState & controlled components',
          'useEffect & cleanup functions',
          'Custom hooks for data fetching',
          'Performance with useMemo & useCallback',
        ],
      },
    ],
  },

  angry: {
    label: 'Angry 😠',
    theme: 'angry',
    score: 40,
    headline: 'Take a breath. Short & calm lessons ahead.',
    tagline: "Channel that energy. Short, focused, and powerful.",
    lessons: [
      {
        id: 'a1',
        title: '5-Minute Breathing & Focus Reset',
        description: 'Box breathing and mindfulness to reset your focus and lower cortisol.',
        duration: '5 min',
        difficulty: 'Beginner',
        icon: '🧘',
        tags: ['Mindfulness', 'Wellness', 'Focus'],
        steps: [
          'Inhale 4 seconds, hold 4, exhale 4',
          'Body scan — release tension',
          'Set a calm intention for the next hour',
          'Return to learning refreshed',
        ],
      },
      {
        id: 'a2',
        title: 'Git Basics in 10 Minutes',
        description: 'Calm, short, and practical — learn Git commands you will use every single day.',
        duration: '10 min',
        difficulty: 'Beginner',
        icon: '🌿',
        tags: ['Git', 'Version Control', 'Quick'],
        steps: [
          'git init, add, commit, push',
          'Branches & merging in plain English',
          'Undo mistakes with git reset & revert',
          'Your first GitHub repository',
        ],
      },
      {
        id: 'a3',
        title: 'CSS Flexbox — Quick Visual Guide',
        description: 'Simple, visual, and soothing. Master flexbox layouts with calm, small examples.',
        duration: '12 min',
        difficulty: 'Beginner',
        icon: '🎨',
        tags: ['CSS', 'Flexbox', 'Visual'],
        steps: [
          'display: flex and its magic',
          'justify-content & align-items',
          'flex-wrap for responsive layouts',
          'Build a beautiful card grid in 5 lines',
        ],
      },
    ],
  },
};

// ─── Text → Emotion Detector ──────────────────────────────────────────────────
function detectEmotionFromText(text) {
  const t = text.toLowerCase();
  const map = {
    happy: ['happy', 'great', 'awesome', 'excited', 'good', 'amazing', 'wonderful', 'fantastic', 'joy', 'love', 'motivated', 'energetic', 'excellent', 'brilliant', 'perfect', 'cheerful', 'elated'],
    sad: ['sad', 'depressed', 'unhappy', 'crying', 'miserable', 'upset', 'down', 'lonely', 'hopeless', 'tired', 'exhausted', 'low', 'broken', 'hurt', 'lost', 'worthless'],
    angry: ['angry', 'mad', 'furious', 'frustrated', 'annoyed', 'irritated', 'rage', 'hate', 'stressed', 'overwhelmed', 'fed up', 'agitated', 'hostile'],
    neutral: ['okay', 'ok', 'fine', 'alright', 'normal', 'so-so', 'average', 'neutral', 'meh', 'indifferent'],
  };
  let scores = { happy: 0, sad: 0, angry: 0, neutral: 0 };
  for (const [emotion, keywords] of Object.entries(map)) {
    for (const kw of keywords) {
      if (t.includes(kw)) scores[emotion] += 1;
    }
  }
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return top[1] > 0 ? top[0] : 'neutral';
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/emotion — submit emotion (text or button)
app.post('/api/emotion', (req, res) => {
  const { userId, emotionInput, inputType } = req.body;

  if (!emotionInput) {
    return res.status(400).json({ error: 'emotionInput is required' });
  }

  const resolvedUserId = userId || uuidv4();
  let detectedEmotion;

  if (inputType === 'button') {
    detectedEmotion = emotionInput.toLowerCase();
    if (!emotionContent[detectedEmotion]) {
      return res.status(400).json({ error: 'Invalid emotion. Use: happy, sad, neutral, angry' });
    }
  } else {
    detectedEmotion = detectEmotionFromText(emotionInput);
  }

  const content = emotionContent[detectedEmotion];
  const timestamp = new Date().toISOString();
  const sessionId = uuidv4();

  // Save to history
  const data = readData();
  const existingUser = data.sessions.find(s => s.userId === resolvedUserId);
  const historyEntry = {
    sessionId,
    emotion: detectedEmotion,
    inputType: inputType || 'text',
    rawInput: inputType === 'text' ? emotionInput : null,
    score: content.score,
    timestamp,
  };

  if (existingUser) {
    existingUser.history.push(historyEntry);
    existingUser.lastSeen = timestamp;
    existingUser.totalSessions = existingUser.history.length;
    existingUser.averageScore = Math.round(
      existingUser.history.reduce((sum, h) => sum + h.score, 0) / existingUser.history.length
    );
  } else {
    data.sessions.push({
      userId: resolvedUserId,
      createdAt: timestamp,
      lastSeen: timestamp,
      totalSessions: 1,
      averageScore: content.score,
      history: [historyEntry],
    });
  }
  writeData(data);

  res.json({
    success: true,
    userId: resolvedUserId,
    sessionId,
    detectedEmotion,
    score: content.score,
    content: {
      label: content.label,
      theme: content.theme,
      headline: content.headline,
      tagline: content.tagline,
      lessons: content.lessons,
    },
    timestamp,
  });
});

// GET /api/history/:userId — get user history
app.get('/api/history/:userId', (req, res) => {
  const { userId } = req.params;
  const data = readData();
  const user = data.sessions.find(s => s.userId === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, user });
});

// GET /api/stats — global platform stats
app.get('/api/stats', (req, res) => {
  const data = readData();
  const emotionCounts = { happy: 0, sad: 0, neutral: 0, angry: 0 };
  let totalSessions = 0;
  let totalScore = 0;
  for (const user of data.sessions) {
    for (const h of user.history) {
      emotionCounts[h.emotion] = (emotionCounts[h.emotion] || 0) + 1;
      totalSessions++;
      totalScore += h.score;
    }
  }
  res.json({
    success: true,
    totalUsers: data.sessions.length,
    totalSessions,
    averagePlatformScore: totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0,
    emotionDistribution: emotionCounts,
  });
});

// GET /api/emotions — return available emotions list
app.get('/api/emotions', (req, res) => {
  res.json({
    success: true,
    emotions: Object.entries(emotionContent).map(([key, val]) => ({
      key,
      label: val.label,
      theme: val.theme,
      score: val.score,
      headline: val.headline,
    })),
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Smart Emotion Learning Platform running at http://localhost:${PORT}\n`);
});

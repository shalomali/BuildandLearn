import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'build-and-learn-secret-key-2026';

// Helper to format user response (excluding passwordHash)
function formatUser(user: { id: string; email: string; name: string | null; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString()
  };
}

// POST /api/auth/signup
authRouter.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: name ? String(name).trim() : null
      }
    });

    // Create default LearningProfile for the user
    await prisma.learningProfile.create({
      data: {
        userId: user.id,
        conceptHistory: JSON.stringify({}),
        learningPreferences: JSON.stringify({}),
        independenceTrend: JSON.stringify([])
      }
    }).catch(() => {});

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: formatUser(user)
    });
  } catch (error: any) {
    console.error('[Auth Error] Signup failed:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during signup' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: formatUser(user)
    });
  } catch (error: any) {
    console.error('[Auth Error] Login failed:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during login' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: formatUser(user)
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch user session' });
  }
});

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/database';
import { LoginRequest, RegisterRequest, UserWithoutPassword } from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { config } from '../config';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Login
router.post('/login', async (req: express.Request<{}, {}, LoginRequest>, res) => {
    console.log('got login: ', req.body);
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password required' });
            return;
        }

        db.get(
            'SELECT * FROM users WHERE username = ?',
            [username],
            async (err: any, user: any) => {
                if (err) {
                    res.status(500).json({ error: 'Database error' });
                    return;
                }

                if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                    res.status(401).json({ error: 'Invalid username or password' });
                    return;
                }
                console.log('found');
                // Fixed JWT sign call
                console.log('confi: ', config.jwt.secret);
                const token = jwt.sign(
                    {
                        id: user.id,
                        username: user.username
                    },
                    config.jwt.secret,
                    {
                        expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn']
                    }
                );
                console.log('made token');

                const userWithoutPassword: UserWithoutPassword = {
                    id: user.id,
                    username: user.username,
                    created_at: user.created_at,
                    admin: Boolean(user.admin) // Convert 0/1 to boolean, that sqlLite has changed to 0 and 1
                };
                console.log('responding');
                res.json({
                    token,
                    user: userWithoutPassword,
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Register
router.post('/register', async (req: express.Request<{}, {}, RegisterRequest>, res) => {
    console.log('got register: ', req.body);
    try {
        const { username, password, auth, admin } = req.body;

        if (!username || !password || !auth || admin === undefined) {
            console.log('fields missing', username, password, auth, admin);
            res.status(406).json({ error: 'All fields are required' });
            return;
        }

        // Check authorization code (you can modify this logic)
        if (auth !== process.env.AUTH_CODE) {
            res.status(403).json({ error: 'Invalid authorization code' });
            return;
        }

        // Check if username already exists
        db.get(
            'SELECT id FROM users WHERE username = ?',
            [username],
            async (err: any, existingUser: any) => {
                if (err) {
                    res.status(500).json({ error: 'Database error' });
                    return;
                }

                if (existingUser) {
                    console.log('already exists: ', username);
                    res.status(400).json({ error: 'Username already exists' });
                    return;
                }

                // Hash password and create user
                const passwordHash = await bcrypt.hash(password, 12);

                // Fixed SQL query - removed extra placeholder
                db.run(
                    'INSERT INTO users (username, password_hash, admin) VALUES (?, ?, ?)',
                    [username, passwordHash, false],
                    function (err: any) {
                        if (err) {
                            res.status(500).json({ error: 'Failed to create user' });
                            return;
                        }

                        res.status(200).json({ message: 'User registered successfully' });
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout (client-side token removal - this is just a placeholder)
router.post('/logout', authenticateToken, (req: AuthRequest, res) => {
    console.log('got logout', req.body);
    // In a real app, you might want to maintain a blacklist of tokens
    // For now, we just confirm the logout request
    res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
    console.log('get me: ', req.body);
    res.json({ user: req.user });
});

// all users

interface SafeUser {
  id: number;
  username: string;
  created_at: string;
}

router.get('/', (req, res) => {
    db.all(
        'SELECT id, username, admin, created_at FROM users',
        [],
        (err, users: SafeUser[]) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).json({ error: 'Database error' });
                return;
            }

            res.json({
                users
            });
        }
    );
});

// Delete user by username
router.delete('/:username', /*authenticateToken,*/ (req: AuthRequest, res) => {
    const { username } = req.params;

    // Optional: Prevent users from deleting themselves or add admin check
    /*
    if (req.user?.username === username) {
        res.status(400).json({ error: 'Cannot delete your own account' });
        return;
    }
*/
    // Optional: Only allow admins to delete users
/*
    if (!req.user?.admin) {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
  */
    
    db.run(
        'DELETE FROM users WHERE username = ?',
        [username],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }

            if (this.changes === 0) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.json({ message: `User ${username} deleted successfully` });
        }
    );
    
});

// Delete user by ID
router.delete('/id/:id', /*authenticateToken,*/ (req: AuthRequest, res) => {
    const { id } = req.params;

    // Optional: Prevent users from deleting themselves
    if (req.user?.id === parseInt(id)) {
        res.status(400).json({ error: 'Cannot delete your own account' });
        return;
    }

    // Optional: Only allow admins to delete users
/*
    if (!req.user?.admin) {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
*/
    db.run(
        'DELETE FROM users WHERE id = ?',
        [id],
        function(err: any) {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }

            if (this.changes === 0) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.json({ message: `User with ID ${id} deleted successfully` });
        }
    );
    
});

// Update user by ID
router.put('/id/:id', authenticateToken, async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { username, password, admin } = req.body;

    // Optional: Only allow admins to update users
    /*
    if (!req.user?.admin) {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    */

    try {
        // Check if user exists
        db.get('SELECT * FROM users WHERE id = ?', [id], async (err: any, user: any) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            // Build dynamic update query
            const updates: string[] = [];
            const values: any[] = [];

            if (username !== undefined) {
                // Check if new username is already taken by another user
                db.get(
                    'SELECT id FROM users WHERE username = ? AND id != ?',
                    [username, id],
                    async (err: any, existingUser: any) => {
                        if (err) {
                            res.status(500).json({ error: 'Database error' });
                            return;
                        }

                        if (existingUser) {
                            res.status(400).json({ error: 'Username already exists' });
                            return;
                        }

                        // Continue with update
                        await performUpdate();
                    }
                );
                return;
            } else {
                await performUpdate();
            }

            async function performUpdate() {
                if (username !== undefined) {
                    updates.push('username = ?');
                    values.push(username);
                }

                if (password !== undefined) {
                    const passwordHash = await bcrypt.hash(password, 12);
                    updates.push('password_hash = ?');
                    values.push(passwordHash);
                }

                if (admin !== undefined) {
                    updates.push('admin = ?');
                    values.push(admin ? 1 : 0);
                }

                if (updates.length === 0) {
                    res.status(400).json({ error: 'No fields to update' });
                    return;
                }

                values.push(id);
                const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

                db.run(query, values, function(err: any) {
                    if (err) {
                        console.error('Update error:', err);
                        res.status(500).json({ error: 'Failed to update user' });
                        return;
                    }

                    if (this.changes === 0) {
                        res.status(404).json({ error: 'User not found' });
                        return;
                    }

                    // Get updated user info
                    db.get(
                        'SELECT id, username, admin, created_at FROM users WHERE id = ?',
                        [id],
                        (err: any, updatedUser: any) => {
                            if (err) {
                                res.status(500).json({ error: 'Database error' });
                                return;
                            }

                            res.json({
                                message: 'User updated successfully',
                                user: updatedUser
                            });
                        }
                    );
                });
            }
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
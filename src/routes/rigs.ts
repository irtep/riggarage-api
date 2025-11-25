import express from 'express';
import { db } from '../database/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Rig, SaveNewRigRequest, UpdateRigRequest } from '../models/Rig';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
/*
export interface Rig {
    id: number;
    username: string;
    rig: string;
};
*/
// Initialize rigs table
db.run(`
  CREATE TABLE IF NOT EXISTS rigs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      rig TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
  if (err) {
    console.error('Error creating rigs table:', err);
  } else {
    console.log('Rigs table ready');
  }
});

// Get all rigs for current user
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  console.log('getting rigs of user ', req.user?.id);
  db.all(
    'SELECT * FROM rigs WHERE userId = ? ORDER BY createdAt DESC',
    [req.user?.id],
    (err, rigs: Rig[]) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }

      // Parse JSON units
      const parsedrigs = rigs.map(savedRig => ({
        ...savedRig,
        rig: JSON.parse(savedRig.rig)
      }));
      console.log('rigs: ', parsedrigs);
      res.json({ rigs: parsedrigs });
    }
  );
});

// Get specific army by ID
/*
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  console.log('specific army of id request', id);
  db.get(
    'SELECT * FROM rigs WHERE id = ? AND userId = ?',
    [id, req.user?.id],
    (err, army: any) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }

      if (!army) {
        res.status(404).json({ error: 'Army not found' });
        return;
      }

      // Parse JSON units
      const parsedArmy = {
        ...army,
        units: JSON.parse(army.units)
      };
      console.log('sending: ', parsedArmy);
      res.json({ army: parsedArmy });
    }
  );
});
*/
// Save new rig
router.post('/', authenticateToken, (req: AuthRequest<{}, {}, SaveNewRigRequest>, res) => {
  console.log('create rig post ');
  try {
    const { userId, rig } = req.body;
    /*console.log('name: ', name);
    console.log('userId: ', userId);
    console.log('nation: ', nation);
    console.log('pointslimit: ', pointsLimit);
    console.log('units: ', units);
    console.log('totalPoints: ', totalPoints);*/
    if (!userId || !rig) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const rigId = uuidv4();
    const unitsJson = JSON.stringify(rig);

    db.run(
      `INSERT INTO rigs (id, userId, rig) 
       VALUES (?, ?, ?)`,
      [rigId, userId, rig],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ error: 'Failed to create army' });
          return;
        }

        res.status(201).json({
          message: 'Rig created successfully',
          rigId,
          army: {
            id: rigId,
            rig
          }
        });
      }
    );
  } catch (error) {
    console.error('Create rig error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update rig
router.put('/:userId', authenticateToken, (req: AuthRequest<{ userId: string }, {}, UpdateRigRequest>, res) => {
  console.log('update rig post');
  try {
    const { userId } = req.params;
    const { id, rig } = req.body;

    // Build dynamic update query
    const updates: string[] = [];
    const params: any[] = [];

    updates.push('rig = ?');
    params.push(rig);
/*
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (nation !== undefined) {
      updates.push('nation = ?');
      params.push(nation);
    }
    if (pointsLimit !== undefined) {
      updates.push('pointsLimit = ?');
      params.push(pointsLimit);
    }
    if (units !== undefined) {
      updates.push('units = ?');
      params.push(JSON.stringify(units));
    }
    if (totalPoints !== undefined) {
      updates.push('totalPoints = ?');
      params.push(totalPoints);
    }
*/
    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    params.push(id, userId);

    db.run(
      `UPDATE rigs SET ${updates.join(', ')} WHERE id = ? AND userId = ?`,
      params,
      function(err) {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ error: 'Failed to update rig' });
          return;
        }

        if (this.changes === 0) {
          res.status(404).json({ error: 'rig not found' });
          return;
        }

        res.json({ message: 'Rig updated successfully' });
      }
    );
  } catch (error) {
    console.error('Update rig error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete rig
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  console.log('delete rig post');
  const { id } = req.params;

  db.run(
    'DELETE FROM rigs WHERE id = ? AND userId = ?',
    [id, req.user?.id],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: 'Rig not found' });
        return;
      }

      res.json({ message: 'Rig deleted successfully' });
    }
  );
});

export default router;
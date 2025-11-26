import express from 'express';
import { db } from '../database/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { RigObject/*, SaveNewRigRequest, UpdateRigRequest*/ } from '../models/Rig';
//import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
/*
export interface Rig {
    id: number;
    username: string;
    rig: string;
};
*/
/*
db.run('DELETE FROM rigs', (err) => {
  if (err) {
    console.error('Error purging rigs table:', err);
  } else {
    console.log('Rigs table purged');
  }
});

db.run('DROP TABLE IF EXISTS rigs', (err) => {
  if (err) {
    console.error('Error dropping rigs table:', err);
  } else {
    console.log('Rigs table dropped');
  }
});
*/
// Initialize rigs table
db.run(`
  CREATE TABLE IF NOT EXISTS rigs (
      id TEXT PRIMARY KEY,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      chassis TEXT NOT NULL,
      speed INTEGER NOT NULL,
      realSpeed INTEGER NOT NULL,
      armour INTEGER NOT NULL,
      handling INTEGER NOT NULL,
      resistanceFields INTEGER NOT NULL,
      emptySlots INTEGER NOT NULL,
      selectedWeapons TEXT NOT NULL,
      mods TEXT NOT NULL,
      gunnerSpecial TEXT NOT NULL,
      driverSpecial TEXT NOT NULL,
      rightTool TEXT NOT NULL,
      concealedWeapon TEXT NOT NULL,
      familiar TEXT NOT NULL,
      familiarStats TEXT NOT NULL,
      mines TEXT NOT NULL,
      handlingMods INTEGER NOT NULL,
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
    'SELECT * FROM rigs WHERE userId = ? ORDER BY created_at DESC',
    [req.user?.id],
    (err, rows: any[]) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      // Parse JSON fields from database
      const parsedRigs = rows.map(row => ({
        id: row.id,
        userId: row.userId,
        name: row.name,
        chassis: row.chassis,
        speed: row.speed,
        realSpeed: row.realSpeed,
        armour: row.armour,
        handling: row.handling,
        resistanceFields: row.resistanceFields,
        emptySlots: row.emptySlots,
        selectedWeapons: JSON.parse(row.selectedWeapons),
        mods: JSON.parse(row.mods),
        gunnerSpecial: row.gunnerSpecial,
        driverSpecial: row.driverSpecial,
        rightTool: JSON.parse(row.rightTool),
        concealedWeapon: row.concealedWeapon,
        familiar: JSON.parse(row.familiar),
        familiarStats: JSON.parse(row.familiarStats),
        mines: JSON.parse(row.mines),
        handlingMods: row.handlingMods
      }));
      
      console.log('rigs: ', parsedRigs);
      res.json(parsedRigs);
    }
  );
});

// Save new rig
router.post('/', authenticateToken, (req: AuthRequest<{}, {}, RigObject>, res) => {
  console.log('create rig post ', req.body);
  try {
    const {
      userId, id, name, chassis, speed, realSpeed, armour, handling, resistanceFields, 
      emptySlots, selectedWeapons, mods, gunnerSpecial, driverSpecial, rightTool, 
      concealedWeapon, familiar, familiarStats, mines, handlingMods
    } = req.body;
    console.log('props gathered');
    /*
    if (!userId || !id || !name) {
      console.log('fields missing');
      res.status(400).json({ error: 'Required fields missing' });
      return;
    }
      */
    console.log('inserting to db');
    db.run(
      `INSERT INTO rigs (
        id, userId, name, chassis, speed, realSpeed, armour, handling, 
        resistanceFields, emptySlots, selectedWeapons, mods, gunnerSpecial, 
        driverSpecial, rightTool, concealedWeapon, familiar, familiarStats, 
        mines, handlingMods
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        name,
        chassis,
        speed,
        realSpeed,
        armour,
        handling,
        resistanceFields,
        emptySlots,
        JSON.stringify(selectedWeapons),
        JSON.stringify(mods),
        gunnerSpecial,
        driverSpecial,
        JSON.stringify(rightTool),
        concealedWeapon,
        JSON.stringify(familiar),
        JSON.stringify(familiarStats),
        JSON.stringify(mines),
        handlingMods
      ],
      function (err) {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ error: 'Failed to create rig' });
          return;
        }
        console.log('rig created successfully');
        res.status(201).json({
          message: 'Rig created successfully',
          id: id
        });
      }
    );
  } catch (error) {
    console.error('Create rig error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update rig
router.put('/:id', authenticateToken, (req: AuthRequest<{ id: string }, {}, RigObject>, res) => {
  console.log('update rig post');
  try {
    const { id } = req.params;
    const rig = req.body;

    if (!rig || !id) {
      res.status(400).json({ error: 'Rig data required' });
      return;
    }

    db.run(
      `UPDATE rigs SET 
        name = ?,
        chassis = ?,
        speed = ?,
        realSpeed = ?,
        armour = ?,
        handling = ?,
        resistanceFields = ?,
        emptySlots = ?,
        selectedWeapons = ?,
        mods = ?,
        gunnerSpecial = ?,
        driverSpecial = ?,
        rightTool = ?,
        concealedWeapon = ?,
        familiar = ?,
        familiarStats = ?,
        mines = ?,
        handlingMods = ?
      WHERE id = ? AND userId = ?`,
      [
        rig.name,
        rig.chassis,
        rig.speed,
        rig.realSpeed,
        rig.armour,
        rig.handling,
        rig.resistanceFields,
        rig.emptySlots,
        JSON.stringify(rig.selectedWeapons),
        JSON.stringify(rig.mods),
        rig.gunnerSpecial,
        rig.driverSpecial,
        JSON.stringify(rig.rightTool),
        rig.concealedWeapon,
        JSON.stringify(rig.familiar),
        JSON.stringify(rig.familiarStats),
        JSON.stringify(rig.mines),
        rig.handlingMods,
        id,
        req.user?.id
      ],
      function (err) {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ error: 'Failed to update rig' });
          return;
        }
        if (this.changes === 0) {
          res.status(404).json({ error: 'Rig not found' });
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
    function (err) {
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
import { z } from 'zod';

export const statNames = [
  'Aim Assist', 'Airborne', 'Blast Radius', 'Charge Draw', 'Firing Delay',
  'Handling', 'Damage', 'PVE Damage', 'PVP Damage', 'Range', 'Reload',
  'Recoil Direction', 'Stability', 'Zoom', 'Ready', 'Stow', 'ADS',
  'Guard Charge Rate', 'Guard Efficiency', 'Guard Endurance', 'Guard Resistance',
] as const;
export const weaponTypes = [
  'AR', 'Bow', 'Fusion', 'GL', 'Glaive', 'HC', 'Heavy GL', 'LFR', 'LMG',
  'Pulse', 'Rocket', 'Scout', 'Shotgun', 'Sidearm', 'SMG', 'Sniper', 'Sword',
  'Trace', 'Grenade', 'Melee', 'Super',
] as const;
const modifiers = z.object({
  multiplier: z.array(z.number().finite()).optional(),
  stat: z.array(z.number().finite()).optional(),
}).strict();
export const statSchema = z.object({
  weaponTypes: z.array(z.enum(weaponTypes)).optional(),
  active: modifiers.optional(),
  passive: modifiers.optional(),
}).strict();
export const legacyStatsSchema = z.partialRecord(z.enum(statNames), z.array(statSchema));

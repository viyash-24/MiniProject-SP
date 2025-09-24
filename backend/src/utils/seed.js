import { User } from '../models/User.js';
import { hashPassword } from './passwords.js';

export async function seedAdmin() {
  const email = 'admin@gmail.com';
  const exists = await User.findOne({ email });
  if (exists) return;
  const passwordHash = await hashPassword('admin');
  await User.create({ name: 'Admin', email, passwordHash, role: 'admin' });
  console.log('Seeded admin user admin@gmail.com / admin');
}

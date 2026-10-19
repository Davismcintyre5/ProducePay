#!/usr/bin/env node
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const blue = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const reset = '\x1b[0m';
const bold = '\x1b[1m';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const ROLES = ['ADMIN', 'MANAGER', 'CLERK'];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    return true;
  } catch (error) {
    console.log(`${red}Database connection failed: ${error.message}${reset}`);
    return false;
  }
}

function banner() {
  console.log(`
${green}${bold}   +------------------------------+
   |   PRODUCEPAY ADMIN CLI       |
   +------------------------------+${reset}
`);
}

async function listUsers() {
  const User = (await import('../models/User.js')).default;
  const users = await User.find().select('-passwordHash -otp');

  if (users.length === 0) {
    console.log(`\n${yellow}No users found.${reset}\n`);
    return;
  }

  console.log(`\n${bold}Users (${users.length}):${reset}\n`);
  users.forEach((u, i) => {
    const status = u.active ? `${green}active${reset}` : `${red}inactive${reset}`;
    console.log(
      `  ${i + 1}. ${u.fullName} | ${u.email} | ${u.role} | ${u.phone} | ${status}`
    );
  });
  console.log('');
}

async function createUser() {
  const User = (await import('../models/User.js')).default;
  const { hashPassword } = await import('../utils/password.js');
  const { normalizePhone } = await import('../utils/helpers.js');

  console.log(`\n${bold}Create New User${reset}\n`);

  const fullName = (await question('  Full name: ')).trim();
  const username = (await question('  Username (lowercase): ')).trim().toLowerCase();
  const email = (await question('  Email: ')).trim().toLowerCase();
  const phoneInput = (await question('  Phone (07... or 2547...): ')).trim();
  const phone = normalizePhone(phoneInput);
  const password = await question('  Password (min 8 chars): ');

  const roleInput = (await question('  Role (ADMIN/MANAGER/CLERK) [ADMIN]: ')).trim().toUpperCase();
  const role = roleInput || 'ADMIN';

  if (!ROLES.includes(role)) {
    console.log(`\n${red}Invalid role. Use ADMIN, MANAGER, or CLERK.${reset}\n`);
    return;
  }

  if (!phone) {
    console.log(`\n${red}Invalid phone number.${reset}\n`);
    return;
  }

  if (password.length < 8) {
    console.log(`\n${red}Password must be at least 8 characters.${reset}\n`);
    return;
  }

  const existing = await User.findOne({
    $or: [{ username }, { email }, { phone }]
  });

  if (existing) {
    console.log(`\n${red}A user with that username, email, or phone already exists.${reset}\n`);
    return;
  }

  await User.create({
    username,
    passwordHash: await hashPassword(password),
    fullName,
    email,
    phone,
    role
  });

  console.log(`\n${green}User "${fullName}" created successfully.${reset}\n`);
}

async function manageUser() {
  const User = (await import('../models/User.js')).default;
  const { hashPassword } = await import('../utils/password.js');

  const users = await User.find().select('-passwordHash -otp');

  if (users.length === 0) {
    console.log(`\n${yellow}No users found.${reset}\n`);
    return;
  }

  console.log(`\n${bold}Manage User${reset}\n`);
  users.forEach((u, i) => {
    const status = u.active ? `${green}active${reset}` : `${red}inactive${reset}`;
    console.log(`  ${i + 1}. ${u.fullName} (${u.username}) [${u.role}] [${status}]`);
  });

  const choice = await question(`\n  Select user number (or 0 to cancel): `);
  const index = parseInt(choice, 10) - 1;

  if (choice === '0' || Number.isNaN(index) || index < 0 || index >= users.length) {
    console.log(`\n${yellow}Cancelled.${reset}\n`);
    return;
  }

  const user = users[index];
  console.log(`\n  Selected: ${bold}${user.fullName}${reset}`);
  console.log(`  1. Toggle active status`);
  console.log(`  2. Change role`);
  console.log(`  3. Reset password`);
  console.log(`  4. Delete user`);
  console.log(`  0. Cancel`);

  const action = await question(`\n  Action: `);

  switch (action) {
    case '1': {
      user.active = !user.active;
      await user.save();
      console.log(`\n${green}Status toggled to ${user.active ? 'active' : 'inactive'}.${reset}\n`);
      break;
    }
    case '2': {
      const newRole = (await question(`  New role (${ROLES.join('/')}): `)).trim().toUpperCase();
      if (!ROLES.includes(newRole)) {
        console.log(`\n${red}Invalid role.${reset}\n`);
        break;
      }
      user.role = newRole;
      await user.save();
      console.log(`\n${green}Role updated to "${newRole}".${reset}\n`);
      break;
    }
    case '3': {
      const newPassword = await question('  New password (min 8 chars): ');
      if (newPassword.length < 8) {
        console.log(`\n${red}Password must be at least 8 characters.${reset}\n`);
        break;
      }
      user.passwordHash = await hashPassword(newPassword);
      user.passwordChangedAt = new Date();
      await user.save();
      console.log(`\n${green}Password reset.${reset}\n`);
      break;
    }
    case '4': {
      const confirm = await question(`  ${red}Type DELETE to confirm: ${reset}`);
      if (confirm === 'DELETE') {
        await User.findByIdAndDelete(user._id);
        console.log(`\n${green}User deleted.${reset}\n`);
      } else {
        console.log(`\n${yellow}Cancelled.${reset}\n`);
      }
      break;
    }
    default:
      console.log(`\n${yellow}Cancelled.${reset}\n`);
  }
}

async function listCollections() {
  const collections = await mongoose.connection.db.listCollections().toArray();
  const counts = {};

  for (const col of collections) {
    counts[col.name] = await mongoose.connection.db.collection(col.name).countDocuments();
  }

  console.log(`\n${bold}Database Collections:${reset}\n`);
  let total = 0;
  collections.forEach((col) => {
    const count = counts[col.name];
    total += count;
    console.log(`  ${col.name} | ${count} documents`);
  });
  console.log(`\n  ${bold}Total: ${collections.length} collections, ${total} documents${reset}\n`);
}

async function dropCollection() {
  const collections = await mongoose.connection.db.listCollections().toArray();

  console.log(`\n${bold}Drop Collection${reset}\n`);
  collections.forEach((col, i) => {
    console.log(`  ${i + 1}. ${col.name}`);
  });

  const choice = await question(`\n  Select collection number (or 0 to cancel): `);
  const index = parseInt(choice, 10) - 1;

  if (choice === '0' || Number.isNaN(index) || index < 0 || index >= collections.length) {
    console.log(`\n${yellow}Cancelled.${reset}\n`);
    return;
  }

  const colName = collections[index].name;
  const confirm = await question(`  ${red}Type "${colName}" to confirm DROP: ${reset}`);

  if (confirm === colName) {
    await mongoose.connection.db.collection(colName).drop();
    console.log(`\n${green}Collection "${colName}" dropped.${reset}\n`);
  } else {
    console.log(`\n${yellow}Cancelled.${reset}\n`);
  }
}

async function dropDatabase() {
  console.log(`\n${red}${bold}DROP ENTIRE DATABASE${reset}\n`);

  const dbName = mongoose.connection.db.databaseName;
  const confirm1 = await question(`  ${red}Type database name "${dbName}" to continue: ${reset}`);

  if (confirm1 !== dbName) {
    console.log(`\n${yellow}Cancelled.${reset}\n`);
    return;
  }

  const confirm2 = await question(`  ${red}This will DELETE ALL DATA. Type YES to confirm: ${reset}`);

  if (confirm2 !== 'YES') {
    console.log(`\n${yellow}Cancelled.${reset}\n`);
    return;
  }

  await mongoose.connection.db.dropDatabase();
  console.log(`\n${green}Database "${dbName}" dropped completely.${reset}\n`);
}

async function mainMenu() {
  while (true) {
    console.log(`${bold}${blue}   +-------------------------+${reset}`);
    console.log(`${bold}${blue}   |   PRODUCEPAY ADMIN CLI  |${reset}`);
    console.log(`${bold}${blue}   +-------------------------+${reset}`);
    console.log(`${blue}   |  1. List Users          |${reset}`);
    console.log(`${blue}   |  2. Create User         |${reset}`);
    console.log(`${blue}   |  3. Manage User         |${reset}`);
    console.log(`${blue}   |  4. List DB Collections |${reset}`);
    console.log(`${blue}   |  5. Drop Collection     |${reset}`);
    console.log(`${blue}   |  6. Drop Database       |${reset}`);
    console.log(`${blue}   |  0. Exit                |${reset}`);
    console.log(`${bold}${blue}   +-------------------------+${reset}`);

    const choice = await question('\n  Select option: ');

    switch (choice) {
      case '1':
        await listUsers();
        break;
      case '2':
        await createUser();
        break;
      case '3':
        await manageUser();
        break;
      case '4':
        await listCollections();
        break;
      case '5':
        await dropCollection();
        break;
      case '6':
        await dropDatabase();
        break;
      case '0':
        console.log(`\n${green}Goodbye.${reset}\n`);
        await mongoose.connection.close();
        process.exit(0);
        break;
      default:
        console.log(`\n${yellow}Invalid option.${reset}\n`);
    }
  }
}

(async () => {
  banner();

  const connected = await connectDB();
  if (!connected) process.exit(1);

  console.log(`${green}Connected to: ${mongoose.connection.host}${reset}`);
  console.log(`${green}Database: ${mongoose.connection.db.databaseName}${reset}`);

  await mainMenu();
})();
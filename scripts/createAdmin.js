
require("dotenv").config();

const readline = require("readline");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const username = (await ask("Admin username: "))
      .trim()
      .toLowerCase();

    const password = await ask("Admin password (input is visible): ");

    if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
      throw new Error(
        "Username must be 3-30 characters: letters, numbers, dots, underscores or hyphens."
      );
    }

    if (password.length < 12) {
      throw new Error("Use a password with at least 12 characters.");
    }

    const existing = await Admin.findOne({ username });

    if (existing) {
      throw new Error("That admin username already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Admin.create({
      username,
      password: hashedPassword,
    });

    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

main();

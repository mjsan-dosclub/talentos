import { randomBytes, scryptSync } from "node:crypto";

if (!process.stdin.isTTY) {
  console.error("Run this command in an interactive terminal.");
  process.exit(1);
}

let password = "";
process.stdout.write("Password to hash (input is hidden): ");
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", (key) => {
  if (key === "\u0003") process.exit(130);
  if (key === "\r" || key === "\n") {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdout.write("\n");
    if (!password) {
      console.error("Password cannot be empty.");
      process.exit(1);
    }
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    console.log(`scrypt$${salt}$${hash}`);
    return;
  }
  if (key === "\u007f") {
    password = password.slice(0, -1);
    return;
  }
  password += key;
});

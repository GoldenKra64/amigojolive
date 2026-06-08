const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "../frontend/src/components/Navbar.tsx");
let content = execFileSync("git", [
  "show",
  "origin/main:frontend/src/components/Navbar.tsx",
]).toString("utf8");

content = content.replace(
  "const MANAGEMENT_LINKS = [",
  "const ADMIN_MANAGEMENT_LINKS = ["
);

content = content.replace(
  `function getManagementLinks(role: Role | undefined) {
  if (role === 'admin' || role === 'moderador') {
    return MANAGEMENT_LINKS;
  }
  return [];
}`,
  `const MODERATOR_MANAGEMENT_LINKS = [
  { to: '/admin/solicitudes', label: 'Solicitudes' },
  { to: '/admin/incidentes', label: 'Incidentes' },
] as const;

function getManagementLinks(role: Role | undefined) {
  if (role === 'admin') {
    return ADMIN_MANAGEMENT_LINKS;
  }
  if (role === 'moderador') {
    return MODERATOR_MANAGEMENT_LINKS;
  }
  return [];
}`
);

fs.writeFileSync(target, content, "utf8");
console.log("Navbar.tsx restored as UTF-8");

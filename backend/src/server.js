require("dotenv/config");

const dns = require("dns");
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
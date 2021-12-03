require("dotenv").config();

const config = {
  username: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  cluster_name: process.env.DB_CLUSTER_NAME,
  database: process.env.DB_DATABASE_NAME,
};

const url = `mongodb://${config.username}:${config.password}@${config.cluster_name}/${config.database}?authSource=admin&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&directConnection=true&ssl=false`;
console.log(url);
module.exports = url;

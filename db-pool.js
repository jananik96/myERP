import pkg from "pg";

const { Pool } = pkg;

export const db_pool = new Pool({
  host: "pgm-zf88260fyr2nijpmvo.rwlb.kualalumpur.rds.aliyuncs.com",
  user: "cerpuser",
  port: 5432,
  password: "Ati@987K",
  database: "cerp",
});

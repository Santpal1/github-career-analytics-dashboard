const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const DB_NAME = process.env.DB_NAME || 'github_career_analytics';

let pool;

async function initDB() {
  console.log('Connecting to MySQL...');
  const connection = await mysql.createConnection(DB_CONFIG);
  
  console.log(`Creating database ${DB_NAME} if not exists...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.end();

  // Create the pool with the database specified
  pool = mysql.createPool({
    ...DB_CONFIG,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  console.log('Initializing database tables...');
  
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      github_id VARCHAR(50) UNIQUE NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(150),
      avatar_url VARCHAR(255),
      bio TEXT,
      location VARCHAR(100),
      followers INT DEFAULT 0,
      following INT DEFAULT 0,
      career_score INT DEFAULT 0,
      consistency_score INT DEFAULT 0,
      os_readiness_score INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS repositories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      repo_name VARCHAR(150) NOT NULL,
      description TEXT,
      language VARCHAR(50),
      stars INT DEFAULT 0,
      forks INT DEFAULT 0,
      open_issues INT DEFAULT 0,
      quality_score INT DEFAULT 0,
      activity_score INT DEFAULT 0,
      popularity_score INT DEFAULT 0,
      maintenance_score INT DEFAULT 0,
      documentation_score INT DEFAULT 0,
      created_at VARCHAR(50),
      updated_at VARCHAR(50),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS skills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      skill_name VARCHAR(100) NOT NULL,
      skill_category VARCHAR(50) NOT NULL,
      skill_score INT DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS career_recommendations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      role VARCHAR(100) NOT NULL,
      confidence INT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS ai_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      review_text LONGTEXT NOT NULL,
      generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  ];

  for (const query of queries) {
    await pool.query(query);
  }
  
  console.log('Database tables successfully initialized.');
}

module.exports = {
  initDB,
  getPool: () => {
    if (!pool) {
      throw new Error('Database pool has not been initialized. Call initDB first.');
    }
    return pool;
  }
};

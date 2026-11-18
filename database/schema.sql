CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('citizen','lawyer','admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lawyer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  district VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  experience INTEGER DEFAULT 0 CHECK (experience >= 0),
  contact VARCHAR(30),
  bar_council_number VARCHAR(100) NOT NULL,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consultation_requests (
  id SERIAL PRIMARY KEY,
  citizen_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  preferred_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS legal_news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  summary TEXT NOT NULL,
  source VARCHAR(150),
  published_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO legal_news (title,summary,source,published_at) VALUES
('Digital Access to Courts Expanded','Courts continue to expand virtual hearing facilities and improve access for citizens in remote locations.','Judiciary Update','2026-11-10'),
('Consumer Protection Awareness','Consumers are encouraged to retain invoices and written records when raising disputes with businesses.','Legal Awareness Desk','2026-11-08'),
('Free Legal Aid Services','Eligible citizens can seek assistance through the District Legal Services Authority.','Legal Services Information','2026-11-05');

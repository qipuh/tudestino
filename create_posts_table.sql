USE tudestino_prod;

CREATE TABLE posts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  content TEXT,
  images JSON,
  type ENUM('post', 'reel') DEFAULT 'post',
  video_url VARCHAR(500),
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX (user_id)
);
USE cashy;

ALTER TABLE financial_goals
  ADD COLUMN due_date DATE NULL AFTER target_amount;

CREATE TABLE user_profiles (
  user_id BIGINT UNSIGNED NOT NULL,
  avatar_key VARCHAR(32) NOT NULL DEFAULT 'leaf',
  avatar_color VARCHAR(20) NOT NULL DEFAULT 'green',
  notification_preferences JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id)
    REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE education_activity (
  activity_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id VARCHAR(80) NOT NULL,
  event_type ENUM('course_opened', 'topic_completed', 'quiz_completed', 'course_completed') NOT NULL,
  topic_index SMALLINT NOT NULL DEFAULT -1,
  reward_key VARCHAR(140) NOT NULL,
  points SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  details_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (activity_id),
  UNIQUE KEY uq_education_reward (user_id, reward_key),
  KEY idx_education_activity_recent (user_id, created_at),
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id)
    REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE education_course_state (
  user_id BIGINT UNSIGNED NOT NULL,
  course_id VARCHAR(80) NOT NULL,
  last_topic_index SMALLINT NOT NULL DEFAULT 0,
  completed_topics JSON NOT NULL,
  quiz_history JSON NOT NULL,
  last_accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, course_id),
  CONSTRAINT fk_course_state_user FOREIGN KEY (user_id)
    REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

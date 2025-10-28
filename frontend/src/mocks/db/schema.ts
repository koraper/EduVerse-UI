// 사용자
export interface User {
  id: number                                  // PRIMARY KEY AUTO_INCREMENT
  email: string                               // VARCHAR(255) UNIQUE NOT NULL
  name: string                                // VARCHAR(50) NOT NULL
  password: string                            // VARCHAR(255) NOT NULL (개발용 평문, 운영은 bcrypt hash)
  role: 'student' | 'professor' | 'admin'    // ENUM('student', 'professor', 'admin') NOT NULL
  status: 'active' | 'inactive' | 'suspended' // ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active'
  emailVerified: boolean                      // BOOLEAN DEFAULT FALSE
  phone?: string                              // VARCHAR(20) NULL - 전화번호
  department?: string                         // VARCHAR(100) NULL - 소속/학과
  bio?: string                                // TEXT NULL - 자기소개
  studentId?: string                          // VARCHAR(20) NULL - 학번 (학생만)
  createdAt: string                           // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updatedAt: string                           // TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
}

// 커리큘럼
export interface Curriculum {
  id: number                                        // PRIMARY KEY AUTO_INCREMENT
  name: string                                      // VARCHAR(100) NOT NULL
  description: string                               // TEXT NOT NULL
  language: 'C' | 'Java' | 'JavaScript' | 'C#'     // ENUM('C', 'Java', 'JavaScript', 'C#') NOT NULL
  weeks: number                                     // INT NOT NULL
  status: 'active' | 'archived'                     // ENUM('active', 'archived') NOT NULL DEFAULT 'active'
  createdAt: string                                 // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// 수업
export interface Class {
  id: number                                                        // PRIMARY KEY AUTO_INCREMENT
  professorId: number                                               // INT NOT NULL, FOREIGN KEY (users.id)
  curriculumId: number                                              // INT NOT NULL, FOREIGN KEY (curricula.id)
  name: string                                                      // VARCHAR(100) NOT NULL
  description: string                                               // TEXT NOT NULL
  year: number                                                      // INT NOT NULL
  semester: '1학기' | '2학기' | '여름학기' | '겨울학기'             // ENUM('1학기', '2학기', '여름학기', '겨울학기') NOT NULL
  invitationCode: string                                            // CHAR(6) UNIQUE NOT NULL
  qrCodeUrl: string                                                 // VARCHAR(255) NOT NULL
  createdAt: string                                                 // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  deletedAt: string | null                                          // TIMESTAMP NULL (soft delete)
}

// 주차별 수업
export interface WeeklySession {
  id: number                                          // PRIMARY KEY AUTO_INCREMENT
  classId: number                                     // INT NOT NULL, FOREIGN KEY (classes.id)
  weekNumber: number                                  // INT NOT NULL
  status: 'not_started' | 'in_progress' | 'ended'    // ENUM('not_started', 'in_progress', 'ended') NOT NULL
  startedAt: string | null                            // TIMESTAMP NULL
  endedAt: string | null                              // TIMESTAMP NULL
  autoEndAt: string | null                            // TIMESTAMP NULL
  createdAt: string                                   // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// 수업 참여
export interface Enrollment {
  id: number                    // PRIMARY KEY AUTO_INCREMENT
  studentId: number             // INT NOT NULL, FOREIGN KEY (users.id)
  classId: number               // INT NOT NULL, FOREIGN KEY (classes.id)
  enrolledAt: string            // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  withdrawnAt: string | null    // TIMESTAMP NULL (soft delete)
  isActive: boolean             // BOOLEAN DEFAULT TRUE
}

// 제출 데이터
export interface Submission {
  id: number                    // PRIMARY KEY AUTO_INCREMENT
  studentId: number             // INT NOT NULL, FOREIGN KEY (users.id)
  taskId: number                // INT NOT NULL
  weekNumber: number            // INT NOT NULL
  submissionNumber: number      // INT NOT NULL
  isFirstSubmission: boolean    // BOOLEAN NOT NULL
  code: string                  // TEXT NOT NULL
  score: number | null          // INT NULL
  submittedAt: string           // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// 질문
export interface Question {
  id: number                                    // PRIMARY KEY AUTO_INCREMENT
  studentId: number                             // INT NOT NULL, FOREIGN KEY (users.id)
  classId: number                               // INT NOT NULL, FOREIGN KEY (classes.id)
  weekNumber: number                            // INT NOT NULL
  title: string                                 // VARCHAR(200) NOT NULL
  content: string                               // TEXT NOT NULL
  priority: 'low' | 'normal' | 'urgent'        // ENUM('low', 'normal', 'urgent') NOT NULL
  answered: boolean                             // BOOLEAN DEFAULT FALSE
  createdAt: string                             // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// 답변
export interface Answer {
  id: number              // PRIMARY KEY AUTO_INCREMENT
  questionId: number      // INT NOT NULL, FOREIGN KEY (questions.id)
  professorId: number     // INT NOT NULL, FOREIGN KEY (users.id)
  content: string         // TEXT NOT NULL
  createdAt: string       // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

// 관리자 로그
export interface AdminLog {
  id: number                                                            // PRIMARY KEY AUTO_INCREMENT
  adminId: number                                                       // INT NOT NULL, FOREIGN KEY (users.id)
  action: 'change_user_status' | 'delete_user' | 'create_curriculum'  // ENUM NOT NULL
  targetUserId: number | null                                           // INT NULL, FOREIGN KEY (users.id)
  targetType: 'user' | 'curriculum' | 'class' | 'system' | null        // ENUM NULL
  targetId: number | null                                               // INT NULL
  reason: string | null                                                 // TEXT NULL
  details: string | null                                                // TEXT NULL (JSON)
  createdAt: string                                                     // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

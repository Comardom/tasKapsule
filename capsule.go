package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
	_ "modernc.org/sqlite"
)

type Capsule struct {
	ID                    int64   `json:"id"`
	CreatedAt             string  `json:"createdAt"`
	ContentText           string  `json:"contentText"`
	AudioPath             *string `json:"audioPath"`
	AttachmentPaths       *string `json:"attachmentPaths,omitempty"`
	Classification        string  `json:"classification"`
	IsWithSchedule        int     `json:"isWithSchedule"`
	ScheduleIcon          *string `json:"scheduleIcon,omitempty"`
	ScheduleContentText   *string `json:"scheduleContentText,omitempty"`
	ScheduleStartAt       *string `json:"scheduleStartAt,omitempty"`
	ScheduleEndAt         *string `json:"scheduleEndAt,omitempty"`
	ScheduleStatus        *string `json:"scheduleStatus,omitempty"`
	ScheduleDeadline      *string `json:"scheduleDeadline,omitempty"`
	AlarmClocks           *string `json:"alarmClocks,omitempty"`
}

type CapsulesResponse struct {
	Data    []Capsule `json:"data"`
	Total   int       `json:"total"`
	Page    int       `json:"page"`
	PerPage int       `json:"perPage"`
}

type scanner interface {
	Scan(dest ...any) error
}

func scanCapsule(s scanner) (Capsule, error) {
	var item Capsule
	err := s.Scan(
		&item.ID, &item.CreatedAt, &item.ContentText, &item.AudioPath,
		&item.AttachmentPaths, &item.Classification, &item.IsWithSchedule,
		&item.ScheduleIcon, &item.ScheduleContentText, &item.ScheduleStartAt,
		&item.ScheduleEndAt, &item.ScheduleStatus, &item.ScheduleDeadline,
		&item.AlarmClocks,
	)
	return item, err
}

const capsuleQuery = `
	SELECT id, created_at, content_text, audio_path,
	       attachment_paths, classification, is_with_schedule,
	       schedule_icon, schedule_content_text, schedule_start_at,
	       schedule_end_at, schedule_status, schedule_deadline,
	       alarm_clocks
	FROM capsules`

type CapsuleService struct {
	db          *sql.DB
	countCache  int
	countCacheAt time.Time
	countMu     sync.Mutex
}

var validClassifications = map[string]bool{
	"note": true, "urgent": true, "favourite": true, "sms": true, "inspiration": true,
}

var validScheduleStatuses = map[string]bool{
	"pending": true, "executing": true, "completed": true, "cancelled": true, "blocked": true,
}

func (s *CapsuleService) ServiceStartup(ctx context.Context, opts application.ServiceOptions) error {
	home, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("cannot find home directory: %w", err)
	}
	dbDir := filepath.Join(home, ".taskapsule", "data")
	os.MkdirAll(dbDir, 0755)
	dbPath := filepath.Join(dbDir, "app.db")
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return err
	}
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS capsules (
		id                  INTEGER PRIMARY KEY AUTOINCREMENT,
		created_at          TEXT NOT NULL DEFAULT (datetime('now','localtime')),
		content_text        TEXT NOT NULL DEFAULT '',
		audio_path          TEXT,
		attachment_paths    TEXT,
		classification      TEXT NOT NULL DEFAULT 'note',
		is_with_schedule    INTEGER NOT NULL DEFAULT 0,
		schedule_icon         TEXT,
		schedule_content_text TEXT,
		schedule_start_at     TEXT,
		schedule_end_at       TEXT,
		schedule_status       TEXT,
		schedule_deadline     TEXT,
		alarm_clocks        TEXT
	)`)
		if err != nil {
		return err
	}
	_, _ = db.Exec("PRAGMA journal_mode=WAL")
	_, _ = db.Exec("PRAGMA busy_timeout=5000")
	_, _ = db.Exec(`CREATE INDEX IF NOT EXISTS idx_capsules_classification ON capsules(classification)`)
	_, _ = db.Exec(`CREATE INDEX IF NOT EXISTS idx_capsules_is_with_schedule ON capsules(is_with_schedule)`)
	_, _ = db.Exec(`CREATE INDEX IF NOT EXISTS idx_capsules_schedule_start ON capsules(schedule_start_at)`)
	s.db = db
	return nil
}

func (s *CapsuleService) ServiceShutdown(ctx context.Context) error {
	if s.db != nil {
		return s.db.Close()
	}
	return nil
}

func (s *CapsuleService) GetCapsules(page, perPage int) (CapsulesResponse, error) {
	if page < 1 {
		page = 0
	}
	if perPage < 1 {
		perPage = 50
	}

	s.countMu.Lock()
	if time.Since(s.countCacheAt) > 30*time.Second {
		if err := s.db.QueryRow("SELECT COUNT(*) FROM capsules").Scan(&s.countCache); err != nil {
			s.countMu.Unlock()
			return CapsulesResponse{}, err
		}
		s.countCacheAt = time.Now()
	}
	total := s.countCache
	s.countMu.Unlock()

	query := capsuleQuery + " ORDER BY created_at DESC"
	var rows *sql.Rows
	var err error
	if page > 0 {
		offset := (page - 1) * perPage
		rows, err = s.db.Query(query+` LIMIT ? OFFSET ?`, perPage, offset)
	} else {
		rows, err = s.db.Query(query)
	}
	if err != nil {
		return CapsulesResponse{}, err
	}
	defer rows.Close()

	var capsules []Capsule
	for rows.Next() {
		item, err := scanCapsule(rows)
		if err != nil {
			return CapsulesResponse{}, err
		}
		capsules = append(capsules, item)
	}

	return CapsulesResponse{
		Data:    capsules,
		Total:   total,
		Page:    page,
		PerPage: perPage,
	}, nil
}

func (s *CapsuleService) CreateCapsule(item Capsule) (Capsule, error) {
	if !validClassifications[item.Classification] {
		return Capsule{}, errors.New("invalid classification")
	}
	if item.ScheduleStatus != nil && !validScheduleStatuses[*item.ScheduleStatus] {
		return Capsule{}, errors.New("invalid scheduleStatus")
	}
	res, err := s.db.Exec(`
		INSERT INTO capsules (
			content_text, audio_path, attachment_paths,
			classification, is_with_schedule,
			schedule_icon, schedule_content_text, schedule_start_at,
			schedule_end_at, schedule_status, schedule_deadline,
			alarm_clocks
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`,
		item.ContentText, item.AudioPath, item.AttachmentPaths,
		item.Classification, item.IsWithSchedule,
		item.ScheduleIcon, item.ScheduleContentText, item.ScheduleStartAt,
		item.ScheduleEndAt, item.ScheduleStatus, item.ScheduleDeadline,
		item.AlarmClocks,
	)
	if err != nil {
		return Capsule{}, err
	}

	newID, err := res.LastInsertId()
	if err != nil {
		return Capsule{}, err
	}
	row := s.db.QueryRow(capsuleQuery+" WHERE id = ?", newID)
	created, err := scanCapsule(row)
	if err != nil {
		return Capsule{}, err
	}

	return created, nil
}

func (s *CapsuleService) UpdateCapsule(id int, item Capsule) (Capsule, error) {
	if !validClassifications[item.Classification] {
		return Capsule{}, errors.New("invalid classification")
	}
	if item.ScheduleStatus != nil && !validScheduleStatuses[*item.ScheduleStatus] {
		return Capsule{}, errors.New("invalid scheduleStatus")
	}
	var exists int
	err := s.db.QueryRow("SELECT 1 FROM capsules WHERE id = ?", id).Scan(&exists)
	if err == sql.ErrNoRows {
		return Capsule{}, sql.ErrNoRows
	} else if err != nil {
		return Capsule{}, err
	}

	_, err = s.db.Exec(`
		UPDATE capsules SET
			content_text=?, audio_path=?, attachment_paths=?,
			classification=?, is_with_schedule=?,
			schedule_icon=?, schedule_content_text=?, schedule_start_at=?,
			schedule_end_at=?, schedule_status=?, schedule_deadline=?,
			alarm_clocks=?
		WHERE id=?
	`,
		item.ContentText, item.AudioPath, item.AttachmentPaths,
		item.Classification, item.IsWithSchedule,
		item.ScheduleIcon, item.ScheduleContentText, item.ScheduleStartAt,
		item.ScheduleEndAt, item.ScheduleStatus, item.ScheduleDeadline,
		item.AlarmClocks,
		id,
	)
	if err != nil {
		return Capsule{}, err
	}

	row := s.db.QueryRow(capsuleQuery+" WHERE id = ?", id)
	updated, err := scanCapsule(row)
	if err != nil {
		return Capsule{}, err
	}

	return updated, nil
}

func (s *CapsuleService) DeleteCapsule(id int) error {
	var exists int
	err := s.db.QueryRow("SELECT 1 FROM capsules WHERE id = ?", id).Scan(&exists)
	if err == sql.ErrNoRows {
		return sql.ErrNoRows
	} else if err != nil {
		return err
	}

	_, err = s.db.Exec("DELETE FROM capsules WHERE id = ?", id)
	return err
}

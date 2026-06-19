package main

import (
	"database/sql"
)

var db *sql.DB

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

func (a *App) GetCapsules(page, perPage int) (CapsulesResponse, error) {
	if page < 1 {
		page = 0
	}
	if perPage < 1 {
		perPage = 50
	}

	var total int
	if err := db.QueryRow("SELECT COUNT(*) FROM capsules").Scan(&total); err != nil {
		return CapsulesResponse{}, err
	}

	query := capsuleQuery + " ORDER BY created_at DESC"
	var rows *sql.Rows
	var err error
	if page > 0 {
		offset := (page - 1) * perPage
		rows, err = db.Query(query+` LIMIT ? OFFSET ?`, perPage, offset)
	} else {
		rows, err = db.Query(query)
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

func (a *App) CreateCapsule(item Capsule) (Capsule, error) {
	res, err := db.Exec(`
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

	newID, _ := res.LastInsertId()
	row := db.QueryRow(capsuleQuery+" WHERE id = ?", newID)
	created, err := scanCapsule(row)
	if err != nil {
		return Capsule{}, err
	}

	return created, nil
}

func (a *App) UpdateCapsule(id int, item Capsule) (Capsule, error) {
	var exists int
	err := db.QueryRow("SELECT 1 FROM capsules WHERE id = ?", id).Scan(&exists)
	if err == sql.ErrNoRows {
		return Capsule{}, sql.ErrNoRows
	} else if err != nil {
		return Capsule{}, err
	}

	_, err = db.Exec(`
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

	row := db.QueryRow(capsuleQuery+" WHERE id = ?", id)
	updated, err := scanCapsule(row)
	if err != nil {
		return Capsule{}, err
	}

	return updated, nil
}

func (a *App) DeleteCapsule(id int) error {
	var exists int
	err := db.QueryRow("SELECT 1 FROM capsules WHERE id = ?", id).Scan(&exists)
	if err == sql.ErrNoRows {
		return sql.ErrNoRows
	} else if err != nil {
		return err
	}

	_, err = db.Exec("DELETE FROM capsules WHERE id = ?", id)
	return err
}

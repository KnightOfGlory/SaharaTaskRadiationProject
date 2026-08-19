--CREATE TABLE users (
--    id BIGSERIAL PRIMARY KEY,
--    name VARCHAR(100) NOT NULL,
--    email VARCHAR(255) NOT NULL UNIQUE
--);


CREATE TABLE task_groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT
--    owner_id BIGINT NOT NULL,
--    position INTEGER NOT NULL DEFAULT 0,

--    CONSTRAINT fk_task_group_owner
--        FOREIGN KEY (owner_id)
--        REFERENCES users(id)
--        ON DELETE CASCADE
);

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    due_date TIMESTAMP,
--    position INTEGER NOT NULL DEFAULT 0,
--    assigned_to BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_task_group
        FOREIGN KEY (group_id)
        REFERENCES task_groups(id)
        ON DELETE CASCADE

--    CONSTRAINT fk_task_assignee
--        FOREIGN KEY (assigned_to)
--        REFERENCES users(id)
--        ON DELETE SET NULL
);

--CREATE INDEX idx_task_groups_owner
--    ON task_groups(owner_id);

CREATE INDEX idx_tasks_group
    ON tasks(group_id);

--CREATE INDEX idx_tasks_assigned_to
--    ON tasks(assigned_to);

CREATE TABLE app_settings (
    setting_key NVARCHAR(100) PRIMARY KEY,
    setting_value NVARCHAR(1000) NOT NULL,
    updated_at DATETIME2
);

CREATE TABLE password_reset_tokens (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    token NVARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expires_at DATETIME2 NOT NULL,
    used BIT NOT NULL DEFAULT 0,
    created_at DATETIME2
);

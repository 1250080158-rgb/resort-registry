

CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    phone NVARCHAR(255) NOT NULL,
    cmnd NVARCHAR(255) NOT NULL,
    address NVARCHAR(MAX) NOT NULL,
    role NVARCHAR(255) NOT NULL CHECK (role IN ('USER', 'STAFF', 'ADMIN')),
    status NVARCHAR(255) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'BANNED')),
    join_date DATETIME2,
    last_login DATETIME2,
    avatar NVARCHAR(500),
    total_bookings INT,
    total_spent FLOAT(53),
    password NVARCHAR(255) NOT NULL,
    failed_attempts INT,
    locked_until DATETIME2,
    created_at DATETIME2,
    updated_at DATETIME2
);

CREATE TABLE properties (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    resort NVARCHAR(255) NOT NULL,
    location NVARCHAR(255) NOT NULL,
    province NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price FLOAT(53) NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    area INT NOT NULL,
    type NVARCHAR(255) NOT NULL CHECK (type IN ('VILLA', 'PENTHOUSE', 'BUNGALOW', 'APARTMENT')),
    status NVARCHAR(255) NOT NULL CHECK (status IN ('AVAILABLE', 'BOOKED', 'MAINTENANCE')),
    transaction_type NVARCHAR(255) NOT NULL CHECK (transaction_type IN ('RENT', 'BUY')),
    amenities NVARCHAR(MAX),
    images NVARCHAR(MAX),
    rating FLOAT(53) NOT NULL,
    reviews INT NOT NULL,
    floor_level INT,
    featured BIT,
    created_at DATETIME2,
    updated_at DATETIME2
);

CREATE TABLE bookings (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    property_name NVARCHAR(255) NOT NULL,
    resort NVARCHAR(255) NOT NULL,
    user_name NVARCHAR(255) NOT NULL,
    user_email NVARCHAR(255) NOT NULL,
    user_phone NVARCHAR(255) NOT NULL,
    start_date DATETIME2 NOT NULL,
    end_date DATETIME2 NOT NULL,
    months INT NOT NULL,
    transaction_type NVARCHAR(255) NOT NULL CHECK (transaction_type IN ('RENT', 'BUY')),
    base_price FLOAT(53) NOT NULL,
    processing_fee FLOAT(53) NOT NULL,
    deposit FLOAT(53) NOT NULL,
    total_price FLOAT(53) NOT NULL,
    status NVARCHAR(255) NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    payment_status NVARCHAR(255) NOT NULL CHECK (payment_status IN ('UNPAID', 'PAID', 'REFUNDED')),
    payment_method NVARCHAR(255),
    notes NVARCHAR(MAX),
    created_at DATETIME2,
    updated_at DATETIME2,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE fees (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    type NVARCHAR(255) NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED')),
    amount FLOAT(53) NOT NULL,
    enabled BIT NOT NULL,
    description NVARCHAR(MAX),
    applies_to NVARCHAR(255),
    created_at DATETIME2,
    updated_at DATETIME2
);

CREATE TABLE payment_transactions (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    amount FLOAT(53) NOT NULL,
    method NVARCHAR(255) NOT NULL,
    status NVARCHAR(255) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'REFUNDED')),
    reference NVARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME2,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE appointments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    staff_id BIGINT NOT NULL,
    customer_name NVARCHAR(255),
    customer_email NVARCHAR(255),
    customer_phone NVARCHAR(255),
    staff_name NVARCHAR(255),
    appointment_date DATETIME2 NOT NULL,
    reason NVARCHAR(255) NOT NULL,
    notes NVARCHAR(MAX),
    status NVARCHAR(255) NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    created_at DATETIME2,
    updated_at DATETIME2,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (staff_id) REFERENCES users(id)
);

CREATE TABLE chats (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    staff_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_name NVARCHAR(255),
    sender_role NVARCHAR(255),
    message NVARCHAR(MAX) NOT NULL,
    is_read BIT,
    created_at DATETIME2,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (staff_id) REFERENCES users(id)
);

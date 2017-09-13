DROP TABLE IF EXISTS images;

CREATE TABLE images(
    id SERIAL PRIMARY KEY,
    image VARCHAR(300) NOT NULL,
    username VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    image_id INTEGER NOT NULL,
    username VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT images.username,images.image, images.title, images.description, comments.image_id, comments.username, comments.comment FROM comments RIGHT JOIN images ON images.id=comments.image_id WHERE images.id = 2;

SELECT * FROM images WHERE id = $1 ORDER BY id ASC

-- Initialize database with sample data
-- This script will be run after Prisma migration

-- Sample users (passwords are hashed with bcrypt)
INSERT INTO users (id, username, password, createdAt, updatedAt) VALUES
('user1', 'admin', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', datetime('now'), datetime('now')),
('user2', 'student1', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', datetime('now'), datetime('now')),
('user3', 'professor', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', datetime('now'), datetime('now'));

-- Sample posts
INSERT INTO posts (id, title, content, views, ownerId, createdAt, updatedAt) VALUES
('post1', 'Bem-vindos ao TellMe!', 'Este é o primeiro post do nosso fórum acadêmico. Aqui vocês podem compartilhar conhecimento e discutir temas relevantes.', 15, 'user1', datetime('now'), datetime('now')),
('post2', 'Dúvida sobre Algoritmos', 'Alguém pode me ajudar com complexidade de algoritmos? Estou com dificuldades para entender Big O.', 8, 'user2', datetime('now'), datetime('now')),
('post3', 'Recursos de Estudo', 'Compartilhando alguns recursos úteis para quem está estudando programação. Links nos comentários!', 23, 'user3', datetime('now'), datetime('now'));

-- Sample comments
INSERT INTO comments (id, content, ownerId, postId, parentCommentId, createdAt, updatedAt) VALUES
('comment1', 'Ótima iniciativa! Espero que o fórum seja muito útil para todos.', 'user2', 'post1', NULL, datetime('now'), datetime('now')),
('comment2', 'Big O é sobre como o tempo de execução cresce com o tamanho da entrada. O(n) significa linear, O(n²) quadrático, etc.', 'user3', 'post2', NULL, datetime('now'), datetime('now')),
('comment3', 'Obrigado pela explicação! Isso esclareceu muito.', 'user2', 'post2', 'comment2', datetime('now'), datetime('now'));

-- Sample reactions
INSERT INTO post_reactions (id, type, userId, postId, createdAt) VALUES
('reaction1', 'LIKE', 'user2', 'post1', datetime('now')),
('reaction2', 'LIKE', 'user3', 'post1', datetime('now')),
('reaction3', 'LIKE', 'user1', 'post2', datetime('now')),
('reaction4', 'LIKE', 'user3', 'post3', datetime('now'));

INSERT INTO comment_reactions (id, type, userId, commentId, createdAt) VALUES
('creaction1', 'LIKE', 'user1', 'comment1', datetime('now')),
('creaction2', 'LIKE', 'user2', 'comment2', datetime('now'));

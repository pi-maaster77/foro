CREATE DATABASE foro;
USE foro;
CREATE TABLE articulos(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'id',
    create_time DATETIME COMMENT 'fecha de creacion',
    nombre VARCHAR(16),
    contenido VARCHAR(255),
    autor VARCHAR(16),
    likes int ,
    imagenes VARCHAR(511)
) COMMENT 'tabla de articulos';

CREATE TABLE users(
    id int not null PRIMARY KEY AUTO_INCREMENT COMMENT 'id',
    name VARCHAR(16),
    passwd VARCHAR(16)
) COMMENT 'tabla de usuarios';
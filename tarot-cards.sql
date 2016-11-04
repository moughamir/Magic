CREATE TABLE IF NOT EXISTS `tarot` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `value` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
)DEFAULT CHARSET=UTF8 AUTO_INCREMENT=1 ;

INSERT INTO `tarot` (`name`, `value`) VALUES
("Le Bateleur", "1"),
("La Papesse", "2"),
("L'Impératrice", "3"),
("L'Empereur", "4"),
("Le Pape", "5"),
("L'Amoureux", "6"),
("Le Chariot", "7"),
("La Justice", "8"),
("L'Hermite", "9"),
("La Roue de Fortune", "10"),
("La Force", "11"),
("Le Pendu", "12"),
("L'Arcane sans nom", "13"),
("Tempérance", "14"),
("Le Diable", "15"),
("La Maison Dieu", "16"),
("L'Étoile", "17"),
("La Lune", "18"),
("Le Soleil", "19"),
("Le Jugement", "20"),
("Le Monde", "21"),
("Le Fol", "22");
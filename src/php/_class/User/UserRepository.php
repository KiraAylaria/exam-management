<?php

namespace User;
use PDO;
use User\UserModel;

//Klasse die sich um die Datenbankverbindung und dessen Abfragen kümmert
class UserRepository
{
    private $pdo;

    //Übergibt die PDO Verbindung vom Container
    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    //Fetcht einen Eintrag aus der Datenbanktabelle
    //Prepare & Execute werden benötigt wegen SQL Injektions :param und execute :param => $param ist hier Standard
    //FetchMode wird nur bei einem einzelnen Fetch benötigt
    //PDO::FETCH_CLASS wandelt das Array in die Attribute der Klasse um
    //Achtung! Die Namenskonvention des Models muss gleich der Datenbank sein (ansonsten AS benutzen)
    public function fetchUserById($id)
    {
        $query = $this->pdo->prepare("SELECT * FROM users WHERE `id` = :id");
        $query->execute(['id' => $id]);
        $query->setFetchMode(PDO::FETCH_CLASS, "User\\UserModel");
        $content = $query->fetch(PDO::FETCH_CLASS);

        return $content;
    }

    public function fetchUserByMail($mail)
    {
        $query = $this->pdo->prepare("SELECT * FROM users WHERE `email` = :mail");
        $query->execute(['mail' => $mail]);
        $query->setFetchMode(PDO::FETCH_CLASS, "User\\UserModel");
        $content = $query->fetch(PDO::FETCH_CLASS);

        return $content;
    }

    //Fetcht alle Einträge aus der Datenbanktabelle
    //Prepare & Execute werden nicht benötigt, da nach keinen Parametern gefiltert wird
    //Ansonsten siehe fetchUser Kommentare
    public function fetchUsers()
    {
        $query = $this->pdo->query("SELECT * FROM users");
        $contents = $query->fetchAll(PDO::FETCH_CLASS, "User\\UserModel");

        return $contents;
    }
}

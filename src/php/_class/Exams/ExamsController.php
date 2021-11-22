<?php
namespace Exams;

use Exams\ExamsRepository;
use Classes\ClassesRepository;
use Subjects\SubjectsRepository;

class ExamsController
{
    private $repository;
    private $classesRepository;

    //Übergibt das Repository vom Container
    public function __construct(ExamsRepository $repository, ClassesRepository $classesRepository, SubjectsRepository $subjectsRepository)
    {
        $this->repository = $repository;
        $this->classesRepository = $classesRepository;
        $this->subjectsRepository = $subjectsRepository;
    }

    //Rendert den Inhalt, hierzu bekommt die Methode den Dateipfad von view Ordner bis zum Dateinamen der View selbst und dem übergebenen Content
    //Beispiel siehe index()
    private function render($view, $content)
    {
        $twig = $content['twig'];
        $classes = $content['classes'];
        $subjects = $content['subjects'];
        $loginState = $content['loginState'];

        include "./templates/php/{$view}.php";
    }

    //Sucht sich alle Bars aus dem Repository(DB) heraus und übergibt Sie der render() Methode
    // public function index($id, $tpl, $twig)
    public function index($tpl, $twig, $loginState)
    {
        $classes = $this->classesRepository->fetchFavoriteClasses($_COOKIE['UserLogin'], false);
        $subjects = $this->subjectsRepository->fetchFavoriteSubjects($_COOKIE['UserLogin'], false);
        $this->render("{$tpl}", [
            'twig' => $twig,
            'classes' => $classes,
            'subjects' => $subjects,
            'loginState' => $loginState
        ]); 
    }

    public function queryExam($data, $action, $userId) {
        return $this->repository->queryExam($data, $action, $userId);
    }

    public function deleteExam($id) {
        return $this->repository->deleteExam($id);   
    }

    public function listFavoriteExams($userId) {
        return $this->repository->listFavoriteExams($userId);
    }

    public function fetchExams() {
        return $this->repository->fetchExams();
    }

    public function fetchExam($id) {
        return $this->repository->fetchExam($id);
    }

}

?>


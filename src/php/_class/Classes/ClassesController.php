<?php
namespace Classes;

use Classes\ClassesRepository;
use User\UserRepository;

class ClassesController
{
  private $repository;
  private $userRepository;

  //Übergibt das Repository vom Container
  //(DH)
  public function __construct(ClassesRepository $repository, UserRepository $userRepository)
  {
    $this->repository = $repository;
    $this->userRepository = $userRepository;
  }

  private function render($view, $content)
  {
    $classes = $content['classes'];
    $favoriteClasses = $content['favoriteClasses'];
    $twig = $content['twig'];
    $userName = $content['userName'];

    include "./templates/php/{$view}.php";
  }


  //Öffnet die Übersichtsseite der Klassen (Für Lehrer/Administratoren)
  //(DH)
  public function index($tpl, $twig)
  {
    //$userId = $auth->user->id;
    $userId = 2;
    $user = $this->userRepository->fetchUserById($userId);

    if($user){
      $favoriteClasses = $this->repository->fetchFavoriteClasses($userId);
      $classes = $this->repository->fetchClasses();

      $this->render("{$tpl}", [
          'classes' => $classes,
          'favoriteClasses' => $favoriteClasses,
          'userName' => $user->first_name . " " . $user->last_name,
          'twig' => $twig,
      ]);
    }else{
      header("Location: http://localhost:8000/?page=dashboard");
    }
  }

}

<?php

    require_once './vendor/autoload.php';
    require_once './autoloader.php';

    use Symfony\Component\HttpFoundation\Request;

    class PageController
    {
        public $twig;
        public $container;
        public $GET;

        public function __construct()
        {
            $this->container = new Core\Container();
            $this->GET = $_GET;
        }

        public function display()
        {
            $request = Request::createFromGlobals();
            $uri = $request->getPathInfo();

            $fileSystem = './templates/twig/';

            $loader = new Twig_Loader_Filesystem($fileSystem);
            $this->twig = new Twig_Environment($loader, array(
                'cache' => false,
                'debug' => true,
                'strict_variables' => true
            ));
            $this->twig->addExtension(new Twig_Extension_Debug());

            $filter = new \Twig\TwigFilter('preg_replace', 
                function ($subject, $pattern, $replacement) {
                    $rtn = preg_replace($pattern, $replacement, $subject);
                    if (strlen(trim($rtn)) > 0) {
                        return $rtn;
                    } else {
                        return false;
                    }
                }
            );
            $this->twig->addFilter($filter);

            $formatDate = new \Twig\TwigFunction('formatDate', function($date) {
                // Gibt das Datum im Format dd.mm.yyyy zurück
                return substr($date, 8, 2) . "." . substr($date, 5, 2) . "." . substr($date, 0, 4);
            });
            $formatTime = new \Twig\TwigFunction('formatTime', function($time) {
                // Gibt das Datum im Format dd.mm.yyyy zurück
                return substr($time, 0, 2) . ":" . substr($time, 3, 2);
            });
            $this->twig->addFunction($formatDate);
            $this->twig->addFunction($formatTime);
            $loginController = $this->container->make("loginController");

           # if (!isset($this->GET['page']) || !$this->checkLogin($loginController)) {
            if (!isset($this->GET['page'])){ 
            $loginController->index("login", $this->twig);
            } else {
                if (file_exists('templates/twig/' . strtolower($this->GET['page']) . ".twig")) {
                    $pageController = $this->container->make(strtolower($this->GET['page']) . "Controller");
                    $pageController->index(strtolower($this->GET['page']), $this->twig);
                } else {
                    echo $this->twig->render("404.twig", array(
                        'pageTitle' => 'Examinator - 404',
                        'applicationName' => 'Examinator',
                        'tpl' => '404'
                    ));
                }
            }
        }
        private function checkLogin ($loginController){
            $rtn = false;
            if (session_status() === PHP_SESSION_ACTIVE){
                if (isset($_COOKIE["UserLogin"])){
                    $userID = $_COOKIE["UserLogin"];
                    $sessionID = $loginController->getSessionID($userID);
                    if( session_id() == $sessionID){
                        $rtn = true;
                    }
                } else if(isset($_COOKIE["ClassesLogin"])){
                    $rtn = true;
                }        
            }
            return $rtn;
        }
    }
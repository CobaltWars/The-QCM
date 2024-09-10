import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Check, ArrowLeft } from 'lucide-react';

// Hook personnalisé pour la gestion du quiz
const useQuiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentView, setCurrentView] = useState('menu');
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const handleQuizCreated = (newQuiz) => {
    setQuiz(newQuiz);
    setCurrentView('menu');
  };

  const handleQuizFinished = (score) => {
    setQuizFinished(true);
    setFinalScore(score);
  };

  const restartQuiz = () => {
    setQuizFinished(false);
    setFinalScore(0);
    setCurrentView('play');
  };

  const backToMenu = () => {
    setCurrentView('menu');
    setQuizFinished(false);
    setFinalScore(0);
  };

  return {
    quiz, setQuiz, currentView, setCurrentView, quizFinished, finalScore,
    handleQuizCreated, handleQuizFinished, restartQuiz, backToMenu
  };
};

const MainMenu = ({ onCreateQuiz, onPlayQuiz, hasQuiz }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
    >
      <Card className="w-[300px] mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Menu Principal QCM</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button onClick={onCreateQuiz} className="w-full">Éditeur de QCM</Button>
          <Button onClick={onPlayQuiz} className="w-full" disabled={!hasQuiz}>
            Jouer au QCM
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const QuizCreator = ({ onQuizCreated, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState(['']);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [timeLimit, setTimeLimit] = useState(30);
  const [error, setError] = useState('');

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (correctAnswer === index) {
      setCorrectAnswer(null);
    } else if (correctAnswer > index) {
      setCorrectAnswer(correctAnswer - 1);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateQuestion = () => {
    if (currentQuestion.trim() === '') {
      setError('Veuillez entrer une question.');
      return false;
    }
    if (options.length < 2) {
      setError('Veuillez ajouter au moins deux options.');
      return false;
    }
    if (options.some(opt => opt.trim() === '')) {
      setError('Toutes les options doivent être remplies.');
      return false;
    }
    if (correctAnswer === null) {
      setError('Veuillez sélectionner une réponse correcte.');
      return false;
    }
    setError('');
    return true;
  };

  const addQuestion = () => {
    if (validateQuestion()) {
      setQuestions([...questions, { question: currentQuestion, options, correctAnswer, timeLimit }]);
      setCurrentQuestion('');
      setOptions(['']);
      setCorrectAnswer(null);
      setTimeLimit(30);
    }
  };

  const createQuiz = () => {
    if (questions.length > 0) {
      onQuizCreated(questions);
    } else {
      setError('Veuillez ajouter au moins une question avant de créer le quiz.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <Card className="w-[400px] mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Créer un Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <Input 
            value={currentQuestion} 
            onChange={(e) => setCurrentQuestion(e.target.value)} 
            placeholder="Entrez la question" 
          />
          <AnimatePresence>
            {options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex items-center space-x-2"
              >
                <Input 
                  value={option} 
                  onChange={(e) => updateOption(index, e.target.value)} 
                  placeholder={`Option ${index + 1}`} 
                />
                <Button
                  onClick={() => setCorrectAnswer(index)}
                  variant={correctAnswer === index ? 'default' : 'outline'}
                  size="icon"
                >
                  <Check className={`h-4 w-4 ${correctAnswer === index ? 'text-white' : ''}`} />
                </Button>
                {index > 0 && (
                  <Button onClick={() => removeOption(index)} variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <Button onClick={addOption} className="w-full flex items-center justify-center">
            <Plus className="mr-2 h-4 w-4" /> Ajouter une option
          </Button>
          <Input 
            type="number" 
            value={timeLimit} 
            onChange={(e) => setTimeLimit(Number(e.target.value))} 
            placeholder="Temps limite (secondes)" 
            min="5"
            max="120"
          />
          <Button onClick={addQuestion} className="w-full">Ajouter la Question</Button>
          <Button onClick={createQuiz} className="w-full">Créer le Quiz</Button>
          <Button onClick={onBack} variant="outline" className="w-full flex items-center justify-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au Menu
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const QuizPlayer = ({ quiz, onQuizFinished, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz[0].timeLimit);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    let timer;
    if (!answered && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setAnswered(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 || answered) {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [timeLeft, answered, currentQuestionIndex]);

  const handleAnswer = (selectedIndex) => {
    if (!answered) {
      setAnswered(true);
      setSelectedAnswer(selectedIndex);
      if (selectedIndex === quiz[currentQuestionIndex].correctAnswer) {
        setScore(score + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(quiz[currentQuestionIndex + 1].timeLimit);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      onQuizFinished(score);
    }
  };

  return (
    <motion.div
      key={currentQuestionIndex}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <Card className="w-[400px] mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Question {currentQuestionIndex + 1}/{quiz.length}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">{quiz[currentQuestionIndex].question}</h3>
          <Progress value={(timeLeft / quiz[currentQuestionIndex].timeLimit) * 100} />
          <p>Temps restant : {timeLeft} secondes</p>
          <AnimatePresence>
            {quiz[currentQuestionIndex].options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Button 
                  onClick={() => handleAnswer(index)}
                  disabled={answered}
                  className={`w-full mb-2 ${answered 
                    ? index === quiz[currentQuestionIndex].correctAnswer 
                      ? 'bg-green-500' 
                      : index === selectedAnswer
                        ? 'bg-red-500'
                        : ''
                    : ''}`}
                >
                  {option}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          <p className="font-bold">Score : {score}</p>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button onClick={handleNextQuestion} className="w-full">
                {currentQuestionIndex < quiz.length - 1 ? 'Question suivante' : 'Terminer le quiz'}
              </Button>
            </motion.div>
          )}
          <Button onClick={onBack} variant="outline" className="w-full flex items-center justify-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au Menu
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const QuizResults = ({ score, totalQuestions, onRestart, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <Card className="w-[400px] mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Résultats du Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Vous avez obtenu {score} sur {totalQuestions} questions.
            </AlertDescription>
          </Alert>
          <Button onClick={onRestart} className="w-full">Recommencer</Button>
          <Button onClick={onBack} variant="outline" className="w-full flex items-center justify-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au Menu
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const App = () => {
  const {
    quiz, currentView, quizFinished, finalScore,
    handleQuizCreated, handleQuizFinished, restartQuiz, backToMenu, setCurrentView
  } = useQuiz();

  return (
    <div className="container mx-auto p-4">
      <AnimatePresence mode="wait">
        {currentView === 'menu' && (
          <MainMenu 
            key="menu"
            onCreateQuiz={() => setCurrentView('create')} 
            onPlayQuiz={() => setCurrentView('play')}
            hasQuiz={quiz !== null}
          />
        )}
        {currentView === 'create' && (
          <QuizCreator key="create" onQuizCreated={handleQuizCreated} onBack={backToMenu} />
        )}
        {currentView === 'play' && !quizFinished && quiz && (
          <QuizPlayer key="play" quiz={quiz} onQuizFinished={handleQuizFinished} onBack={backToMenu} />
        )}
        {quizFinished && (
          <QuizResults 
            key="results"
            score={finalScore} 
            totalQuestions={quiz.length} 
            onRestart={restartQuiz} 
            onBack={backToMenu} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

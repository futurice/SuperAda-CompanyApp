import React, {PropTypes, Component} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import reactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import PuzzleContainer from '../puzzle/PuzzleContainer';
import * as GameState from './GameState';
import AppStyles from '../AppStyles';

const resetGame = (component) => (event) => {
  event.preventDefault();

  const {
    deleteGame,
    initialiseGame,
    resumeGame
  } = component.props;

  deleteGame();
  initialiseGame();
};

const startGame = (component) => (event) => {
  event.preventDefault();

  const {
    resumeGame
  } = component.props;

  resumeGame();
};

const togglePause = (component) => (event) => {
  event.preventDefault();

  const {
    pauseGame,
    resumeGame,
    gameState
  } = component.props;

  const {
    gameStatus
  } = gameState;

  if (gameStatus === GameState.GAME_PAUSE) {
    resumeGame();
  } else {
    pauseGame();
  }
};

const tick = (component) => {
  const {
    gameState,
    tickTimer
  } = component.props;

  const {
    gameStatus
  } = gameState;

  if (gameStatus === GameState.GAME_CREATED ||
    gameStatus === GameState.GAME_RUNNING) {
    tickTimer();
  }

  component.setTimeout(
    () => tick(component),
    1000 * 60 // 1 minute
  );
};

class GameView extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {
      initialiseGame,
      gameState,
      refresh
    } = this.props;

    const {
      gameStatus
    } = gameState;

    refresh();

    if (gameStatus === GameState.NO_GAME) {
      initialiseGame();
    }
  }

  componentDidMount() {
    // Start the timer
    tick(this);
  }

  // TODO: render grew too big
  render() {
    const {
      gameState,
      quizStatus,
      setQuizPoints
    } = this.props;

    const {
      puzzle,
      solution,
      gameStatus,
      wordsToFind,
      timer
    } = gameState;

    let contentView;
    const timePassed = `${timer}m`;
    let footerText = `Time: ${timePassed} ${gameStatus === GameState.GAME_PAUSE ? '(paused)' : ''}`;
    if (gameStatus === GameState.GAME_COMPLETED) {
      footerText = `Game ended in ${timePassed}`;
    }

    // If server thinks we're done, but redux store state says we're not,
    // show total points from server and offer to restart
    if (!quizStatus.loading && quizStatus.data.done && gameStatus !== GameState.GAME_COMPLETED) {
      return (
        <View style={styles.gameContainer}>
          <StatusBar
            backgroundColor={AppStyles.darkRed}
            animated={false}
            barStyle="light-content"
          />
          <Text style={styles.congratsText}>
            Congratulations!
          </Text>
          <Text style={styles.congratsBodyText}>
            {`Puzzle has been completed.`}
          </Text>
          <Text style={styles.congratsBodyText}>
            {`Total points: ${quizStatus.data.points}`}
          </Text>
          <Text style={styles.retryText}>
            {`You can try again, but this will reset your score to zero until you complete the quiz again!`}
          </Text>
          <TouchableOpacity
            style={[{marginTop: 10}, styles.button]}
            onPress={resetGame(this)}>
              <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (gameStatus) {
      case GameState.GAME_CREATED: {
        contentView = (
          <View style={styles.gameContainer}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.titleText}>
                Super-Ada quiz!
              </Text>
              <Text style={styles.welcomeText}>
                Welcome to the Super-Ada quiz!
              </Text>
              <Text style={styles.welcomeText}>
                Score points by finding IT-related words, you get points by finding
                as many words as possible and by being quick!
              </Text>
              <Text style={styles.welcomeText}>
                Time limit: 10 minutes.
              </Text>
              <Text style={styles.welcomeText}>
                You can retry the quiz, but doing so will reset your points!
              </Text>
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={startGame(this)}>
              <Text style={styles.buttonText}>Start!</Text>
            </TouchableOpacity>
          </View>
        );

        break;
      }
      case GameState.GAME_PAUSE:
      case GameState.GAME_RUNNING: {
        contentView = (
          <View style={styles.gameContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.wordsToFind}>
                Words to find: {wordsToFind || solution.found.length}
              </Text>
              <Text style={styles.timer}>
                {footerText}
              </Text>
            </View>
            <PuzzleContainer
              puzzle={puzzle}
              solution={solution}
              gameStatus={gameStatus}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                  style={styles.button}
                  onPress={togglePause(this)}>
                <Text style={styles.buttonText}>{gameStatus === GameState.GAME_RUNNING ? 'Pause' : 'Resume'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={gameStatus === GameState.GAME_RUNNING ? styles.buttonDisabled : styles.button}
                disabled={gameStatus === GameState.GAME_RUNNING}
                onPress={resetGame(this)}>
                <Text style={styles.buttonText}>Restart</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

        break;
      }
      case GameState.GAME_COMPLETED: {
        // TODO: move this into a config
        const pointsPerMinute = 10;
        const pointsPerWord = 5;
        const pointsCompleted = 100;
        const maxMinutes = 15;

        // Points per minutes
        const minutesPoints = Math.max((maxMinutes - timer) * pointsPerMinute, 0);

        const wordsFound = solution.found.length - wordsToFind;
        const wordsPoints = wordsFound * pointsPerWord;

        const totalPoints = Math.round(pointsCompleted + wordsPoints + minutesPoints);

        if (!quizStatus.data.done) {
          setQuizPoints(totalPoints);
        }

        contentView = (
          <View style={styles.gameContainer}>
            <Text style={styles.congratsText}>
              Congratulations!
            </Text>
            <Text style={styles.congratsBodyText}>
              {`Puzzle completed in ${timer} mins: ${minutesPoints} points`}
            </Text>
            <Text style={styles.congratsBodyText}>
              {`${wordsFound} words (${pointsPerWord} points per word): ${wordsPoints} points`}
            </Text>
            <Text style={styles.congratsBodyText}>
              {wordsFound === solution.found.length
                ? `You have found all the words: ${pointsCompleted} points`
                : 'You have not completed the puzzle: 0 points'
              }
            </Text>
            <Text style={styles.congratsBodyText}>
              {`Total points: ${totalPoints}`}
            </Text>
            <Text style={styles.retryText}>
              {`You can try again, but this will reset your score to zero until you complete the quiz again!`}
            </Text>
            <TouchableOpacity
              style={[{marginTop: 10}, styles.button]}
              onPress={resetGame(this)}>
                <Text style={styles.buttonText}>New Game</Text>
            </TouchableOpacity>
          </View>
        );

        break;
      }

      case GameState.NO_GAME:
      default: {
        contentView = (
          <ActivityIndicator
            animating
            style={styles.activityIndicator}
            size='large'
          />
        );
      }
    }

    return (
      <View style={styles.gameContainer}>
        <StatusBar
          backgroundColor={AppStyles.darkRed}
          animated={false}
          barStyle="light-content"
        />
        {contentView}
      </View>
    );
  }
}

GameView.propTypes = {
  puzzle: PropTypes.array,
  solution: PropTypes.object,
  gameState: PropTypes.object.isRequired,
  initialiseGame: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
  quizStatus: PropTypes.object.isRequired,
  setQuizPoints: PropTypes.func.isRequired
};

reactMixin(GameView.prototype, TimerMixin);

const centered = {
  alignSelf: 'center'
};

const styles = StyleSheet.create({
  gameContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: AppStyles.darkRed
  },
  welcomeContainer: {
    flex: 1
  },
  activityIndicator: {
    ...centered
  },
  headerContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingLeft: 5,
    paddingRight: 5
  },
  wordsToFind: {
    color: AppStyles.white,
    fontSize: AppStyles.fontSize,
    textAlign: 'center'
  },
  timer: {
    color: AppStyles.white,
    fontSize: AppStyles.fontSize,
    textAlign: 'center'
  },
  congratsText: {
    paddingTop: 20,
    marginBottom: 40,
    fontSize: AppStyles.titleFontSize,
    fontWeight: 'bold',
    color: AppStyles.white,
    textAlign: 'center'
  },
  congratsBodyText: {
    ...centered,
    color: AppStyles.white,
    marginTop: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontSize: AppStyles.fontSize
  },
  retryText: {
    ...centered,
    color: AppStyles.white,
    marginTop: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: AppStyles.fontSize
  },
  titleText: {
    ...centered,
    color: AppStyles.white,
    marginTop: 10,
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: AppStyles.headerFontSize
  },
  welcomeText: {
    ...centered,
    color: AppStyles.white,
    marginTop: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontSize: AppStyles.fontSize
  },
  button: {
    backgroundColor: AppStyles.lightRed,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    elevation: 5,
    height: 70,
    marginBottom: 30,
    marginHorizontal: 20
  },
  buttonDisabled: {
    backgroundColor: AppStyles.darkRed,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    elevation: 5,
    height: 70,
    marginBottom: 30,
    marginHorizontal: 20
  },
  buttonContainer: {
    flexDirection: 'row'
  },
  buttonText: {
    color: AppStyles.white,
    fontSize: AppStyles.fontSize,
    fontWeight: 'bold'
  }
});

export default GameView;

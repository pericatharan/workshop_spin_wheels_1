/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import TimerMixin from 'react-timer-mixin';
import sample from 'lodash.sample';
import _ from 'lodash';
import randomstring from 'random-string';
import AnimatedSprite from 'react-native-animated-sprite';
import AnimatedSpriteMatrix from 'rn-animated-sprite-matrix';
import Sound from 'react-native-sound';
import letterSprite from './sprites/letterSprite/letterSprite';
//import spinWheelsJson from './json/spin_wheels';
import wordListUtil from './json/wordListUtil';
import wordImages from './js/wordimages';
import wordSounds from './js/wordsounds';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const alphabetList = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

var targetWordList;

//var targetWordList = ["cat", "can", "hat", "hen"];
//var wordList = ["cat", "hen"];

var wheelLetters1 = [];
var wheelLetters2 = [];
var wheelLetters3 = [];

var targetImage;
var targetWord;
var targetSound;

var letter1;
var letter2;
var letter3;

var wordsCompleted;
var wordsShown;
var wordListLevel;

export default class workshop_spin_wheels_1 extends Component {

  constructor(props) {
    super(props)
    this.state = {
      cells: [],
      imageOpacity: 0,
      //buttonImageOpacity: 0.4,
      buttonImageC1Opacity: 0.4,
      buttonImageC2Opacity: 0.4,
      buttonImageC3Opacity: 0.4,
      buttonDisabled: true,
      spinButtonDisabled: false,
      spinButtonBackgroundColor: 'royalblue',
      spinButtonTextOpacity: 1,
      animatedMatrixPointerEvents: 'none',
    }

    this.activeCells = [true, true, true];
    this.animationKeys = ['IDLELETTER1', 'IDLELETTER2', 'IDLELETTER3'];
    this.loopAnimation = _.fill(Array(this.activeCells.length), false);
    this.sprites = _.fill(Array(this.activeCells.length), letterSprite);
    this.scale = {image: 1};
    this.cellSpriteScale = 1;
    this.numColumns = 3;
    this.numRows = 1;
    this.wheelsSound = new Sound('bubble_machine.mp3', Sound.MAIN_BUNDLE);

    wordListLevel = 0;
    wordsCompleted = 0;
    wordsShown = [];
    targetWordList = wordListUtil.selectWordList(wordListLevel);
    //this.selectWordList();
    //this.splitWords();
    //this.addConsonant();

  }

  componentWillMount () {
      this.setState({cells: this.createCellObjsArray()});
  }

  createCellObjsArray () {
    const cells = _.map(this.activeCells , (active, index) => ({
      sprite: this.sprites[index],
      animationKey: this.animationKeys[index],
      loopAnimation: this.loopAnimation[index],
      uid: randomstring({ length: 7 }),
      active,
    }));
    return cells;
  }

  matrixLocation () {
    const size = letterSprite.size;
    const width = this.numColumns * size.width * this.cellSpriteScale;
    const height = this.numRows * size.height * this.cellSpriteScale;
    const top = 22;
    const left = (screenWidth/4 * 1.06) - (width/2);
    const location = {top, left};
    return location;
  }

  matrixSize () {
    const size = letterSprite.size;
    const width = this.numColumns * size.width * this.cellSpriteScale;
    const height = this.numRows * size.height * this.cellSpriteScale;
    return {width, height};
  }

  showArrowButtons() {
    var timeoutId = TimerMixin.setTimeout ( () => {
      this.setState({buttonImageC1Opacity: 0.7});
    }, 1000);

    var timeoutId2 = TimerMixin.setTimeout ( () => {
      this.setState({buttonImageC2Opacity: 0.7});
    }, 1500);

    var timeoutId3 = TimerMixin.setTimeout ( () => {
      this.setState({buttonImageC3Opacity: 0.7});
    }, 2000);

  }

  // Function called by Spin Button to spin the wheels
  // A word from the target word list will be selected
  // via the nextWord() function
  cellPressed (cellObj, position) {
    const cells = _.cloneDeep(this.state.cells);

    this.setState({spinButtonDisabled: true});
    //this.setState({buttonImageOpacity: 0.6});
    this.setState({buttonImageC1Opacity: 0.3});
    this.setState({buttonImageC2Opacity: 0.3});
    this.setState({buttonImageC3Opacity: 0.3});
    this.setState({spinButtonTextOpacity: 0.5});
    this.setState({spinButtonBackgroundColor: 'gray'});
    this.setState({imageOpacity: 0});
    this.setState({animatedMatrixPointerEvents: 'none'});
    this.nextWord();

    cells[0].animationKey = 'SPINLETTER1';
    cells[1].animationKey = 'SPINLETTER2';
    cells[2].animationKey = 'SPINLETTER3';

    cells[0].loopAnimation = true;
    cells[0].uid = randomstring({length: 7});
    cells[1].loopAnimation = true;
    cells[1].uid = randomstring({length: 7});
    cells[2].loopAnimation = true;
    cells[2].uid = randomstring({length: 7});

    this.setState({cells});
    this.stopWheels();
    //this.playSpinningSound();
    this.wheelsSound.play();

  }

  // This function is called to stop the wheels from spinning
  // The word created by the wheels will be checked against the
  // target word list via the checkWord function
  stopWheels() {
    const cells = _.cloneDeep(this.state.cells);
    this.setState({buttonDisabled: true});

    var timeoutId = TimerMixin.setTimeout( () => {
      cells[0].animationKey = 'STOPLETTER1';
      cells[1].animationKey = 'STOPLETTER2';
      cells[2].animationKey = 'STOPLETTER3';

      cells[0].loopAnimation = true;
      cells[0].uid = randomstring({length: 7});
      cells[1].loopAnimation = true;
      cells[1].uid = randomstring({length: 7});
      cells[2].loopAnimation = true;
      cells[2].uid = randomstring({length: 7});

      this.wheelsSound.stop( () => this.wheelsSound.release() );
      this.showArrowButtons();
      this.setState({cells});
      this.checkWord(letter1, letter2, letter3);
      this.onStopWheelsSetState();
    }, 2500);

  }

  // Set the state of buttons and images when the wheels stop spinning
  onStopWheelsSetState() {
    var timeoutId = TimerMixin.setTimeout( () => {
      this.setState({imageOpacity: 1});
      //this.setState({buttonImageOpacity: 1});
      //this.setState({buttonDisabled: false});
      //this.setState({spinButtonDisabled: false});
      //this.setState({spinButtonBackgroundColor: 'royalblue'});
      //this.setState({spinButtonTextOpacity: 1});
      //this.onSpinButtonPress();
    }, 100);

    var timeoutId2 = TimerMixin.setTimeout( () => {
      //this.setState({imageOpacity: 1});
      this.setState({buttonImageOpacity: 1});
      this.setState({buttonDisabled: false});
      this.setState({spinButtonDisabled: false});
      this.setState({spinButtonBackgroundColor: 'royalblue'});
      this.setState({spinButtonTextOpacity: 1});
      this.setState({animatedMatrixPointerEvents: 'auto'});
      this.setState({buttonImageC1Opacity: 1});
      this.setState({buttonImageC2Opacity: 1});
      this.setState({buttonImageC3Opacity: 1});
      //this.onSpinButtonPress();
    }, 2500);

  }

  // Function to stop the wheels individually. This function
  // is called by the Up and Down arrows. The word created by the
  // three wheels will be checked against the target word list via
  // the checkWord function
  stopIndividualWheels (wheelNumber) {
    const cells = _.cloneDeep(this.state.cells);

    cells[wheelNumber - 1].animationKey = 'STOPLETTER' + wheelNumber;
    cells[wheelNumber - 1].loopAnimation = true;
    cells[wheelNumber - 1].uid = randomstring({length: 7});

    this.setState({cells});
    this.setState({imageOpacity: 0});

    console.log('stopIndWheels (letter1): ' + letter1);
    console.log('stopIndWheels (letter2): ' + letter2);
    console.log('stopIndWheels (letter3): ' + letter3);
    console.log('wordListLevel: ' + wordListLevel);
    this.checkWord(letter1, letter2, letter3);

  }

  // test function only
  /*
  getCurrentIndex (wheelNumber) {
    if (wheelNumber == 1) {
      letter1 = "";
      exports.letter1 = letter1;
      this.stopIndividualWheels(wheelNumber);
    } else if (wheelNumber == 2) {
      letter2 = "";
      exports.letter2 = letter2;
      this.stopIndividualWheels(wheelNumber);
    } else {
      letter3 = "";
      exports.letter3 = letter3;
      this.stopIndividualWheels(wheelNumber);
    }
  }
  */

  // Function for the Down arrow buttons. This will spin the respective
  // wheel one alphabet down
  onArrowClickDown (wheelNumber) {
    var wl = require('./json/wordListUtil.js');
    var wheelLetters1 = wl.wheelLetters1;
    var wheelLetters2 = wl.wheelLetters2;
    var wheelLetters3 = wl.wheelLetters3;

    var wheel = eval('wheelLetters' + wheelNumber);
    var wheelLength = wheel.length;
    var currentIndexInWheel = wheel.indexOf(eval('letter'+ wheelNumber));

    if (currentIndexInWheel < (wheelLength - 1)) {
      if (wheelNumber == 1) {
        letter1 = wheel[currentIndexInWheel + 1];
        exports.letter1 = letter1;
        this.stopIndividualWheels(wheelNumber);

      } else if (wheelNumber == 2) {
        letter2 = wheel[currentIndexInWheel + 1];
        exports.letter2 = letter2;
        this.stopIndividualWheels(wheelNumber);

      } else {
        letter3 = wheel[currentIndexInWheel + 1];
        exports.letter3 = letter3;
        this.stopIndividualWheels(wheelNumber);

      }

    } else {

      if (wheelNumber == 1) {
        letter1 = wheel[0];
        exports.letter1 = letter1;
        this.stopIndividualWheels(wheelNumber);

      } else if (wheelNumber == 2) {
        letter2 = wheel[0];
        exports.letter2 = letter2;
        this.stopIndividualWheels(wheelNumber);

      } else {
        letter3 = wheel[0];
        exports.letter3 = letter3;
        this.stopIndividualWheels(wheelNumber);

      }
    }

  }

  // Function for the Down arrow buttons. This will spin the respective
  // wheel one alphabet up
  onArrowClickUp(wheelNumber) {
    var wl = require('./json/wordListUtil.js');
    var wheelLetters1 = wl.wheelLetters1;
    var wheelLetters2 = wl.wheelLetters2;
    var wheelLetters3 = wl.wheelLetters3;

    var wheel = eval('wheelLetters' + wheelNumber);
    var wheelLength = wheel.length;
    var currentIndexInWheel = wheel.indexOf(eval('letter' + wheelNumber));

    if (currentIndexInWheel > 0) {
      if (wheelNumber == 1) {
        letter1 = wheel[currentIndexInWheel - 1];
        exports.letter1 = letter1;
        this.stopIndividualWheels(wheelNumber);

      } else if (wheelNumber == 2) {
        letter2 = wheel[currentIndexInWheel - 1];
        exports.letter2 = letter2;
        this.stopIndividualWheels(wheelNumber);

      } else {
        letter3 = wheel[currentIndexInWheel - 1];
        exports.letter3 = letter3;
        this.stopIndividualWheels(wheelNumber);

      }

    } else {
      if (wheelNumber == 1) {
        letter1 = wheel[wheelLength - 1];
        exports.letter1 = letter1;
        this.stopIndividualWheels(wheelNumber);

      } else if (wheelNumber == 2) {
        letter2 = wheel[wheelLength - 1];
        exports.letter2 = letter2;
        this.stopIndividualWheels(wheelNumber);

      } else {
        letter3 = wheel[wheelLength - 1];
        exports.letter3 = letter3;
        this.stopIndividualWheels(wheelNumber);

      }
    }

  }

  // Function to check if the word created by the wheels are in the
  // target word list. If yes, the image will show and the audio will play
  checkWord(l1, l2, l3) {
    var newWord = l1 + l2 + l3;
    var newWordInList = (targetWordList.indexOf(newWord) > -1);
    console.log('New Word: ' + newWord);
    console.log('Is word in List: ' + newWordInList);

    if (newWordInList == true) {

      if ((wordsShown.indexOf(newWord) > -1) == false) {
        wordsShown.push(newWord);
        wordsCompleted = wordsCompleted + 1;
        this.checkPercentComplete();
      }

      targetWord = newWord;
      //targetImage = targetWord + ".jpg";
      targetSound = targetWord + '.wav';
      this.setState({imageOpacity: 1});
      //this.setState({buttonDisabled: false});
      this.onSpinButtonPress();
      //this.onStopWheelsSetState();
    }

  }

  // Function to check percent of words completed from selected target word list
  checkPercentComplete() {
    var wordListLength = targetWordList.length;
    var percentCompleted = (wordsCompleted/wordListLength) * 100;

    console.log('Words completed: ' + wordsCompleted);
    console.log('Total words in list: ' + wordListLength);
    console.log('Percent completed: ' + percentCompleted);
    console.log('wordsShown[]: ' + wordsShown);

    // Checks if 50% of word list has been formed
    // If yes, word list is changed to the next level
    // Currently, the lists are being rotated i.e. 1 to 2 to 3 to 1 to 2 to 3...
    if (percentCompleted >= 50) {
      var jsonLength = wordListUtil.getJsonLength();
      if (wordListLevel < (jsonLength - 1)) {
        wordListLevel = wordListLevel + 1;
        console.log('wordlistlevel: ' + wordListLevel);
      } else {
        wordListLevel = 0;
        console.log('wordlistlevel: ' + wordListLevel);
      }

      wordsCompleted = 0;
      wordsShown = [];
      //this.selectWordList();
      targetWordList = wordListUtil.selectWordList(wordListLevel);
    }
  }

  // Function to select the target word list from JSON file
  /*
  selectWordList () {

    //wordsCompleted = 0;
    //wordsShown = [];

    targetWordList = spinWheelsJson[wordListLevel].word_list;
    wheelLetters1 = spinWheelsJson[wordListLevel].spinners[0].spinner1.letter_list;
    wheelLetters2 = spinWheelsJson[wordListLevel].spinners[1].spinner2.letter_list;
    wheelLetters3 = spinWheelsJson[wordListLevel].spinners[2].spinner3.letter_list;

    exports.wheelLetters1 = wheelLetters1;
    exports.wheelLetters2 = wheelLetters2;
    exports.wheelLetters3 = wheelLetters3;

    //console.log('Json level: ' + spinWheelsJson[wordListLevel].level_id);
    //console.log('Json word list: ' + spinWheelsJson[wordListLevel].word_list);
    //console.log('Json spinner1: ' + spinWheelsJson[wordListLevel].spinners[0].spinner1.letter_list);
    //console.log('Json spinner2: ' + spinWheelsJson[wordListLevel].spinners[1].spinner2.letter_list);
    //console.log('Json spinner3: ' + spinWheelsJson[wordListLevel].spinners[2].spinner3.letter_list);

  }
*/

  // randomly select a word from the target word list
  nextWord() {
    targetWord = targetWordList[Math.floor(Math.random() * targetWordList.length)];
    var targetWordArray = targetWord.split("");

    letter1 = targetWordArray[0];
    letter2 = targetWordArray[1];
    letter3 = targetWordArray[2];

    //targetImage = targetWord + ".jpg";
    targetSound = targetWord + '.wav';

    exports.letter1 = letter1;
    exports.letter2 = letter2;
    exports.letter3 = letter3;
  }

  // Function to split each word in the target word list into individual letters.
  // The first letter of each word will be assigned to wheel 1, the second letter
  // to wheel 2, and the third letter to wheel 3. This function was used in the
  // beginning when JSON was not used.
  // Currently not used
  splitWords() {
    var wheelLettersH1 = [];
    var wheelLettersH2 = [];
    var wheelLettersH3 = [];

    for(i=0;i<targetWordList.length;i++) {
      var tempWordArray = [];
      tempWordArray = targetWordList[i].split("");
      for(j=0; j<tempWordArray.length; j++) {
        eval('wheelLettersH'+(j+1)).push(tempWordArray[j]);
        eval('wheelLettersH'+(j+1)).sort();
      }
    }

    wheelLetters1 = [...new Set(wheelLettersH1)];
    wheelLetters2 = [...new Set(wheelLettersH2)];
    wheelLetters3 = [...new Set(wheelLettersH3)];

  }

  // Function to add additional consonants to wheel1 and wheel2
  // This function was used in the beginning when JSON was not used.
  // Currently unused
  addConsonant() {
    wheelLetters1.push("q");
    wheelLetters3.push("c","u","z");
    wheelLetters1.sort();
    wheelLetters3.sort();

    exports.wheelLetters1 = wheelLetters1;
    exports.wheelLetters2 = wheelLetters2;
    exports.wheelLetters3 = wheelLetters3;

  }

  // Function to play an audio of the word formed by the wheels
  onSpinButtonPress () {
    // Load the sound file variable, targetSound
    var whoosh = new Sound(targetSound, Sound.MAIN_BUNDLE, (error) => {
      console.log('targetSound: ' + targetSound);

      if (error) {
        console.log('Failed to load the sound', error);
        return;
      } else {
        // loaded successfully
        whoosh.play((success) => {
          if (success) {
            whoosh.release();
            console.log('successfully finished playing');
            //console.log('Duration in seconds: ' + whoosh.getDuration() + 'Number of channels: ' + whoosh.getNumberOfChannels())
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }

    });

    // Reduce the volume by half
    whoosh.setVolume(0.5);

    // Position the sound to the full right in a stereo field
    whoosh.setPan(1);

    // Loop indefinitely until stop() is called
    whoosh.setNumberOfLoops(-1);

    // Get properties of the player instance
    console.log('volume: ' + whoosh.getVolume());
    console.log('pan: ' + whoosh.getPan());
    console.log('loops: ' + whoosh.getNumberOfLoops());

    // Seek to a specific point in seconds
    whoosh.setCurrentTime(2.5);

    // Get the current playback point in seconds
    whoosh.getCurrentTime((seconds) => console.log('at ' + seconds));

    // Pause the sound
    whoosh.pause();

    // Stop the sound and rewind to the beginning
    whoosh.stop(() => {
      // Note: If you want to play a sound after stopping and rewinding it,
      // it is important to call play() in a callback.
      whoosh.play();
    });

    // Release the audio player resource
    whoosh.release();

  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.containerLeft}>
          <View style={styles.componentsContainer}>

            <View style={styles.upArrowsRow}>

              <TouchableOpacity
                disabled={this.state.buttonDisabled}
                onPress={() => this.onArrowClickUp(1)}
                >
                <Image
                  style={[styles.imageArrowUpHolder, {opacity: this.state.buttonImageC1Opacity}]}
                  source={require('./images/yellow_border_up.png')}
                />

              </TouchableOpacity>

              <TouchableOpacity
                disabled={this.state.buttonDisabled}
                onPress={() => this.onArrowClickUp(2)}
                >
                <Image
                  style={[styles.imageArrowUpHolder, {opacity: this.state.buttonImageC2Opacity}]}
                  source={require('./images/yellow_border_up.png')}
                />

              </TouchableOpacity>

              <TouchableOpacity
                disabled={this.state.buttonDisabled}
                onPress={() => this.onArrowClickUp(3)}
                >
                <Image
                  style={[styles.imageArrowUpHolder, {opacity: this.state.buttonImageC3Opacity}]}
                  source={require('./images/yellow_border_up.png')}
                />
              </TouchableOpacity>

            </View>

            <View style={styles.wheelsRow}
              pointerEvents={this.state.animatedMatrixPointerEvents}>

              <AnimatedSpriteMatrix
                styles={{
                    ...(this.matrixLocation()),
                    ...(this.matrixSize()),
                    position: 'absolute',
                  }}
                dimensions={{columns: this.numColumns, rows: this.numRows}}
                cellSpriteScale={this.cellSpriteScale}
                cellObjs={this.state.cells}
                scale={this.scale}
                ////onPress={(cellObj, position) => this.cellPressed(cellObj, position)}
                onPress={() => this.onSpinButtonPress()}
              />

            </View>

            <View style={styles.downArrowsRow}>

              <TouchableOpacity
                disabled={this.state.buttonDisabled}
                onPress={() => this.onArrowClickDown(1)}
                >
                <Image
                  style={[styles.imageArrowDownHolder, {opacity: this.state.buttonImageC1Opacity}]}
                  source={require('./images/yellow_border_down.png')}
                />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={this.state.buttonDisabled}
                onPress={() => this.onArrowClickDown(2)}
                >
                <Image
                  style={[styles.imageArrowDownHolder, {opacity: this.state.buttonImageC2Opacity}]}
                  source={require('./images/yellow_border_down.png')}
                />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={this.state.buttonDisabled}
                onPress={() => this.onArrowClickDown(3)}
                >
                <Image
                  style={[styles.imageArrowDownHolder, {opacity: this.state.buttonImageC3Opacity}]}
                  source={require('./images/yellow_border_down.png')}
                />
              </TouchableOpacity>

            </View>

            <View style={styles.spinButtonRow}>

              <TouchableOpacity
                disabled={this.state.spinButtonDisabled}
                onPress={(cellObj, position) => this.cellPressed(cellObj, 0)}
                style={[styles.spinButton, {backgroundColor: this.state.spinButtonBackgroundColor}]}>

                <Text style={[styles.spinButtonText, {opacity: this.state.spinButtonTextOpacity}]}>SPIN</Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

        <View style={styles.containerRight}>

          <TouchableOpacity
            disabled={this.state.buttonDisabled}
            onPress={() => this.onSpinButtonPress()}
            >
            <Image
              style={[styles.image , {opacity: this.state.imageOpacity}]}
              source={wordImages[targetWord]}
            />
          </TouchableOpacity>

        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5FCFF',
  },
  containerLeft: {
    flex: 1.5,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: 'grey',
    borderRightWidth: 2,
    height: '100%',
  },
  componentsContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    backgroundColor: 'lightblue',
  },
  upArrowsRow: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  downArrowsRow: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  wheelsRow: {
    flex: 2,
    flexDirection: 'row',
    borderColor: 'black',
    borderWidth: 4,
  },
  wheel: {
    backgroundColor: 'lightgreen',
    marginLeft: 20,
    marginRight: 20,
    height: '100%',
    width: '25%',
    borderColor: 'black',
    borderWidth: 4,
    borderRadius: 15,
    justifyContent: 'center',
  },
  wheelFont: {
    flex: 1,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 260,
    textAlign: 'center',
    lineHeight: 220,
  },
  spinButtonRow: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinButton: {
    height: 100,
    width: '50%',
    backgroundColor: 'royalblue',
    borderColor: 'black',
    borderWidth: 4,
    borderRadius: 15,
  },
  spinButtonText: {
    fontWeight: 'bold',
    fontSize: 40,
    textAlign: 'center',
    padding: 20,
    color: 'white',
  },
  containerRight: {
    flex: 1,
    padding: 60,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: '100%',
  },
  image: {
    margin:50,
    borderColor: "black",
    borderWidth: 4,
    borderRadius: 15,
  },
  imageArrowUp: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 37,
    width: '20%',
    height: '70%',
  },
  imageArrowDown: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 37,
    marginRight: 37,
    width: '20%',
    height: '70%',
  },
  imageArrowUpHolder: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
    width: 150,
    height: '70%',
  },
  imageArrowDownHolder: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    width: 150,
    height: '70%',
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('workshop_spin_wheels_1', () => workshop_spin_wheels_1);

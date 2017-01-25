import React, {PropTypes} from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  TouchableOpacity,
  ScrollView
} from 'react-native';

import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel
} from 'react-native-simple-radio-button';

import AppStyles from '../AppStyles';
import _ from 'lodash';

const FeedbackView = React.createClass({
  getInitialState() {
    return {};
  },

  componentDidMount() {
    this.props.refresh();
  },

  saveFeedback() {
    let answers = [];
    Object.keys(this.props.feedback.data).forEach((i) => {
      answers[i] = this.state[i];

      // Use old answer if user did not change it
      if (_.isUndefined(answers[i])) {
        answers[i] = this.props.feedback.data[i] &&
          this.props.feedback.data[i].answer;
      }
    });

    this.props.save({ answers });
  },

  render() {
    if (this.props.feedback.loading) {
      return (
        <View style={{flex: 1}} >
          <ActivityIndicator color={'#ff5454'} animating={true} style={{height: 150, alignSelf: 'center', flex: 1}} size="large" />
        </View>
      );
    }

    let feedbackItems = [];

    this.props.feedback.data.forEach((question, i) => {
      const val = this.state[i];

      if (question.questionType === 'text') {
        feedbackItems.push(
          <View key={i}>
            <Text style={styles.boldText}>
              { question.questionText }
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                onChangeText={(value) => this.setState({
                  [i]: value
                })}
                value={val ? val : question.answer}
                />
            </View>
          </View>
        );
      } else if (question.questionType === 'radio') {
        let radioProps = []

        for (let j = 0; j < question.numButtons; j++) {
          const label = question.labels && question.labels[j]
            ? question.labels[j]
            : (j + 1);

          radioProps.push({
            label,
            value: label
          });
        }

        if (!question.labels) {
          console.log('Missing labels on question!', question);
          return;
        }

        const initial = question.labels.indexOf(question.answer);

        feedbackItems.push(
          <View key={i}>
            <Text style={styles.boldText}>
              { question.questionText }
            </Text>
            <RadioForm
              style={styles.radioButton}
              radio_props={radioProps}
              initial={initial}
              onPress={(value) => this.setState({
                [i]: value
              })}
              formHorizontal={true}
              labelHorizontal={false}
              animation={true}
              buttonColor={'#ff5454'}
              buttonSize={40}
            />
          </View>
        );
      }
    });

    return (
     <View style={styles.container}>
      <ScrollView
        automaticallyAdjustContentInsets={false}
        style={styles.scrollView}>

        <Text style={styles.baseText}>
          Super-Adan järjestäjät ovat kiinnostuneita kokemuksistanne tapahtumassa.
          Vastaamalla autat meitä tekemään tapahtumasta paremman!
        </Text>

        { feedbackItems }

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => this.saveFeedback()}>
            <Text style={[styles.whiteFont, {fontWeight: 'bold'}]}>{'LÄHETÄ'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  scrollView: {
    backgroundColor: AppStyles.whiteBackground,
    flex: 1
  },
  radioButton: {
    paddingLeft: 10,
    paddingTop: 10
  },
  baseText: {
    marginLeft: 10,
    marginTop: 10,
    marginRight: 10,
    fontSize: AppStyles.fontSize,
    marginBottom: 20,
    color: 'black'
  },
  boldText: {
    marginLeft: 10,
    marginTop: 10,
    marginRight: 10,
    fontSize: AppStyles.fontSize,
    fontWeight: 'bold',
    color: 'black'
  },
  input: {
    height: 48,
    fontSize: AppStyles.fontSize,
  },
  inputContainer: {
    marginLeft: 10,
    marginRight: 10,
    ...Platform.select({
      ios: {
        borderBottomWidth: 1
      }
    })
  },
  send: {
    backgroundColor: '#ff5454',
    padding: 20,
    marginTop: 40,
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 30,
    alignItems: 'center'
  },
  whiteFont: {
    color: AppStyles.white,
    fontSize: AppStyles.fontSize
  },
  buttonContainer: {
    backgroundColor: AppStyles.whiteBackground,
    elevation: 5,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    margin: 20,
  },
  button: {
    backgroundColor: AppStyles.darkRed,
    alignItems: 'center',
    alignSelf: 'stretch',
    height: 70,
    padding: 20
  },
});

export default FeedbackView;

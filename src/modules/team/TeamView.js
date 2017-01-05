import React, {PropTypes} from 'react';
import {
  Dimensions,
  Image,
  Text,
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import {options} from './image-picker-options';
import * as NavigationState from '../../modules/navigation/NavigationState';
import AppStyles from '../AppStyles';

const TeamView = React.createClass({
  getInitialState() {
    return {
      modifiedTeamDescription: null,
      modifiedImage: null,
      disableSave: false,

      width: 0,
      height: 0
    };
  },

  checkpoints() {
    this.props.dispatch(NavigationState.switchTab('CheckPointsTab'));
  },

  componentDidMount() {
    this.props.refresh();
  },

  openImageGallery() {
    this.setState({ disableSave: true });
    ImagePicker.showImagePicker(options, (response) => {
      this.setState({ disableSave: false });

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        this.setState({
          modifiedImage: response.data
        });
      }
    });
  },

  render() {
    ////console.log('teamId:', this.props.teamDetails.data.teamId);
    //console.log(this.props.teamDetails.error);
    const description = this.state.modifiedTeamDescription !== null
      ? this.state.modifiedTeamDescription
      : (this.props.teamDetails.data ? this.props.teamDetails.data.description : '');
    const name = this.props.teamDetails.data
      ? this.props.teamDetails.data.teamName
      : '';
    const image = this.state.modifiedImage !== null
      ? { uri: 'data:image/png;base64,' + this.state.modifiedImage }
      : { uri: this.props.image }

    const disabled = this.props.teamDetails.loading
      || this.state.disableSave
      || this.state.modifiedTeamDescription === ''
      || (!this.state.modifiedImage && !this.state.modifiedTeamDescription);

    return (
      <View style={{flex: 1, backgroundColor: '#fafafa'}}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Muokkaa tiimiä
          </Text>
        </View>
        <View style={{flex: 1}} onLayout={(e) => {
          var {x, y, width, height} = e.nativeEvent.layout;
          // TODO: any more sane way of passing this View's height down?
          if (height !== this.state.height) {
            //this.setState({ width, height });
          }
        }}>
          <ScrollView style={{backgroundColor: '#fafafa'}} contentContainerStyle={{
            minHeight: this.state.height
          }}>
            <View style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <View style={styles.teamName}>
                <Text style={styles.teamTitle}> { name } </Text>
              </View>
                { !this.props.teamDetails.sync
                  ? <ActivityIndicator color={'#ff5454'} animating={true} style={{height: 150}} size="large" />
                  : <TouchableOpacity
                      onPress={this.openImageGallery}
                      style={[styles.cameraButton]}>
                      { this.props.image
                        ? <Image source={image} style={styles.teamImage} />
                        : <Image style={styles.cameraImage} source={require('../../../images/kamera.png')}/>
                      }
                    </TouchableOpacity>
                }
              <Text style={styles.descriptionText}>Slogan:</Text>
              <View style={styles.description}>
                <TextInput
                  style={styles.teamInput}
                  onChangeText={(modifiedTeamDescription) => this.setState({modifiedTeamDescription})}
                  value={description}
                  onSubmitEditing={() => { !disabled
                    && this.props.save(this.state.modifiedTeamDescription, this.state.modifiedImage);
                  }} />
              </View>
            </View>
          </ScrollView>
        </View>
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => {
              this.props.save(this.state.modifiedTeamDescription, this.state.modifiedImage);
            }}
            accessible={true}
            style={
              disabled
                ? styles.saveButtonLoading
                : styles.saveButton
            }>
            <Text style={[styles.whiteFont, {fontWeight: 'bold'}]}>{'TALLENNA'}</Text>
          </TouchableOpacity>
          { (this.state.disableSave)
            ? <ActivityIndicator animating={true} color={ AppStyles.white } style={{position: 'absolute', height: 70, width: 70, zIndex: 1000}} size="large" />
            : null
          }
        </View>
      </View>
    );
  }
});

const circle = {
  borderWidth: 0,
  borderRadius: 75,
  width: 150,
  height: 150
};

const styles = StyleSheet.create({
  header: {
    alignSelf: 'stretch',
    backgroundColor: AppStyles.lightRed,
    elevation: 5,
    height: AppStyles.headerHeight,
    justifyContent: 'center'
  },
  headerText: {
    textAlign: 'center',
    color: AppStyles.white,
    fontSize: AppStyles.headerFontSize,
    fontWeight: 'bold',
  },
  teamContainer: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppStyles.whiteBackground,
  },
  teamName: {
    paddingTop: 20
  },
  teamNameStyle: {
    alignItems: 'center',
  },
  teamTitle: {
    color: AppStyles.darkRed,
    fontSize: AppStyles.headerFontSize,
    minHeight: 30,
    fontWeight: 'bold'
  },
  description: {
    margin: 20
  },
  descriptionText: {
    color: 'black',
    fontSize: AppStyles.fontSize,
    fontWeight: 'bold',
    margin: 10,
  },
  teamInput: {
    width: 300,
    color: 'black',
    ...Platform.select({
      ios: {
        height: 70,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 20
      }
    })
  },
  cameraButton: {
    ...circle,
    backgroundColor: AppStyles.grey,
    margin: 20
  },
  cameraImage: {
    width: 100,
    height: 100,
    position: 'absolute',
    alignItems: 'center',
    margin: 25
  },
  teamImage: {
    width: 150,
    height: 150,
    position: 'absolute',
    alignItems: 'center',
    borderRadius: 75
  },
  saveButtonContainer: {
    backgroundColor: AppStyles.whiteBackground,
    elevation: 5,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    margin: 20,
  },
  saveButton: {
    backgroundColor: AppStyles.darkRed,
    alignItems: 'center',
    alignSelf: 'stretch',
    height: 70,
    padding: 20,
    elevation: 5,
  },
  saveButtonLoading: {
    backgroundColor: AppStyles.lightRed,
    alignItems: 'center',
    alignSelf: 'stretch',
    height: 70,
    padding: 20,
    elevation: 5,
  },
  whiteFont: {
    color: AppStyles.white,
    fontSize: AppStyles.fontSize
  }
});
export default TeamView;

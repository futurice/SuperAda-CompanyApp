import {Provider} from 'react-redux';
import store from './src/redux/store';
import AppViewContainer from './src/modules/AppViewContainer';
import React from 'react';
import {
  AppRegistry,
  BackAndroid,
  StatusBar,
  View
} from 'react-native';
import * as NavigationStateActions from './src/modules/navigation/NavigationState';
import SplashScreen from 'react-native-smart-splash-screen';

const SuperAda = React.createClass({

  componentWillMount() {
    BackAndroid.addEventListener('hardwareBackPress', this.navigateBack);
  },

  navigateBack() {
    const navigationState = store.getState().get('navigationState');
    const tabs = navigationState.get('tabs');
    const tabKey = tabs.getIn(['routes', tabs.get('index')]).get('key');
    const currentTab = navigationState.get(tabKey);

    // If we are in the beginning of our tab stack :3
    if (currentTab.get('index') === 0) {

      // if we are not in the first tab, switch tab to the leftmost one
      if (tabs.get('index') !== 0) {
        store.dispatch(NavigationStateActions.switchTab('HomeTab'));
        return true;
      }

      // otherwise let OS handle the back button action
      return false;
    }

    store.dispatch(NavigationStateActions.popRoute());
    return true;
  },

  componentDidMount () {
    SplashScreen.close(SplashScreen.animationType.scale, 850, 500);
  },

  render() {
    return (
      <Provider store={store}>
        <View style={{flex: 1}}>
          <StatusBar
            animated={false}
            backgroundColor="#fe9593"
            barStyle="light-content"
          />
          <AppViewContainer />
        </View>
      </Provider>
    );
  }
});

AppRegistry.registerComponent('SuperAda', () => SuperAda);

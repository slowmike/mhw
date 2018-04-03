import React, { PureComponent } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { Container, Tab, Tabs } from 'native-base';
import Icon from 'react-native-vector-icons/Ionicons';
import SplashScreen from 'react-native-splash-screen';
import MonsterList from '../components/MonsterList';
import AdBanner from '../components/AdBanner';
import { MiscImages } from '../assets/';

export default class MonsterScreen extends PureComponent {
  static navigatorButtons = {
    rightButtons: [
      // {
      //   title: 'Sort', // for a textual button, provide the button title (label)
      //   id: 'Sort', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
      //   disabled: false, // optional, used to disable the button (appears faded and doesn't interact)
      //   disableIconTint: false, // optional, by default the image colors are overridden and tinted to navBarButtonColor, set to true to keep the original image colors
      //   showAsAction: 'ifRoom', // optional, Android only. Control how the button is displayed in the Toolbar. Accepted valued: 'ifRoom' (default) - Show this item as a button in an Action Bar if the system decides there is room for it. 'always' - Always show this item as a button in an Action Bar. 'withText' - When this item is in the action bar, always show it with a text label even if it also has an icon specified. 'never' - Never show this item as a button in an Action Bar.
      //   buttonColor: 'red', // Optional, iOS only. Set color for the button (can also be used in setButtons function to set different button style programatically)
      //   buttonFontSize: 14, // Set font size for the button (can also be used in setButtons function to set different button style programatically)
      //   buttonFontWeight: '600', // Set font weight for the button (can also be used in setButtons function to set different button style programatically)
      // },
      {
        // icon: require('../assets/images/misc/ItemIcon007.png'), // for icon button, provide the local image asset name
        icon: Platform.OS === 'ios' ? MiscImages['ios-more'] : MiscImages['android-more'],
        id: 'options', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
      },
    ],
  };

  constructor(props) {
    super(props);
    this.state = {
      allMonsters: [],
      smallMonsters: [],
      largeMonsters: [],
      loading: true,
      data: [],
    };
  }

  okCallback(msg) {
    console.log(`okCallback: ${msg}`);
    setTimeout(() => {
      const db = SQLite.openDatabase({
        name: 'mhworld.db', createFromLocation: '~mhworld.db', location: 'Default',
      });
      db.transaction((tx) => {
        const allMonsters = [];
        const smallMonsters = [];
        const largeMonsters = [];
        tx.executeSql('SELECT * FROM monster ORDER BY monster_name', [], (tx, results) => {
          // Get rows with Web SQL Database spec compliance.
          const len = results.rows.length;
          for (let i = 0; i < len; i += 1) {
            const row = results.rows.item(i);
            allMonsters.push(row);
            // this.setState({record: row});
          }
          // this.setState({ allMonsters });
          // db.close();
        });
        tx.executeSql('SELECT * FROM monster WHERE size=? ORDER BY monster_name', ['Small'], (tx, results) => {
          // Get rows with Web SQL Database spec compliance.
          const len = results.rows.length;
          for (let i = 0; i < len; i += 1) {
            const row = results.rows.item(i);
            smallMonsters.push(row);
          }
        });
        tx.executeSql('SELECT * FROM monster WHERE size=? ORDER BY monster_name', ['Large'], (tx, results) => {
          // Get rows with Web SQL Database spec compliance.
          const len = results.rows.length;
          for (let i = 0; i < len; i += 1) {
            const row = results.rows.item(i);
            largeMonsters.push(row);
          }
          this.setState({
            data: allMonsters, allMonsters, smallMonsters, largeMonsters, loading: false,
          });
          if (Platform.OS === 'ios') SplashScreen.hide();
        });
      });
    }, 150);
  }

  errorCallback(msg) {
    console.log(`okCallback: ${msg}`);
    setTimeout(() => {
      const db = SQLite.openDatabase({
        name: 'mhworld.db', createFromLocation: '~mhworld.db', location: 'Default',
      });
      db.transaction((tx) => {
        const allMonsters = [];
        const smallMonsters = [];
        const largeMonsters = [];
        tx.executeSql('SELECT * FROM monster ORDER BY monster_name', [], (tx, results) => {
          // Get rows with Web SQL Database spec compliance.
          const len = results.rows.length;
          for (let i = 0; i < len; i += 1) {
            const row = results.rows.item(i);
            allMonsters.push(row);
            // this.setState({record: row});
          }
          // this.setState({ allMonsters });
          // db.close();
        });
        tx.executeSql('SELECT * FROM monster WHERE size=? ORDER BY monster_name', ['Small'], (tx, results) => {
          // Get rows with Web SQL Database spec compliance.
          const len = results.rows.length;
          for (let i = 0; i < len; i += 1) {
            const row = results.rows.item(i);
            smallMonsters.push(row);
          }
        });
        tx.executeSql('SELECT * FROM monster WHERE size=? ORDER BY monster_name', ['Large'], (tx, results) => {
          // Get rows with Web SQL Database spec compliance.
          const len = results.rows.length;
          for (let i = 0; i < len; i += 1) {
            const row = results.rows.item(i);
            largeMonsters.push(row);
          }
          this.setState({
            data: allMonsters, allMonsters, smallMonsters, largeMonsters, loading: false,
          });
          if (Platform.OS === 'ios') SplashScreen.hide();
        });
      });
    }, 150);
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    // db.close();
  }

  okCallback2(msg) {
    console.log(msg);
  }
  errorCallback2(msg) {
    console.log(msg);
  }

  componentWillMount() {
    if (Platform.OS === 'ios') {
      // DELETE FROM IOS
      SQLite.deleteDatabase(
        { name: 'mhworld.db', location: 'Default' },
        this.okCallback.bind(this), this.errorCallback.bind(this),
      );
    } else {
      // DELETE FROM ANDROID
      SQLite.deleteDatabase(
        { name: 'mhworld.db', location: '~mhworld.db' },
        this.okCallback.bind(this), this.errorCallback.bind(this),
      );
    }
  }

  renderContent(screen) {
    if (this.state.loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignSelf: 'stretch', backgroundColor: 'white' }}>
          <ActivityIndicator size="large" color="#5e5e5e"/>
        </View>
      );
    }
    if (screen === 'all') {
      return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <MonsterList navigator={this.props.navigator} monsters={this.state.allMonsters} type={'all'}/>
        </View>
      );
    } else if (screen === 'large') {
      return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <MonsterList navigator={this.props.navigator} monsters={this.state.largeMonsters} type={'large'}/>
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <MonsterList navigator={this.props.navigator} monsters={this.state.smallMonsters} type={'small'}/>
      </View>
    );
  }

  render() {
    return (
      <Container style={{ backgroundColor: 'white' }}>
        <Tabs
          prerenderingSiblingsNumber={3}
          scrollWithoutAnimation={false}
          tabBarUnderlineStyle={{ backgroundColor: 'red', height: 3 }}
          initialPage={0}>
         <Tab
           activeTabStyle={{ backgroundColor: 'white' }}
           tabStyle={{ backgroundColor: 'white' }}
           activeTextStyle={{ color: '#191919' }}
           textStyle={{ color: '#5e5e5e' }}
           heading="All"
           >
           {this.renderContent('all')}
         </Tab>
         <Tab
           activeTabStyle={{ backgroundColor: 'white' }}
           tabStyle={{ backgroundColor: 'white' }}
           activeTextStyle={{ color: '#191919' }}
           textStyle={{ color: '#5e5e5e' }}
           heading="Large"
           >
           {this.renderContent('large')}
         </Tab>
         <Tab
           activeTabStyle={{ backgroundColor: 'white' }}
           tabStyle={{ backgroundColor: 'white' }}
           activeTextStyle={{ color: '#191919' }}
           textStyle={{ color: '#5e5e5e' }}
           heading="Small"
           >
           {this.renderContent('small')}
         </Tab>
       </Tabs>
       <AdBanner />
     </Container>
    );
  }
}

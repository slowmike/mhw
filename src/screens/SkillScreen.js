import React, { PureComponent } from 'react';
import { Platform, View, FlatList, ActivityIndicator } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { ListItem, Text, Left, Right, Body } from 'native-base';
import AdBanner from '../components/AdBanner';

// Styles
import colors from '../styles/colors';

export default class SkillScreen extends PureComponent {
  static navigatorStyle = {
    topBarElevationShadowEnabled: Platform.OS !== 'ios',
    topBarBorderColor: colors.accent,
    topBarBorderWidth: 17,
  };

  constructor(props) {
    super(props);
    this.state = {
      items: [],
    };

    const db = SQLite.openDatabase({
      name: 'mhworld.db', createFromLocation: 'mhworld.db', location: 'Default',
    });
    db.transaction((tx) => {
      const items = [];
      tx.executeSql(
        'SELECT * FROM armor_skills',
        [], (tx, results) => {
        // Get rows with Web SQL Database spec compliance.
          const len = results.rows.length;
          for (let i = 0; i < len; i += 1) {
            const row = results.rows.item(i);
            items.push(row);
          }
          this.setState({ items });
          // db.close();
        },
      );
    });
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    if (event.id === 'bottomTabSelected') {
      // console.log('Tab selected!');
    }
    if (event.id === 'bottomTabReselected') {
      this.props.navigator.popToRoot({
        animated: true,
        animationType: 'slide-horizontal',
      });
    }
  }

  renderListItems = ({ item }) => {
    return (
      <ListItem
        style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}
        onPress={() => this.props.navigator.push({
        screen: 'TabInfoScreen',
        passProps: {
          armor_skill_id: item.armor_skill_id,
          type: 'skill',
        },
        animationType: 'slide-horizontal',
        title: item.name,
      })}
      >
      <Left>
        <Text style={{ fontSize: 15.5, color: colors.main }}>{item.name}</Text>
      </Left>
      <Body>
        <Text style={{ fontSize: 13, color: colors.secondary }}>{item.description}</Text>
      </Body>
      </ListItem>
    );
  }

  renderContent() {
    if (this.state.loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignSelf: 'stretch', backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color={colors.main}/>
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <FlatList
          style={{ backgroundColor: colors.background }}
          initialNumToRender={8}
          data={this.state.items}
          keyExtractor={(item) => item.armor_skill_id.toString()}
          renderItem={this.renderListItems}
        />
        <AdBanner />
      </View>
    );
  }

  render() {
    return this.renderContent();
  }
}

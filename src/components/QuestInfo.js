import React, { PureComponent } from 'react';
import { Image, ScrollView, View, ActivityIndicator } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { Container, ListItem, Text, Left, Body, Right, Icon } from 'native-base';
import DropDown from './DropDown';
import AdBanner from './AdBanner';
import { MonsterImages } from '../assets';

// Styles
import colors from '../styles/colors';

export default class QuestInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      info: {},
      rewards: [],
      monsters: [],
      items: [],
    };

    const db = SQLite.openDatabase({
      name: 'mhworld.db', createFromLocation: 'mhworld.db', location: 'Default',
    });

    db.transaction((tx) => {
      let info = {};
      let rewards = [];
      let monsters = [];
      tx.executeSql(
        `SELECT A.*, B.name as map_name
        FROM quests AS A
		    JOIN maps AS B ON A.map_id = B.map_id
        WHERE quest_id = ?`,
        [this.props.quest_id], (tx, results) => {
          info = results.rows.item(0);
        },
      );
      tx.executeSql(
        `SELECT C.*
        FROM quests AS A
        JOIN quest_monsters AS B on A.quest_id = B.quest_id
        JOIN monster as C ON B.monster_id = C.monster_id
        WHERE A.quest_id = ?`,
        [this.props.quest_id], (tx, results) => {
          const len = results.rows.length;
          for (let i = 0; i < len; i += 1) {
            monsters.push(results.rows.item(i));
          }
        },
      );
      tx.executeSql(
        `SELECT A.*, B.*, C.name
					FROM quests AS A
					JOIN quest_items AS B ON A.quest_id = B.quest_id
					JOIN items as C ON B.item_id = C.item_id
					WHERE A.quest_id=? AND B.condition = '1'`,
        [this.props.quest_id], (tx, results) => {
          const len = results.rows.length;
          for (let i = 0; i < len; i += 1) {
            rewards.push(results.rows.item(i));
          }
          this.setState({
            loading: false,
            info,
            monsters,
            rewards,
          });
        },
      );
    });
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    if (event.id === 'bottomTabSelected') {
      //console.log('Tab selected!');
    }
    if (event.id === 'bottomTabReselected') {
      this.props.navigator.popToRoot({
        animated: true,
        animationType: 'slide-horizontal',
      });
    }
  }

  renderObjective() {
    let zeny = this.state.info.reward === null ? 0 : this.state.info.reward;
    if (this.state.info.objective !== '') {
      return (
        <View>
          <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
            <Left style={{ flex: 1 }}>
              <Text style={{ fontSize: 15.5, color: colors.main }}>
                Objective
              </Text>
            </Left>
            <Right style={{ flex: 1 }}>
              <Text style={{ fontSize: 15.5, color: colors.main }}>
                Zeny Reward
              </Text>
            </Right>
          </ListItem>
          <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}>
            <Left>
              <Text style={{ fontSize: 15.5, color: colors.main }}>
                {this.state.info.objective}
              </Text>
            </Left>
            <Right>
              <Text style={{ fontSize: 15.5, color: colors.main }}>
                {`${zeny}z`}
              </Text>
            </Right>
          </ListItem>
        </View>
      );
    }
    return null;
  }

  renderMonster() {
    if (this.state.monsters.length > 0) {
      return (
        <View>
          <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
            <Left style={{ flex: 1 }}>
              <Text style={{ fontSize: 15.5, color: colors.main }}>
                Monsters
              </Text>
            </Left>
            <Right style={{ flex: 1 }}>
            </Right>
          </ListItem>
          {this.state.monsters.map((item, key) => {
            let src = MonsterImages['Unknown'];
            let name = item.monster_name;
            name = name.replace(/["'-]/g, '');
            name = name.replace(' ', '');
            src = MonsterImages[name];
            return (
              <ListItem
                key={key}
                style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}
                onPress={() => this.props.navigator.push({
                screen: 'MonsterInfoScreen',
                passProps: {
                  monster_id: item.monster_id,
                  monster_info: item,
                },
                animationType: 'slide-horizontal',
                title: item.monster_name,
                })}>
                <Left>
                  <Image
                    resizeMode="contain"
                    style={{ width: 35, height: 35 }}
                    source={src}
                  />
                </Left>
                <Body style={{ flex: 6 }}>
                  <Text style={{ fontSize: 15.5, color: colors.main }}>{item.monster_name}</Text>
                  <Text style={{ fontSize: 15.5, color: colors.secondary }}>{item.type}</Text>
                </Body>
              </ListItem>
            );
          })}
        </View>
      );
    }
    return null;
  }

  renderItem() {
    if (this.state.items.length > 0) {
      return (
        <View>
          <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
            <Left style={{ flex: 1 }}>
              <Text style={{ fontSize: 15.5, color: colors.main }}>
                Items
              </Text>
            </Left>
            <Right style={{ flex: 1 }}>
            </Right>
          </ListItem>
          {this.state.monsters.map((item, key) => {
            return (
              <ListItem
                key={key}
                style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}
                onPress={() => this.props.navigator.push({
                screen: 'MonsterInfoScreen',
                passProps: {
                  monster_id: item.monster_id,
                  monster_info: item,
                },
                animationType: 'slide-horizontal',
                title: item.monster_name,
                })}>
                <Left>
                  <Text style={{ fontSize: 15.5, color: colors.main }}>
                    {item.monster_name}
                  </Text>
                </Left>
                <Right>
                </Right>
              </ListItem>
            );
          })}
        </View>
      );
    }
    return null;
  }

  renderMap() {
    return (
      <View>
        <ListItem
          style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}
          itemDivider>
          <Left style={{ flex: 1 }}>
            <Text style={{ fontSize: 15.5, color: colors.main }}>
              Map
            </Text>
          </Left>
          <Right style={{ flex: 1 }}>
          </Right>
        </ListItem>
        <ListItem
          style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}
          onPress={() => this.props.navigator.push({
          screen: 'TabInfoScreen',
          passProps: {
            item_id: this.state.info.map_id,
            type: 'maps',
          },
          animationType: 'slide-horizontal',
          title: this.state.info.map_name,
          })}>
          <Left style={{ flex: 1 }}>
            <Text style={{ fontSize: 15.5, color: colors.main }}>
              {this.state.info.map_name}
            </Text>
          </Left>
          <Right style={{ flex: 1 }}>
          </Right>
        </ListItem>
      </View>
    );
  }

  renderRewards() {
    if (this.state.rewards.length > 0) {
      return (
        <DropDown
          headerName={'Rewards'}
          hide={false}
          content={this.state.rewards.map((item, key) => {
            return (
              <ListItem
                style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}
                onPress={() => this.props.navigator.push({
                  screen: 'TablessInfoScreen',
                  passProps: {
                    item_id: item.item_id,
                    type: 'item',
                  },
                  animationType: 'slide-horizontal',
                  title: item.name,
                })}
                key={key}>
                <Left>
                  <Text style={{ fontSize: 15.5, color: colors.main }}>{item.name}</Text>
                </Left>
                <Right>
                  <Text style={{ fontSize: 15.5, color: colors.main }}>{`${item.chance}%`}</Text>
                </Right>
              </ListItem>
            );
          })}
        />
      );
    }
    return null;
  }

  renderContent() {
    if (this.state.loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignSelf: 'stretch', backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color={colors.main}/>
        </View>
      );
    }
    if (!this.state.loading && this.state.rewards.length === 0 && this.state.info.objective === '' && (this.state.monsters.length === 0)) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignSelf: 'stretch', backgroundColor: colors.background }}>
          <Icon ios='ios-alert-outline' android='ios-alert-outline' style={{ textAlign: 'center', fontSize: 50, color: colors.secondary }} />
          <Text style={{ textAlign: 'center', fontSize: 25, color: colors.secondary }}>No Data</Text>
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView style={{ backgroundColor: colors.background }}>
        {this.renderObjective()}
        {this.renderMap()}
        {this.renderItem()}
        {this.renderMonster()}
        {this.renderRewards()}
        </ScrollView>
        <AdBanner />
      </View>
    );
  }

  render() {
    return this.renderContent();
  }
}

import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import EquipArmorInfo from '../components/EquipArmorInfo';

export default class EquipInfoScreen extends PureComponent {
  static navigatorStyle = {
    // navBarHideOnScroll: true,
    topBarBorderColor: 'red',
    topBarBorderWidth: 17,
  };

  render() {
    return (
      <EquipArmorInfo navigator={this.props.navigator} item_id={this.props.item_id}/>
    );
  }
}

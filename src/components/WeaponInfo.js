import React, { PureComponent } from 'react';
import { ScrollView, View, ActivityIndicator, Image } from 'react-native';
import { Container, ListItem, Text, Right, Left, Body, Tabs, Tab } from 'native-base';
import SQLite from 'react-native-sqlite-storage';
import { ElementStatusImages, BowCoatings, WeaponImages } from '../assets';
import WeaponListItem from './WeaponListItem';
import KinsectListItem from './KinsectListItem';
import AdBanner from './AdBanner';

// Styles
import colors from '../styles/colors';

const bulletTypes = {
  Nrm: 'Normal',
  Prc: 'Piercing',
  Spr: 'Spread',
  Sti: 'Sticky',
  Clu: 'Cluster',
  Rec: 'Recover',
  Poi: 'Poison',
  Par: 'Paralysis',
  Sle: 'Sleep',
  Exh: 'Exhaust',
  Fla: 'Flaming',
  Wat: 'Water',
  Fre: 'Freeze',
  Thn: 'Thunder',
  Dra: 'Dragon',
  Sli: 'Slicing',
  Wyv: 'Wyvern',
  Dem: 'Demon',
  Arm: 'Armor',
  Tra: 'Tranq',
};

export default class WeaponInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      info: this.props.item,
      craftMaterials: [],
      upgradeMaterials: [],
      upgradeFrom: [],
      ammo: [],
      melodies: [],
      recoil: [],
      reload: [],
    };
    const db = SQLite.openDatabase({
      name: 'mhworld.db', location: 'Default',
    }, this.okCallback, this.errorCallback);
    db.transaction((tx) => {
      let craftMaterials = [];
      let upgradeMaterials = [];
      const upgradeTo = [];
      let ammo = [];
      let melodies = [];
      let recoil = [];
      let reload = [];
      let info = this.props.item;
      // if (this.props.refetch) {
      //   tx.executeSql(
      //     `SELECT weapon_sharpness.*,
      //       weapon_bowgun_chars.*, weapon_coatings.*, weapon_kinsects.*, weapon_notes.*, weapon_phials.*, weapon_shellings.*,
      //       weapons.*, items.name as name, items.rarity as rarity
      //       FROM weapons
      //       JOIN items on weapons.item_id = items.item_id
      //       LEFT JOIN weapon_bowgun_chars ON weapons.item_id = weapon_bowgun_chars.item_id
      //       LEFT JOIN weapon_coatings ON weapons.item_id = weapon_coatings.item_id
      //       LEFT JOIN weapon_kinsects ON weapons.item_id = weapon_kinsects.item_id
      //       LEFT JOIN weapon_notes ON weapons.item_id = weapon_notes.item_id
      //       LEFT JOIN weapon_phials ON weapons.item_id = weapon_phials.item_id
      //       LEFT JOIN weapon_sharpness ON weapons.item_id = weapon_sharpness.item_id
      //       LEFT JOIN weapon_shellings ON weapons.item_id = weapon_shellings.item_id
      //       WHERE items.item_id = ?`
      //     , [this.props.item_id], (tx, results) => {
      //       info = results.rows.item(0);
      //     },
      //   );
      // }
      if (this.props.item.type.includes('bowgun')) {
        tx.executeSql(
          `SELECT A.*, B.name
            FROM recoil_mod_speed as A
            JOIN items as B on A.ammo_id = B.item_id
            WHERE A.table_id = ?`
          , [this.props.item.recoil_table_id], (tx, results) => {
            const len = results.rows.length;
            for (let i = 0; i < len; i += 1) {
              recoil.push(results.rows.item(i));
            }
          },
        );
        tx.executeSql(
          `SELECT A.*, B.name
            FROM reload_mod_speed as A
            JOIN items as B on A.ammo_id = B.item_id
            WHERE A.table_id = ?`
          , [this.props.item.reload_table_id], (tx, results) => {
            const len = results.rows.length;
            for (let i = 0; i < len; i += 1) {
              reload.push(results.rows.item(i));
            }
          },
        );
      }
      if (this.props.item.note1 !== null) {
        const array = [
          this.props.item.note1, this.props.item.note2, this.props.item.note3,
          this.props.item.note1, this.props.item.note2, this.props.item.note3,
          this.props.item.note1, this.props.item.note2, this.props.item.note3,
          this.props.item.note1, this.props.item.note2, this.props.item.note3,
        ];
        tx.executeSql(
          `SELECT DISTINCT
            note1, note2, note3, note4, effect1, effect2,duration, extension
            FROM horn_melodies
            WHERE
            ((? = note1 OR ? = note1 or ? = note1 or note1 IS NULL))
            AND ((? = note2 OR ? = note2 or ? = note2 or note2 IS NULL))
            AND ((? = note3 OR ? = note3 or ? = note3 or note3 IS NULL))
            AND ((? = note4 OR ? = note4 or ? = note4 or note4 IS NULL))`
          , array, (tx, results) => {
            const len = results.rows.length;
            for (let i = 0; i < len; i += 1) {
              melodies.push(results.rows.item(i));
            }
          },
        );
      }
      if (this.props.type !== 'kinsect') {
        tx.executeSql(
          `SELECT A.bullet_type, A.level_1, A.level_2, A.level_3
            FROM weapon_bowgun_ammo as A
            WHERE A.item_id = ?`
          , [this.props.item_id], (tx, results) => {
            const len = results.rows.length;
            for (let i = 0; i < len; i += 1) {
              ammo.push(results.rows.item(i));
            }
          },
        );
        tx.executeSql(
          `SELECT D.item_id, D.name, C.quantity
          FROM weapons as A
          JOIN items AS B ON A.item_id = B.item_id
          JOIN crafting AS C ON A.item_id = C.item_id
          JOIN items as D ON C.item_material_id = D.item_id WHERE A.item_id = ?`
          , [this.props.item_id], (tx, results) => {
            const len = results.rows.length;
            for (let i = 0; i < len; i += 1) {
              craftMaterials.push(results.rows.item(i));
            }
          },
        );
        tx.executeSql(
          `SELECT D.item_id, D.name, C.quantity
          FROM weapons as A
          JOIN items AS B ON A.item_id = B.item_id
          JOIN weapon_upgrade_items AS C ON A.item_id = C.item_id
          JOIN items as D ON C.material_item_id = D.item_id WHERE A.item_id = ?`
          , [this.props.item_id], (tx, results) => {
            const len = results.rows.length;
            for (let i = 0; i < len; i += 1) {
              upgradeMaterials.push(results.rows.item(i));
            }
          },
        );
        tx.executeSql(
          `SELECT
            weapon_sharpness.*,
            weapon_bowgun_chars.*, weapon_coatings.*, weapon_kinsects.*, weapon_notes.*, weapon_phials.*, weapon_shellings.*,
            weapons.*, items.name as name, items.rarity as rarity
            FROM weapons
            JOIN items on weapons.item_id = items.item_id
            LEFT JOIN weapon_bowgun_chars ON weapons.item_id = weapon_bowgun_chars.item_id
            LEFT JOIN weapon_coatings ON weapons.item_id = weapon_coatings.item_id
            LEFT JOIN weapon_kinsects ON weapons.item_id = weapon_kinsects.item_id
            LEFT JOIN weapon_notes ON weapons.item_id = weapon_notes.item_id
            LEFT JOIN weapon_phials ON weapons.item_id = weapon_phials.item_id
            LEFT JOIN weapon_sharpness ON weapons.item_id = weapon_sharpness.item_id
            LEFT JOIN weapon_shellings ON weapons.item_id = weapon_shellings.item_id
    		    WHERE weapons.upgrade_from = ?`
          , [this.props.item_id], (tx, results) => {
            const len = results.rows.length;
            for (let i = 0; i < len; i += 1) {
              upgradeTo.push(results.rows.item(i));
            }
            this.setState({
              info, ammo, craftMaterials, upgradeMaterials, upgradeTo, melodies, recoil, reload, loading: false,
            });
          },
        );
      } else {
        tx.executeSql(
          `SELECT D.item_id, D.name, C.quantity
          FROM kinsects as A
          JOIN items AS B ON A.item_id = B.item_id
          JOIN weapon_upgrade_items AS C ON A.item_id = C.item_id
          JOIN items as D ON C.material_item_id = D.item_id WHERE A.item_id = ?`
          , [this.props.item_id], (tx, results) => {
            const len = results.rows.length;
            for (let i = 0; i < len; i += 1) {
              upgradeMaterials.push(results.rows.item(i));
            }
          },
        );
        tx.executeSql(
          `SELECT A.*, B.name as name, B.rarity as rarity
            FROM kinsects as A
            JOIN items as B on A.item_id = B.item_id
    		    WHERE A.upgrade_from = ?`
          , [this.props.item_id], (tx, results) => {
            const len = results.rows.length;
            for (let i = 0; i < len; i += 1) {
              upgradeTo.push(results.rows.item(i));
            }
            this.setState({
              info, upgradeMaterials, upgradeTo, loading: false,
            });
          },
        );
      }
    });
  }

  renderSpecial(info) {
    if (info.type === 'charge_blade' || info.type === 'switch_axe') {
      return (
        <Right style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ flex: 1, fontSize: 12, color: colors.main, textAlign: 'center' }}>{`${info.phial.replace('Phial', '')}`}</Text>
        </Right>
      );
    } else if (info.type === 'dual_blade') {
      return (
        <Right style={{ flex: 1, alignItems: 'center' }}>
          {this.renderElement(info, true)}
        </Right>
      )
    } else if (info.type === 'insect_glaive') {
      return (
        <Right style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${info.kinsect}`}</Text>
        </Right>
      );
    } else if (info.type === 'gun_lance') {
      return (
        <Right style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{info.shelling}</Text>
        </Right>
      );
    } else if (info.type === 'hunting_horn') {
      return (
        <Right style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row', paddingLeft: 15, paddingRight: 15 }}>
            <Text style={{ flex: 1, fontSize: 18, color: info.note1.replace('white', 'gray'), textAlign: 'center' }}>{`\u266b`}</Text>
            <Text style={{ flex: 1, fontSize: 18, color: info.note2.replace('white', 'gray'), textAlign: 'center' }}>{`\u266b`}</Text>
            <Text style={{ flex: 1, fontSize: 18, color: info.note3.replace('white', 'gray'), textAlign: 'center' }}>{`\u266b`}</Text>
          </View>
        </Right>
      );
    } else if (info.type === 'bow') {
      return (
        <Right style={{ flex: 1, alignItems: 'center' }}>
          {this.renderCoatings(info)}
        </Right>
      );
    }
    return null;
  }

  renderElement(info, db) {
    if (db) {
      if (info.element_amount2 > 0) {
        return (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginLeft: 0, marginRight: 0 }}>
            <Text style={{ fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${info.element_amount2}`}</Text>
            <Image
              resizeMode="contain"
              style={{ height: 20, width: 20 }}
              source={ElementStatusImages[info.element_type2]}
            />
          </View>
        );
      }
      return (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${info.element_amount2}`}</Text>
        </View>
      )
    }
    if (info.req_armor_skill) {
      return (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginLeft: 0, marginRight: 0 }}>
          <Text style={{ fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`(${info.element_amount})`}</Text>
          <Image
            resizeMode="contain"
            style={{ height: 20, width: 20 }}
            source={ElementStatusImages[info.element_type]}
          />
        </View>
      );
    } else if (info.element_amount > 0) {
      return (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginLeft: 0, marginRight: 0 }}>
          <Text style={{ fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${info.element_amount}`}</Text>
          <Image
            resizeMode="contain"
            style={{ height: 20, width: 20 }}
            source={ElementStatusImages[info.element_type]}
          />
        </View>
      );
    }
    return (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${info.element_amount}`}</Text>
      </View>
    );
  }

  renderSecondaryInfo(info) {
    const {
      defense, affinity
    } = info;

    let special = '';
    if (info.type === 'charge_blade' || info.type === 'switch_axe') {
      special = 'Phial';
    } else if (info.type === 'dual_blade') {
      special = 'Element 2';
    } else if (info.type === 'insect_glaive') {
      special = 'Kinsect';
    } else if (info.type === 'hunting_horn') {
      special = 'Notes';
    } else if (info.type === 'gun_lance') {
      special = 'Shelling';
    } else if (info.type === 'bow') {
      special = 'Coating'
    }
    const specialComp = special === '' ? null :
      <Right style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ flex: 1, fontSize: 14, color: colors.main, textAlign: 'center' }}>{special}</Text>
      </Right>;

    return (
      <View>
        <ListItem style={{ marginLeft: 0, paddingLeft: 9, marginRight: 0, paddingRight: 9 }} itemDivider>
          <Left style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 14, color: colors.main, textAlign: 'center' }}>Affinty</Text>
          </Left>
          <Left style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 14, color: colors.main, textAlign: 'center' }}>Defense</Text>
          </Left>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 14, color: colors.main, textAlign: 'center' }}>Element</Text>
          </Body>
          {specialComp}
        </ListItem>
        <ListItem style={{ marginLeft: 0, paddingLeft: 9, marginRight: 0, paddingRight: 9 }}>
          <Left style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center', borderWidth: 0 }}>{`${affinity}%`}</Text>
          </Left>
          <Left style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center', borderWidth: 0 }}>{`+${defense}`} </Text>
          </Left>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            {this.renderElement(info, false)}
          </Body>
          {/* <Right style={{ flex: 1, alignItems: 'center' }}> */}
            {this.renderSpecial(info)}
          {/* </Right> */}
        </ListItem>
      </View>
    );
  }

  renderAmmo() {
    return (
      <View>
        <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
          <Text style={{ flex: 3, fontSize: 15.5, color: colors.main }}>Ammo Type</Text>
          <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Lv1</Text>
          <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Lv2</Text>
          <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Lv3</Text>
        </ListItem>
        {this.state.ammo.map((item, key) => {
          return (
            <ListItem key={key} style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}>
              <Text style={{ flex: 3, fontSize: 15.5, color: colors.main }}>{bulletTypes[item.bullet_type]}</Text>
              <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{item.level_1}</Text>
              <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{item.level_2}</Text>
              <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{item.level_3}</Text>
            </ListItem>
          );
        })}
      </View>
    );
  }

  renderCoatings(info) {
    const {
      cls, pow, par, poi, sle, bla,
    } = info;
    let margin = cls + pow + par + poi + sle + bla;

    if (margin <= 2) {
      margin = 25;
    } else {
      margin = 10;
    }

    const close = (cls === 1) ?
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Image
          resizeMode="contain"
          style={{ height: 22.5, width: 22.5 }}
          source={BowCoatings['Close']}
        />
      </View>
      : null;
    const power = (pow === 1) ?
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Image
        resizeMode="contain"
        style={{ height: 22.5, width: 22.5 }}
        source={BowCoatings['Power']}
      />
    </View>
      : null;
    const paralysis = (par === 1) ?
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Image
        resizeMode="contain"
        style={{ height: 22.5, width: 22.5 }}
        source={BowCoatings['Paralysis']}
      />
    </View>
      : null;
    const poison = (poi === 1) ?
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Image
        resizeMode="contain"
        style={{ height: 22.5, width: 22.5 }}
        source={BowCoatings['Poison']}
      />
    </View>
      : null;
    const sleep = (sle === 1) ?
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Image
        resizeMode="contain"
        style={{ height: 22.5, width: 22.5 }}
        source={BowCoatings['Sleep']}
      />
    </View>
      : null;
    const blast = (bla === 1) ?
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Image
        resizeMode="contain"
        style={{ height: 22.5, width: 22.5 }}
        source={BowCoatings['Blast']}
      />
    </View>
      : null;
    return (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: margin, marginRight: margin }}>
        {close}{power}{paralysis}{poison}{sleep}{blast}
      </View>
    );
  }

  renderBowGunSecondaryInfo(info) {
    const {
      deviation, defense, affinity, special_ammo
    } = info;

    return (
      <View>
        <ListItem style={{ marginLeft: 0, paddingLeft: 9, marginRight: 0, paddingRight: 9, justifyContent: 'center' }} itemDivider>
          <Left style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 14, color: colors.main, textAlign: 'center' }}>Defense</Text>
          </Left>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 14, color: colors.main, textAlign: 'center' }}>Affinty</Text>
          </Body>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 14, color: colors.main, textAlign: 'center' }}>Deviation</Text>
          </Body>
          <Right style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 14, color: colors.main, textAlign: 'center' }}>Special</Text>
          </Right>
        </ListItem>
        <ListItem style={{ marginLeft: 0, paddingLeft: 9, marginRight: 0, paddingRight: 9, justifyContent: 'center' }}>
          <Left style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${defense}`} </Text>
          </Left>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${affinity}%`}</Text>
          </Body>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${deviation}`}</Text>
          </Body>
          <Right style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 13.5, color: colors.main, textAlign: 'center' }}>{`${special_ammo}`}</Text>
          </Right>
        </ListItem>
      </View>
    );
  }

  renderKinsectInfo() {
    console.log(this.state.info);
    const {
       type, power, speed, heal, dust, rarity
    } = this.state.info;
    return (
      <View>
        <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Type</Text>
          </Body>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 0.5, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Rarity</Text>
          </Body>
        </ListItem>
        <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${type}`}</Text>
          </Body>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 0.5, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${rarity}`}</Text>
          </Body>
        </ListItem>
        <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row' }}>
              <Image
                resizeMode="contain"
                style={{ width: 12.5, height: 12.5 }}
                source={WeaponImages['Kinsect Dust']}
              />
              <Text style={{ fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Dust</Text>
            </View>
          </Body>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Image
                resizeMode="contain"
                style={{ width: 12.5, height: 12.5 }}
                source={WeaponImages['Kinsect Power']}
              />
              <Text style={{ fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Power</Text>
            </View>
          </Body>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Image
                resizeMode="contain"
                style={{ width: 12.5, height: 12.5 }}
                source={WeaponImages['Kinsect Heal']}
              />
              <Text style={{ fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Heal</Text>
            </View>
          </Body>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Image
                resizeMode="contain"
                style={{ width: 12.5, height: 12.5 }}
                source={WeaponImages['Kinsect Speed']}
              />
              <Text style={{ fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Speed</Text>
            </View>
          </Body>
        </ListItem>
        <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${dust}`}</Text>
          </Body>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 0.5, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`LV ${power}`}</Text>
          </Body>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 0.5, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`LV ${heal}`}</Text>
          </Body>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 0.5, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`LV ${speed}`}</Text>
          </Body>
        </ListItem>
      </View>
    );
  }

  renderInfo(info) {
    const {
      damage, true_damage, req_armor_skill, element_amount, element_type, defense, affinity, rarity, slot1, slot2, slot3,
    } = info;
    const slotOne = (slot1 === 0) ? `-` : (slot1 === 1) ? `\u2460` : (slot1 === 2) ? `\u2461` : `\u2462`;
    const slotTwo = (slot2 === 0) ? `-` : (slot2 === 1) ? `\u2460` : (slot2 === 2) ? `\u2461` : `\u2462`;
    const slotThree = (slot3 === 0) ? `-` : (slot3 === 1) ? `\u2460` : (slot3 === 2) ? `\u2461` : `\u2462`;

    return (
      <View>
        <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
          <Left style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Attack</Text>
          </Left>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 0.5, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Slots</Text>
          </Body>
          <Right style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 0.5, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Rarity</Text>
          </Right>
          {/* <Right style={{ flex: 1.5, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>Sharpness</Text>
          </Right> */}
        </ListItem>
        <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}>
          <Left style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${damage} (${true_damage})`} </Text>
          </Left>
          <Body style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 0.5, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{`${slotOne} ${slotTwo} ${slotThree}`}</Text>
          </Body>
          <Right style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ flex: 0.5, fontSize: 15.5, color: colors.main, textAlign: 'center' }}>{rarity}</Text>
          </Right>
          {/* <Right style={{ flex: 1.5, alignItems: 'center' }}>
            <View style={{ flex: 1, flexDirection: 'row', width: 104, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ flex: red, height: 10, backgroundColor: '#C4424E', marginRight: -0.5 }}/>
              <View style={{ flex: orange, height: 10, backgroundColor: '#DE7A56', marginRight: -0.5 }}/>
              <View style={{ flex: yellow, height: 10, backgroundColor: '#D5BF45', marginRight: -0.5 }}/>
              <View style={{ flex: green, height: 10, backgroundColor: '#94BB46', marginRight: -0.5 }}/>
              <View style={{ flex: blue, height: 10, backgroundColor: '#465DD1', marginRight: -0.5}}/>
              <View style={{ flex: white, height: 10, backgroundColor: colors.background, marginRight: -0.5 }}/>
              <View style={{ flex: black, height: 10, backgroundColor: 'black', marginRight: -0.5 }}/>
            </View>
          </Right> */}
        </ListItem>
      </View>
    );
  }

  renderSharpness(info) {
    const {
      red, orange, yellow, green, blue, white, black,
      red2, orange2, yellow2, green2, blue2, white2, black2,
    } = info;

    return (
      <View>
        <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
          <Left>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Sharpness</Text>
          </Left>
          <Right />
        </ListItem>
        <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}>
          <Left>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.secondary }}>
              <View style={{ flex: red, height: 10, backgroundColor: '#C4424E', marginRight: -0.5 }}/>
              <View style={{ flex: orange, height: 10, backgroundColor: '#DE7A56', marginRight: -0.5 }}/>
              <View style={{ flex: yellow, height: 10, backgroundColor: '#D5BF45', marginRight: -0.5 }}/>
              <View style={{ flex: green, height: 10, backgroundColor: '#94BB46', marginRight: -0.5 }}/>
              <View style={{ flex: blue, height: 10, backgroundColor: '#465DD1', marginRight: -0.5}}/>
              <View style={{ flex: white, height: 10, backgroundColor: colors.background, marginRight: -0.5 }}/>
              <View style={{ flex: black, height: 10, backgroundColor: 'black', marginRight: -0.5 }}/>
            </View>
          </Left>
        </ListItem>
        <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}>
          <Left>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.secondary }}>
              <View style={{ flex: red2, height: 10, backgroundColor: '#C4424E', marginRight: -0.5 }}/>
              <View style={{ flex: orange2, height: 10, backgroundColor: '#DE7A56', marginRight: -0.5 }}/>
              <View style={{ flex: yellow2, height: 10, backgroundColor: '#D5BF45', marginRight: -0.5 }}/>
              <View style={{ flex: green2, height: 10, backgroundColor: '#94BB46', marginRight: -0.5 }}/>
              <View style={{ flex: blue2, height: 10, backgroundColor: '#465DD1', marginRight: -0.5}}/>
              <View style={{ flex: white2, height: 10, backgroundColor: colors.background, marginRight: -0.5 }}/>
              <View style={{ flex: black2, height: 10, backgroundColor: 'black', marginRight: -0.5 }}/>
            </View>
          </Left>
        </ListItem>
      </View>

    );
  }
  renderCrafting() {
    if (this.state.craftMaterials.length > 0) {
      return (
        <View>
          <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
            <Left>
              <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Craft Material</Text>
            </Left>
            <Right>
              <Text style={{ flex: 1, fontSize: 15.5, color: colors.secondary }}>Quantity</Text>
            </Right>
          </ListItem>
          {this.state.craftMaterials.map((item, key) => {
            return (
              <View key={key}>
                <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}
                  onPress={() => this.props.navigator.push({
                    screen: 'TablessInfoScreen',
                    passProps: {
                      item_id: item.item_id,
                      type: 'item',
                    },
                    animationType: 'slide-horizontal',
                    title: item.name,
                  })}
                  >
                  <Left>
                    <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>{item.name}</Text>
                  </Left>
                  <Right>
                    <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>{`x${item.quantity}`}</Text>
                  </Right>
                </ListItem>
              </View>
            );
          })
          }
        </View>
      );
    }
    return (
      null
    );
  }

  renderUpgrading() {
    if (this.state.upgradeMaterials.length > 0) {
      return (
        <View>
          <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
            <Left>
              <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Upgrade Material</Text>
            </Left>
            <Right>
              <Text style={{ flex: 1, fontSize: 15.5, color: colors.secondary }}>Quantity</Text>
            </Right>
          </ListItem>
          {this.state.upgradeMaterials.map((item, key) => {
            return (
              <View key={key}>
                <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }}
                  onPress={() => this.props.navigator.push({
                    screen: 'TablessInfoScreen',
                    passProps: {
                      item_id: item.item_id,
                      type: 'item',
                    },
                    animationType: 'slide-horizontal',
                    title: item.name,
                  })}
                  >
                  <Left>
                    <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>{item.name}</Text>
                  </Left>
                  <Right>
                    <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>{`x${item.quantity}`}</Text>
                  </Right>
                </ListItem>
              </View>
            );
          })
          }
        </View>
      );
    }
    return (
      null
    );
  }

  renderUpgradeTo() {
    if (this.state.upgradeTo.length > 0) {
      return (
        <View>
          <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
            <Left>
              <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Next Weapon</Text>
            </Left>
            <Right>
            </Right>
          </ListItem>
          {this.state.upgradeTo.map((item, key) => {
            if (this.props.type === 'kinsect') {
              return <KinsectListItem key={key} navigator={this.props.navigator} item={item} />;
            }
            return (
              <WeaponListItem key={key} navigator={this.props.navigator} item={item} />
            );
          })}
        </View>
      );
    }
    return (
      null
    );
  }

  renderHornMelodies() {
    if (this.state.melodies.length > 0) {
      return (
        <View>
          <ListItem style={{ marginLeft: 0, paddingLeft: 8, marginRight: 0, paddingRight: 8 }} itemDivider>
            <View style={{ flex: 0.75, borderWidth: 0, borderColor: colors.accent }}>
              <Text style={{ flex: 1, fontSize: 9.5, color: colors.main }}>Notes</Text>
            </View>
            <View style={{ flex: 1, borderWidth: 0, borderColor: 'orange' }}>
              <Text style={{ flex: 1, fontSize: 9.5, color: colors.main }}>Effect</Text>
            </View>
            <View style={{ flex: 1, borderWidth: 0, borderColor: 'yellow' }}>
              <Text style={{ flex: 1, fontSize: 9.5, color: colors.main }}>Effect 2</Text>
            </View>
            <View style={{ flex: 0.65, borderWidth: 0, borderColor: 'green' }}>
              <Text style={{ flex: 1, fontSize: 9.5, color: colors.secondary }}>Duration</Text>
            </View>
            <View style={{ flex: 0.65, borderWidth: 0, borderColor: 'blue' }}>
              <Text style={{ flex: 1, fontSize: 9.5, color: colors.secondary }}>Extension</Text>
            </View>
          </ListItem>
          {this.state.melodies.map((item, key) => {
            return (
              <View key={key}>
                <ListItem style={{ marginLeft: 0, paddingLeft: 8, marginRight: 0, paddingRight: 8, alignItems: 'center' }}>
                  <View style={{ flex: 0.75, borderWidth: 0, borderColor: colors.accent, alignItems: 'center' }}>
                    {this.renderHuntingHornNotes(item)}
                  </View>
                  <View style={{ flex: 1, borderWidth: 0, borderColor: 'orange' }}>
                    <Text style={{ flex: 1, fontSize: 9.5, color: colors.main, textAlign: 'center' }}>{`${item.effect1}`}</Text>
                  </View>
                  <View style={{ flex: 1, borderWidth: 0, borderColor: 'yellow' }}>
                    <Text style={{ flex: 1, fontSize: 9.5, color: colors.main, textAlign: 'center' }}>{`${item.effect2}`}</Text>
                  </View>
                  <View style={{ flex: 0.65, borderWidth: 0, borderColor: 'green' }}>
                    <Text style={{ flex: 1, fontSize: 9.5, color: colors.secondary, textAlign: 'center' }}>{`${item.duration}`}</Text>
                  </View>
                  <View style={{ flex: 0.65, borderWidth: 0, borderColor: 'blue' }}>
                    <Text style={{ flex: 1, fontSize: 9.5, color: colors.secondary, textAlign: 'center' }}>{`${item.extension}`}</Text>
                  </View>
                </ListItem>
              </View>
            );
          })
          }
        </View>
      );
    }
    return null;
  }

  renderHuntingHornNotes(item) {
    if (item.note4 !== null) {
      return (
        <View style={{ flexDirection: 'row', borderWidth: 0 }}>
          <Text style={{ textAlign: 'center', fontSize: 16.5, color: item.note1.replace('white', 'gray').replace('yellow', '#D5BF45') }}>{`\u266b`}</Text>
          <Text style={{ textAlign: 'center', fontSize: 16.5, color: item.note2.replace('white', 'gray').replace('yellow', '#D5BF45') }}>{`\u266b`}</Text>
          <Text style={{ textAlign: 'center', fontSize: 16.5, color: item.note3.replace('white', 'gray').replace('yellow', '#D5BF45') }}>{`\u266b`}</Text>
          <Text style={{ textAlign: 'center', fontSize: 16.5, color: item.note4.replace('white', 'gray').replace('yellow', '#D5BF45') }}>{`\u266b`}</Text>
        </View>
      );
    } else if (item.note3 !== null) {
      return (
        <View style={{ flexDirection: 'row', borderWidth: 0 }}>
          <Text style={{ textAlign: 'center', fontSize: 16.5, color: item.note1.replace('white', 'gray').replace('yellow', '#D5BF45') }}>{`\u266b`}</Text>
          <Text style={{ textAlign: 'center', fontSize: 16.5, color: item.note2.replace('white', 'gray').replace('yellow', '#D5BF45') }}>{`\u266b`}</Text>
          <Text style={{ textAlign: 'center', fontSize: 16.5, color: item.note3.replace('white', 'gray').replace('yellow', '#D5BF45') }}>{`\u266b`}</Text>
        </View>
      );
    }
    return (
      <View style={{ flexDirection: 'row', borderWidth: 0 }}>
        <Text style={{ textAlign: 'center', fontSize: 16.5, color: item.note1.replace('white', 'gray').replace('yellow', '#D5BF45') }}>{`\u266b`}</Text>
        <Text style={{ textAlign: 'center', fontSize: 16.5, color: item.note2.replace('white', 'gray').replace('yellow', '#D5BF45') }}>{`\u266b`}</Text>
      </View>
    );
  }

  renderRecoil() {
    return (
      <View>
        <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
          <Left style={{ flex: 1.5 }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Ammo</Text>
          </Left>
          <Right style={{ flex: 1 }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Lv 0</Text>
          </Right>
          <Right style={{ flex: 1 }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Lv 1</Text>
          </Right>
          <Right style={{ flex: 1 }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Lv 2</Text>
          </Right>
          <Right style={{ flex: 1 }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Lv 3</Text>
          </Right>
        </ListItem>
        {this.state.recoil.map((item, key) => {
          return (
            <View key={key}>
              <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18, alignItems: 'center' }}>
                <Left style={{ flex: 1.5 }}>
                  <Text style={{ flex: 1, fontSize: 10, color: colors.main }}>{item.name}</Text>
                </Left>
                <Right style={{ flex: 1 }}>
                  <Text style={{ flex: 1, fontSize: 10, color: colors.main }}>{item.mods_0.replace('h', 'High').replace('a', 'Avg').replace('l', 'Low')}</Text>
                </Right>
                <Right style={{ flex: 1 }}>
                  <Text style={{ flex: 1, fontSize: 10, color: colors.main }}>{item.mods_1.replace('h', 'High').replace('a', 'Avg').replace('l', 'Low')}</Text>
                </Right>
                <Right style={{ flex: 1 }}>
                  <Text style={{ flex: 1, fontSize: 10, color: colors.main }}>{item.mods_2.replace('h', 'High').replace('a', 'Avg').replace('l', 'Low')}</Text>
                </Right>
                <Right style={{ flex: 1 }}>
                  <Text style={{ flex: 1, fontSize: 10, color: colors.main }}>{item.mods_3.replace('h', 'High').replace('a', 'Avg').replace('l', 'Low')}</Text>
                </Right>
              </ListItem>
            </View>
          );
        })}
      </View>
    );
  }

  renderReload() {
    return (
      <View>
        <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18 }} itemDivider>
          <Left style={{ flex: 1.5 }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Ammo</Text>
          </Left>
          <Right style={{ flex: 1 }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Lv 0</Text>
          </Right>
          <Right style={{ flex: 1 }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Lv 1</Text>
          </Right>
          <Right style={{ flex: 1 }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Lv 2</Text>
          </Right>
          <Right style={{ flex: 1 }}>
            <Text style={{ flex: 1, fontSize: 15.5, color: colors.main }}>Lv 3</Text>
          </Right>
        </ListItem>
        {this.state.reload.map((item, key) => {
          return (
            <View key={key}>
              <ListItem style={{ marginLeft: 0, paddingLeft: 18, marginRight: 0, paddingRight: 18, alignItems: 'center' }}>
                <Left style={{ flex: 1.5 }}>
                  <Text style={{ flex: 1, fontSize: 10, color: colors.main }}>{item.name}</Text>
                </Left>
                <Right style={{ flex: 1 }}>
                  <Text style={{ flex: 1, fontSize: 10, color: colors.main }}>{item.mods_0.replace('s', 'Slow').replace('vs', 'Very Slow').replace('f', 'Fast').replace('n', 'Normal')}</Text>
                </Right>
                <Right style={{ flex: 1 }}>
                  <Text style={{ flex: 1, fontSize: 10, color: colors.main }}>{item.mods_1.replace('s', 'Slow').replace('vs', 'Very Slow').replace('f', 'Fast').replace('n', 'Normal')}</Text>
                </Right>
                <Right style={{ flex: 1 }}>
                  <Text style={{ flex: 1, fontSize: 10, color: colors.main }}>{item.mods_2.replace('s', 'Slow').replace('vs', 'Very Slow').replace('f', 'Fast').replace('n', 'Normal')}</Text>
                </Right>
                <Right style={{ flex: 1 }}>
                  <Text style={{ flex: 1, fontSize: 10, color: colors.main }}>{item.mods_3.replace('s', 'Slow').replace('vs', 'Very Slow').replace('f', 'Fast').replace('n', 'Normal')}</Text>
                </Right>
              </ListItem>
            </View>
          );
        })}
      </View>
    );
  }

  renderContent() {
    if (this.state.loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignSelf: 'stretch', backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color={colors.main}/>
        </View>
      );
    } else if (this.state.info.type === 'bow') {
      return (
        <ScrollView style={{ backgroundColor: colors.background }}>
          {this.renderInfo(this.state.info)}
          {this.renderSecondaryInfo(this.state.info)}
          {this.renderUpgrading()}
          {this.renderCrafting()}
          {this.renderUpgradeTo()}
        </ScrollView>
      );
    } else if (this.state.info.type.includes('bowgun')) {
      return (
        <Tabs
          prerenderingSiblingsNumber={3}
          scrollWithoutAnimation={false}
          tabBarUnderlineStyle={{ backgroundColor: colors.accent, height: 3 }}
          initialPage={0}>
         <Tab
           activeTabStyle={{ backgroundColor: colors.background }}
           tabStyle={{ backgroundColor: colors.background }}
           activeTextStyle={{ color: colors.main }}
           textStyle={{ color: colors.secondary }}
           heading="Info"
           >
           <ScrollView style={{ backgroundColor: colors.background }}>
             {this.renderInfo(this.state.info)}
             {this.renderBowGunSecondaryInfo(this.state.info)}
             {this.renderUpgrading()}
             {this.renderCrafting()}
             {this.renderUpgradeTo()}
             {this.renderAmmo(this.state.info)}
           </ScrollView>
         </Tab>
         <Tab
           activeTabStyle={{ backgroundColor: colors.background }}
           tabStyle={{ backgroundColor: colors.background }}
           activeTextStyle={{ color: colors.main }}
           textStyle={{ color: colors.secondary }}
           heading="Recoil"
           >
           <ScrollView style={{ backgroundColor: colors.background }}>
             {this.renderRecoil()}
           </ScrollView>
         </Tab>
         <Tab
           activeTabStyle={{ backgroundColor: colors.background }}
           tabStyle={{ backgroundColor: colors.background }}
           activeTextStyle={{ color: colors.main }}
           textStyle={{ color: colors.secondary }}
           heading="Reload"
           >
           <ScrollView style={{ backgroundColor: colors.background }}>
             {this.renderReload()}
           </ScrollView>
         </Tab>
       </Tabs>
      );
    } else if (this.props.type === 'kinsect') {
      return (
        <ScrollView style={{ backgroundColor: colors.background }}>
          {this.renderKinsectInfo()}
          {this.renderUpgrading()}
          {this.renderUpgradeTo()}
        </ScrollView>
      );
    }
    return (
      <ScrollView style={{ backgroundColor: colors.background }}>
        {this.renderInfo(this.state.info)}
        {this.renderSecondaryInfo(this.state.info)}
        {this.renderSharpness(this.state.info)}
        {this.renderUpgrading()}
        {this.renderCrafting()}
        {this.renderUpgradeTo()}
        {this.renderHornMelodies()}
      </ScrollView>
    );
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {this.renderContent()}
        <AdBanner />
      </View>
    );
  }
}

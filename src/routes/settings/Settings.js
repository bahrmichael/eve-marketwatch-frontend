import React from 'react';

import { Col, Row, Select, Switch, Button, Radio } from 'antd';
import * as api from '../../Client';
import { decodeToken } from '../../Authenticator';


const { Option } = Select;


export default class Settings extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      characterName: decodeToken().name,
      characterId: decodeToken().sub,
      corporationId: decodeToken().corporation_id,
      allianceId: decodeToken().alliance_id,
      deleteEnabled: false,
    };

  }
  
  componentDidMount() {

    api.getCharacterSettings(this.state.characterId)
      .then((data) => {
        this.setState({
          cadence: data.cadence,
          shareEnabled: data.sharing,
          notificationsEnabled: data.notifications,
          includeAllWatches: data.includeAllWatches,
          settingsLoaded: true,
        });
      });

    if (this.state.allianceId) {
      fetch(`https://esi.evetech.net/v3/alliances/${this.state.allianceId}/`)
        .then((response) => (response.json()))
        .then((data) => {
          this.setState({allianceName: data.name});
        });

        api.getAllianceMaintainers(this.state.allianceId)
        .then((data) => {
          this.setState({allianceMaintainerIds: data.map(character => character.id)});
          if (this.state.allianceMaintainerIds.indexOf(this.state.characterId) !== -1) {
            this.getAllianceMembers();
          } else {
            this.setState({allianceCharacters: data});
          }
        });
    }

    fetch(`https://esi.evetech.net/v4/corporations/${this.state.corporationId}/`)
        .then((response) => (response.json()))
        .then((data) => {
          this.setState({corporationName: data.name});
        });
    api.getCorporationMaintainers(this.state.corporationId)
        .then((data) => {
          console.log('retrieved corporation maintainers', data);
          const maintainerIds = data.map(character => character.id);
          this.setState({corporationMaintainerIds: maintainerIds});
          if (maintainerIds.indexOf(this.state.characterId) !== -1) {
            this.getCorporationMembers();
          } else {
            this.setState({corporationCharacters: data});
          }
        });
  }

  getCorporationMembers() {
    api.getCorporationMembers(this.state.corporationId)
      .then((data) => {
        this.setState({corporationCharacters: data});
      });
  }

  getAllianceMembers() {
    api.getAllianceMembers(this.state.allianceId)
      .then((data) => {
        this.setState({allianceCharacters: data});
      });
  }

  getMaintainerNames(ids, characters) {
    return characters.filter((character) => ids.indexOf(character.id) !== -1).map((character) => character.name);
  }

  onCadenceChange = async (e) => {
    this.setState({ cadenceSubmitting: true });
    const cadence = e.target.value;

    api.putSettings({ cadence }, this.state.characterId)
    .then(_ => {
      this.setState({
        cadence,
        cadenceSubmitting: false
      });
    });
  }

  takeControl = (groupType) => {
    const currentChar = {name: this.state.characterName, id: this.state.characterId};
    if (groupType === 'corporation') {
      this.setState({
        isTakingCorporationControl: true,
        corporationCharacters: [currentChar]
      });
    } else if (groupType === 'alliance') {
      this.setState({
        isTakingAllianceControl: true,
        allianceCharacters: [currentChar]
      });
    }
    
    this.updateMaintainers(groupType, [this.state.characterName], [currentChar]);
    this.setState({isTakingCorporationControl: false, isTakingAllianceControl: false});
  }

  getMaintainerIds(names, characters) {
    return names.map(name => {
      const maintainers = characters.filter(character => character.name === name);
      if (maintainers?.length) {
        return maintainers[0].id;
      } else {
        return undefined;
      }
    }).filter(id => id);
  }

  updateMaintainers = async(groupType, characterNames, groupCharacters) => {
    if (groupType === 'corporation') {
      const characterIds = this.getMaintainerIds(characterNames, groupCharacters);
      
      await api.putMaintainers('corporation', this.state.corporationId, characterIds);
      this.setState({
        corporationMaintainerIds: characterIds
      })
      if (characterNames?.length) {
        this.getCorporationMembers();
      }
    } else if (groupType === 'alliance') {
      const characterIds = this.getMaintainerIds(characterNames, groupCharacters);

      await api.putMaintainers('alliance', this.state.allianceId, characterIds);
      this.setState({
        allianceMaintainerIds: characterIds
      })
      if (characterNames?.length) {
        this.getAllianceMembers();
      }
    }
  }

  onNotificationsChanged = async (e) => {
    this.setState({ notificationsSubmitting: true });
    api.putSettings({ notifications: e }, this.state.characterId)
      .then(_ => {
        this.setState({
          notificationsEnabled: e,
          notificationsSubmitting: false
        });
      });
  }

  onIncludeAllWatchesChanged = async (e) => {
    this.setState({ includeAllWatchesSubmitting: true });
    api.putSettings({ includeAllWatches: e }, this.state.characterId)
      .then(_ => {
        this.setState({
          includeAllWatches: e,
          includeAllWatchesSubmitting: false
        });
      });
  }

  onSharedChanged = async (e) => {
    this.setState({ shareSubmitting: true });
    api.putSettings({ sharing: e }, this.state.characterId)
    .then(_ => {
      this.setState({
        shareEnabled: e,
        shareSubmitting: false
      });
    });
  }

  maintainer = (groupType) => {
    if (groupType === 'corporation' && (!this.state.corporationMaintainerIds || this.state.corporationMaintainerIds.length === 0)) {
      return (
        <Button type="primary" onClick={() => this.takeControl('corporation')} loading={this.state.isTakingCorporationControl}>Take control</Button>
      )
    } else if (groupType === 'alliance' && (!this.state.allianceMaintainerIds || this.state.allianceMaintainerIds.length === 0)) {
      return (
        <Button type="primary" onClick={() => this.takeControl('alliance')} loading={this.state.isTakingAllianceControl}>Take control</Button>
      )
    } else if (groupType === 'corporation' && this.state.corporationMaintainerIds?.indexOf(this.state.characterId) !== -1 && this.state.corporationCharacters) {
      return (
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Please select corporation members"
          defaultValue={() => this.getMaintainerNames(this.state.corporationMaintainerIds, this.state.corporationCharacters)}
          onChange={(e) => this.updateMaintainers('corporation', e, this.state.corporationCharacters)}
        >
          {this.state.corporationCharacters.map((character) => <Option key={character.name}>{character.name}</Option>)}
        </Select>
      )
    } else if (groupType === 'alliance' && this.state.allianceMaintainerIds?.indexOf(this.state.characterId) !== -1 && this.state.allianceCharacters) {
      return (
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Please select alliance members"
          defaultValue={() => this.getMaintainerNames(this.state.allianceMaintainerIds, this.state.allianceCharacters)}
          onChange={(e) => this.updateMaintainers('alliance', e, this.state.allianceCharacters)}
        >
          {this.state.allianceCharacters.map((character) => <Option key={character.name}>{character.name}</Option>)}
        </Select>
      )
    } else if (groupType === 'corporation' && this.state.corporationMaintainerIds && this.state.corporationCharacters) {
      return (
        <>
          <p>Your corporation is maintained by the following capsuleers. If you want to help, please ask them to add you.</p>
          <ul>{this.state.corporationMaintainerIds.map(id => {
            const name = this.state.corporationCharacters.filter(character => character.id === id)[0].name;
            return <li>{name}</li>
          })}</ul>
        </>
      )
    } else if (groupType === 'alliance' && this.state.allianceMaintainerIds && this.state.allianceCharacters) {
      return (
        <>
          <p>Your alliance is maintained by the following capsuleers. If you want to help, please ask them to add you.</p>
          <ul>{this.state.allianceMaintainerIds.map(id => {
            const name = this.state.allianceCharacters.filter(character => character.id === id)[0].name;
            return <li>{name}</li>
          })}</ul>
        </>
      )
    }
  };

  render() {

    return (
      <>
      {
        this.state.settingsLoaded ? 
        <>
        <h2>Notifications</h2>
        <Row gutter={[32, 32]}>
          <Col lg={8} md={12}>
            <p>You will receive notifications through ingame mail when an item watch is triggered, e.g. by an item being sold out or running low.</p>
          </Col>
          <Col md={12}>
            <Switch loading={this.state.notificationsSubmitting} checkedChildren="enabled" unCheckedChildren="disabled" checked={this.state.notificationsEnabled} onChange={this.onNotificationsChanged.bind(this)} />
          </Col>
        </Row>
        <Row gutter={[32, 32]}>
          <Col lg={8} md={12}>
            <p>Include all previously triggered watches when sending new mail. <br/><b>Only works if you set the cadence do daily or weekly.</b></p>
          </Col>
          <Col md={12}>
            <Switch loading={this.state.includeAllWatchesSubmitting} disabled={['15 minutes', 'hourly'].includes(this.state.cadence)} checkedChildren="enabled" unCheckedChildren="disabled" checked={this.state.includeAllWatches} onChange={this.onIncludeAllWatchesChanged.bind(this)} />
          </Col>
        </Row>

        <h2>Cadence</h2>
        <Row gutter={[32, 32]}>
          <Col lg={8} md={12}>
            <p>You can configure how often you want to receive notifications, if any watches were triggered.</p>
          </Col>
          <Col md={12}>
            <Radio.Group onChange={this.onCadenceChange} value={this.state.cadence} disabled={this.state.cadenceSubmitting}>
              <Radio value={'15 minutes'}>15 Minutes</Radio>
              <Radio value={'hourly'}>Hourly</Radio>
              <Radio value={'daily'}>Daily</Radio>
              <Radio value={'weekly'}>Weekly</Radio>
            </Radio.Group>
          </Col>
        </Row>

        <h2>Corporation Maintainers</h2>
        <Row gutter={[32, 32]}>
          <Col lg={8} md={12}>
            <p>You can configure who may add, update or remove corporation watches. Please note that those capsuleers can also add, update and remove corporation maintainers.</p>
            <p>Only capsuleers with an account on EVE Market Watch are available.</p>
          </Col>
          <Col md={12}>
            <p><b>{this.state.corporationName}</b>&nbsp;<small>Corporation</small></p>
            {this.state.corporationMaintainerIds && this.state.corporationCharacters ? this.maintainer('corporation') : <span>Loading ...</span>}
          </Col>
        </Row>
        <h2>Alliance Maintainers</h2>
        <Row gutter={[32, 32]}>
          <Col lg={8} md={12}>
            <p>You can configure who may add, update or remove alliance watches. Please note that those capsuleers can also add, update and remove alliance maintainers.</p>
            <p>Only capsuleers with an account on EVE Market Watch are available.</p>
          </Col>
          <Col md={12}>
            {
              this.state.allianceId ?
              <>
                <p><b>{this.state.allianceName}</b>&nbsp;<small>Alliance</small></p>
                {this.state.allianceMaintainerIds && this.state.allianceCharacters ? this.maintainer('alliance') : <span>Loading ...</span>}
              </>
              :
              <p>You are not in an alliance.</p>
            }
          </Col>
        </Row>
        </>
        :
        <p>Loading ...</p>
      }
      </>
    );
  }
}
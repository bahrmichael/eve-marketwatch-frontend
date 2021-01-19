import React from 'react';

import { Col, Row, Alert } from 'antd';

import { StationCard } from './StationCard';
import { StructureSearch } from './StructureSearch';
import { WatchTable } from './WatchTable';
import { decodeToken } from '../../Authenticator';
import * as api from '../../Client';


export class Watches extends React.Component {

  constructor(props) {
    super(props);
    const token = decodeToken();
    this.state = {
      characterId: token.sub,
      corporationId: token.corporation_id,
      allianceId: token.alliance_id, // can be undefined
      watchesData: [],
      tables: [],
      pagination: {
        current: 1,
        pageSize: 50,
      },
    }
  }

  componentDidMount() {

    if (this.state.allianceId) {
      api.getAllianceMaintainers(this.state.allianceId)
        .then((data) => {
          this.setState({isAllianceMaintainer: data.filter(character => character.id === this.state.characterId).length > 0});
        });
    }

    api.getCorporationMaintainers(this.state.corporationId)
      .then((data) => {
        this.setState({isCorporationMaintainer: data.filter(character => character.id === this.state.characterId).length > 0});
      });

    api.getStructures()
      .then(data => this.setState({structures: data}));


    const recentStructure = JSON.parse(localStorage.getItem('recent-structure'));
    if (recentStructure) {
      this.onStructureChange(recentStructure);
    }
  }

  onStructureChange(structure) {
    
    if (structure?.structureId) {
      // remember which structure we selected last
      localStorage.setItem('recent-structure', JSON.stringify(structure));

      this.handleTableChange(this.state.pagination, {}, {}, {}, structure.structureId);
    } else {
      console.error('failed to update state with', structure);
    }

    this.setState({structure});
  }
  
  handleTableChange(pagination, filters, sorter, currentDataSource, structureId) {
    this.getWatches({
      sortField: sorter.field,
      sortOrder: sorter.order,
      pagination,
      structureId,
      ...filters,
    });
  };

  folderWatches(watches) {
    const folders = {};
    for (const watch of watches) {
      const folder = watch.folder || 'No Folder';

      if (!folders[folder]) {
        folders[folder] = []
      }
      folders[folder].push(watch);
    }

    return folders;
  }

  getWatches(params = {}) {
    this.setState({ tableLoading: true });
    const structureId = params.structureId || this.state.structure.structureId;
    const apiParams = {...params.pagination, ...params};
    api.getWatches(structureId, apiParams)
    .then(data => {
      const watchGroups = this.folderWatches(data?.watches ?? []);
      const tables = Object.entries(watchGroups).map((e) => {return{key: e[0], watches: e[1]}});
      this.setState({
        tableLoading: false,
        tables,
        watchesData: data?.watches ?? [],
        pagination: {
          ...params.pagination,
          total: data?.total ?? 0,
        },
      });
    });
  };

  shouldShowHeadline() {
    return this.state.tables.length > 1;
  }

  render() {
    return (
      <>
        <Row>
          <Col style={{width: '100%'}}>
          { localStorage.getItem('hide-alert-intro-video') ?
              <></> :
              <Alert
                  style={{marginBottom: '20px'}}
                  message="Learn how to use EVE Market Watch"
                  description={<a href="https://youtu.be/Rdy7u3vdWrY" target="_blank" rel="noreferrer noopener">Watch this short introduction to get familiar with the basic features!</a>}
                  type="info"
                  showIcon
                  closable
                  onClose={() => localStorage.setItem('hide-alert-intro-video', 'true')}
                />
            }
          </Col>
        </Row>
        <Row>
          <Col md={24} lg={12}>
            <StationCard watches={this.state.watchesData} structure={this.state.structure} structures={this.state.structures || []} reloadStructure={() => this.onStructureChange(this.state.structure)} isCorporationMaintainer={this.state.isCorporationMaintainer} isAllianceMaintainer={this.state.isAllianceMaintainer} />
          </Col>
          <Col md={24} lg={12}>
            <StructureSearch structures={this.state.structures || []} onStructureChange={this.onStructureChange.bind(this)} />
            <Alert
              message="Support EVE Market Watch"
              description={
                <>
                  <a href="https://www.patreon.com/bePatron?u=28933953" target="_blank" rel="noopener noreferrer">Support this project and get a shiny Discord role by becoming a Patreon!</a>
                </>
              }
              type="info"
              showIcon
              style={{ margin: '10%' }}
            />
          </Col>
        </Row>
        {
          this.state?.tables?.map((table) => {
            return (
              <Row style={{ marginTop: '30px' }}>
                { this.shouldShowHeadline() ? <h2>{table.key}</h2> : <></>}
                <WatchTable key={table.key} pagination={this.state.pagination} handleTableChange={this.handleTableChange.bind(this)} data={table.watches} structure={this.state.structure} loading={this.state.tableLoading} onWatchChange={() => this.onStructureChange(this.state.structure)} isCorporationMaintainer={this.state.isCorporationMaintainer} isAllianceMaintainer={this.state.isAllianceMaintainer} />
              </Row>
            )
          })
        }
      </>
    )
  }
}
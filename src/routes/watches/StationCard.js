import React from 'react';

import { NewWatchDrawerContent } from './NewWatchDrawer';

import { Card, Drawer, Button, Col, Row, Input, message, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import {ImportModal} from './ImportModal';
import {ExportModal} from './ExportModal';
import {DeleteModal} from './DeleteModal';


import * as api from '../../Client';
import {decodeToken} from '../../Authenticator';

import * as fileDownload from 'js-file-download';


const { Meta } = Card;

export class StationCard extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      importInProgress: false,
      exportInProgress: false,
    };
  }

  onClose = () => {
    this.setState({
      drawerVisisble: false,
      exportModalVisible: false,
      importModalVisible: false,
      deleteModalVisible: false,
      importProgress: null,
      deleteProgress: null
    });
  };

  onEvepraisalEntered = e => {
    this.setState({
      importReady: true,
    });
  };

  importer() {
    if (this.state.importer === 'evepraisal') {
      return (
        <>
          <p>With evepraisal, you can only import personal watches for a single station. Use the Marketwatch format to import watches for multiple stations at once.</p>
          <Input placeholder="Please enter an evepraisal link" onChange={this.onEvepraisalEntered} />
        </>
      );
    } else if (this.state.importer === 'marketwatch') {
      return (
        <></>
      )
    } else {
      return <p>To import watches, please select an import format.</p>
    }
  }

  async doImport(importInfo) {
    const type = importInfo.type;

    let ownerId;
    if (importInfo.owner === 'Personal') {
      ownerId = decodeToken().sub;
    } else if (importInfo.owner === 'Corporation') {
      ownerId = decodeToken().corporation_id;
    } else if (importInfo.owner === 'Alliance') {
      ownerId = decodeToken().alliance_id;
    }
    
    if (type === 'evepraisal') {
      this.setState({importProgress: 1});

      // get evepraisal json
      const data = await fetch(`${importInfo.evepraisalLink}.json`).then((response) => response.json());
      this.setState({importProgress: 2});

      // build watches
      // bad lines in evepraisal will cause a typeID 0 which results in an unusable watch
      const watches = data.items.filter((item) => item.typeID !== 0).map((item) => {
        return {
          structureId: this.props.structure.structureId,
          ownerId: ownerId,
          typeName: item.typeName,
          typeId: item.typeID,
          threshold: item.quantity,
          buy: false,
          comparator: 'lt',
        };
      });

      // submit watches
      for (let index = 0; index < watches.length; index++) {
        const watch = watches[index];
        try {
          await api.putWatch(watch);
          this.setState({importProgress: Math.round((index + 1 + 2) / watches.length * 100)});
        } catch (err) {
          message.error("Failed to import a watch. Please try again.");
          return;
        }
      }

      setTimeout(this.onClose, 500);
      this.props.reloadStructure();
    } else if (type === 'file') {
      const reader = new FileReader();
      reader.readAsText(importInfo.file);
      reader.onload = async() => {
        const result = JSON.parse(reader.result);
        const watches = [];
        for (const locationIdStr of Object.keys(result)) {
          const locationId = +locationIdStr;
          if (result[locationId].personal.length > 0) {
            for (const watch of result[locationId].personal) {
              watch.ownerId = decodeToken().sub
              watch.structureId = locationId;
              watches.push(watch);
            }
          }
          if (result[locationId].corporation?.length > 0 && this.props.isCorporationMaintainer) {
            for (const watch of result[locationId].corporation) {
              watch.ownerId = decodeToken().corporation_id
              watch.structureId = locationId;
              watches.push(watch);
            }
          }
          if (result[locationId].alliance?.length > 0 && this.props.isAllianceMaintainer) {
            for (const watch of result[locationId].alliance) {
              watch.ownerId = decodeToken().alliance_id
              watch.structureId = locationId;
              watches.push(watch);
            }
          }
        }

        for (let index = 0; index < watches.length; index++) {
          const watch = watches[index];
          try {
            await api.putWatch(watch);
            this.setState({importProgress: Math.round((index + 1) / watches.length * 100)});
          } catch (err) {
            message.error("Failed to import a watch. Please try again.");
            return;
          }
        }
        setTimeout(this.onClose, 500);
        this.props.reloadStructure();
      }
    } else {
      throw new Error(`Unknown import type ${type}`);
    }
  }

  doExport(exportInfo) {   
    this.onClose(); 
    const hideMessage = message.loading('Generating export ...', 0);
    let requestInfo = {
      type: exportInfo.type,
      owners: exportInfo.owners?.map((o) => o.toLowerCase()) || ['personal'],
      locationIds: exportInfo.structures || [this.props.structure.structureId]
    };

    api.putExport(requestInfo)
      .then((data) => {
        if (exportInfo.type === 'file') {
          fetch(data.link)
            .then((response) => response.json())
            .then((data) => {
              hideMessage();
              fileDownload(JSON.stringify(data), 'evemarketwatch-export.json');
            });
        } else {
          hideMessage();
          const link = exportInfo.type === 'link' ? `https://evemarketwatch.com/import?id=${data.exportId}` : `https://evepraisal.com/a/${data.appraisalId}`;
          navigator.clipboard.writeText(link).then(function() {
            message.success('The Link has been copied to your clipboard.', 5);
          }, function(err) {
            message.error('Failed to copy the link to your clipboard.', 10);
            console.error('Async: Could not copy text: ', err);
          });
        }
      });
    
  }

  onImporterChange = e => {
    this.setState({
      importer: e.target.value,
    });
  };

  onExporterChange = e => {
    this.setState({
      exporter: e.target.value,
    });
  };

  onNewWatch = async(e) => {
      const watch = {
        ownerId: decodeToken().sub,
        buy: e.orderType === 'buy',
        structureId: this.props.structure.structureId,
        ...e
      }

      if (watch.owner === 'corporation') {
        watch.ownerId = decodeToken().corporation_id
      } else if (watch.owner === 'alliance') {
        watch.ownerId = decodeToken().alliance_id
      } else {
        watch.ownerId = decodeToken().sub
      }

      await api.putWatch(watch);
      this.onClose();
      this.props.reloadStructure();
      notification.open({
        message: 'Watch created',
        description:
          'You can find it in the table below, but it might be in a later page.'
      });
  };

  async deleteAllWatches(targetOwner) {
    let processed = [];
    let total = this.props.watches?.length;
    for (const watch of this.props.watches) {
      if (targetOwner === 'personal' && watch.owners.includes('personal')) {
        watch.ownerId = decodeToken().sub
      } else if (targetOwner === 'corporation' && this.props.isCorporationMaintainer && watch.owners.includes('corporation')) {
        watch.ownerId = decodeToken().corporation_id
      } else if (targetOwner === 'alliance' && this.props.isAllianceMaintainer && watch.owners.includes('alliance')) {
        watch.ownerId = decodeToken().alliance_id
      } else {
        total -= 1;
        continue;
      }
      
      await api.deleteWatch(watch);

      processed.push(0);
      this.setState({deleteProgress: Math.round(processed.length / total * 100)});
    }

    this.onClose();
    this.props.reloadStructure();
  }

  render() {
    return (
      <>
        <Card
          hoverable
          cover={<img alt="example" style={{ height: 200, objectFit: 'cover' }} src={this.props.structure ? `https://images.evetech.net/types/${this.props.structure.typeId}/render?size=1024` : "https://i.imgur.com/PqIaIKg.jpg"} />}
        >
          <Meta title={this.props.structure ? this.props.structure.structureName : 'Please select a station'} data-cy="station-card-name" />
          <Row style={{ marginTop: '20px' }} gutter={[16, 16]}>
            <Col><Button disabled={!this.props.structure} type="primary" onClick={() => this.setState({drawerVisisble: true})} data-cy="create-new-watch"><PlusOutlined />New Watch</Button></Col>
            <Col><Button disabled={!this.props.structure} onClick={() => this.setState({importModalVisible: true})} data-cy="show-import-modal">Import Watches</Button></Col>
            <Col><Button disabled={!this.props.structure} onClick={() => this.setState({exportModalVisible: true})} data-cy="show-export-modal">Export Watches</Button></Col>
            <Col><Button disabled={!this.props.structure} danger onClick={() => this.setState({deleteModalVisible: true})} data-cy="show-delete-modal">Delete Watches</Button></Col>
          </Row>
        </Card>

        <Drawer
          title={`Create a new watch for ${this.props.structure?.structureName}`}
          width={720}
          onClose={this.onClose}
          visible={this.state.drawerVisisble}
          bodyStyle={{ paddingBottom: 80 }}
          data-cy="new-watch-drawer"
        >
          <NewWatchDrawerContent structure={this.props.structure} onSubmit={this.onNewWatch} isCorporationMaintainer={this.props.isCorporationMaintainer} isAllianceMaintainer={this.props.isAllianceMaintainer} />
        </Drawer>
        <ImportModal
          visible={this.state.importModalVisible} 
          // onOk={this.onClose} 
          percent={this.state.importProgress}
          onCancel={this.onClose}
          onImport={this.doImport.bind(this)}
          isCorporationMaintainer={this.props.isCorporationMaintainer} 
          isAllianceMaintainer={this.props.isAllianceMaintainer}
        >
        </ImportModal>
        <ExportModal 
          visible={this.state.exportModalVisible} 
          onOk={this.onClose} 
          onCancel={this.onClose}
          structures={this.props.structures}
          onExport={this.doExport.bind(this)}
        >
        </ExportModal>
        <DeleteModal
          visible={this.state.deleteModalVisible}
          onDelete={this.deleteAllWatches.bind(this)}
          onCancel={this.onClose}
          percent={this.state.deleteProgress}
          isCorporationMaintainer={this.props.isCorporationMaintainer} 
          isAllianceMaintainer={this.props.isAllianceMaintainer}
        >
        </DeleteModal>
      </>
    );
  }
}
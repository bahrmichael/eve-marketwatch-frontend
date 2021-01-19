import React from 'react';
import { Button, Select, Modal, Alert, Checkbox, Tabs } from 'antd';

const { Option } = Select;
const { TabPane } = Tabs;


export class ExportModal extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            selectedTab: 'link',
            buttonDescription: 'Generate Export Link',
            owners: ['Personal']
        }
    }

    onTabChanged(e) {
        let buttonDescription;
        switch (e) {
            case 'evepraisal':
                buttonDescription = 'Generate Evepraisal';
                break;
            case 'link':
                buttonDescription = 'Generate Export Link';
                break;
            case 'file':
                buttonDescription = 'Generate Export File';
                break;
            case 'excel':
                buttonDescription = 'Generate CSV File';
                break;
            default:
                throw new Error(`Unknown tab: ${e}`);
        }
        this.setState({
            selectedTab: e,
            buttonDescription,
        });
    }

    buttonDisabled() {
        if (this.state.selectedTab === 'excel') {
            return true;
        }
        const formFilled = this.state.structures?.length > 0 && this.state.owners?.length > 0;
        return !(this.state.selectedTab === 'evepraisal' || formFilled);
    }

    getStructures() {
        if (!this.props.structures || this.props.structures.length === 0) {
            return [];
        } else {
            return [...this.props.structures.personal, ...this.props.structures.corporation, ...this.props.structures.alliance];
        }
    }

    getDistinctStructures() {
        const structures = this.getStructures();
        const result = Array.from(new Set(structures.map(s => s.structureId)))
            .map(structureId => {
                return {
                    structureId,
                    structureName: structures.find(s => s.structureId === structureId).structureName
                };
            });
        return result;
    }

    form() {
        return (
            <>
                <p>Please select the stations you would like to export watches for:</p>
                <div data-cy={`export-modal-structures-select-${this.state.selectedTab}`}>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Please select a market"
                        onChange={(e) => this.setState({ structures: e })}
                        data-cy="export-modal-select-structures"
                    >
                        {this.getDistinctStructures().map((s) => <Option key={s.structureName} value={s.structureName}><span data-cy={`export-modal-structure-${s.structureId}`}>{s.structureName}</span></Option>)}
                    </Select>
                </div>
                <p>Please choose if you want to include personal, corporation and alliance watches:</p>
                <div style={{ marginBottom: '10px' }}>
                    <Checkbox.Group options={['Personal', 'Corporation', 'Alliance']} defaultValue={this.state.owners} onChange={(e) => this.setState({ owners: e })} data-cy="export-modal-owners" />
                </div>
            </>
        )
    }

    doExport() {
        let structureIds = null;
        if (this.state.selectedTab !== 'evepraisal') {
            const distinctStructures = this.getDistinctStructures();
            structureIds = this.state.structures.map((structureName) => distinctStructures.filter((s) => s.structureName === structureName)[0].structureId);
        }
        this.props.onExport({
            type: this.state.selectedTab,
            owners: this.state.owners,
            structures: structureIds,
        });
    }

    render() {
        return (
            <Modal
                title="Export Watches"
                visible={this.props.visible}
                onOk={this.props.onOk}
                onCancel={this.props.onCancel}
                footer={[
                    <Button key="cancel" data-cy="export-modal-close" onClick={this.props.onCancel}>
                        Close
                    </Button>,
                    <Button key="submit" type="primary" disabled={this.buttonDisabled()} loading={this.state.importInProgress} onClick={this.doExport.bind(this)} data-cy="export-modal-submit">
                        {this.state.buttonDescription}
                    </Button>
                ]}
            >
                <Tabs defaultActiveKey={this.state.selectedTab} onChange={this.onTabChanged.bind(this)}>
                    <TabPane tab="Link" key="link">
                        <p>Generate an export link to quickly exchange watches with your fellow capsuleers. The link will be copied to your clipboard.</p>
                        {this.form()}
                    </TabPane>
                    <TabPane tab="File" key="file">
                        <p>Generate a downloadable export file. The file will be downloaded to your computer.</p>
                        {this.form()}
                    </TabPane>
                    <TabPane tab="Evepraisal" key="evepraisal">
                        <p>Generate an evepraisal. The appraisal link will be copied to your clipboard.</p>
                        <Alert
                            message="Warning"
                            description="This is a legacy feature with limited capability and might lose support any time. Please use a different format if possible."
                            type="warning"
                            showIcon
                            closable
                            style={{marginBottom: '10px'}}
                        />
                        <p>With evepraisal, you can only export personal watches for a single station. Use the Marketwatch format to export watches for multiple stations at once.</p>
                        <p>Comparators will be replaced with "less than" and order type will be replaced with "Sell".</p>
                        <p>Warning: Evepraisal deletes entries after 15 days.</p>
                    </TabPane>
                    <TabPane tab="Excel" key="excel">
                        <p>Future Feature: Export the watches with the current data as a CSV file that you can import to Excel.</p>
                    </TabPane>
                </Tabs>
            </Modal>
        )
    }
}
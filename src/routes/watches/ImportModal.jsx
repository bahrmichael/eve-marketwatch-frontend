import React from 'react';
import { Form, Button, Input, Select, Progress, Modal, Upload, Radio, Checkbox, Tabs } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;

const { Dragger } = Upload;

export class ImportModal extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            selectedTab: 'file',
            buttonDescription: 'Import Marketwatch File',
            owner: 'Personal',
            isImportDisabled: true,
        }
    }

    onTabChanged(e) {
        let buttonDescription;
        switch (e) {
            case 'evepraisal':
                buttonDescription = 'Import Evepraisal';
                break;
            case 'file':
                buttonDescription = 'Import Marketwatch File';
                break;
            default:
                throw new Error(`Unknown tab: ${e}`);
        }
        if (this.state.selectedTab !== e) {
            if (e === 'evepraisal' && !this.state.evepraisalLink) {
                this.setState({isImportDisabled: true});
            } else if (e === 'file' && !this.state.file) {
                this.setState({isImportDisabled: true});
            } else {
                this.setState({isImportDisabled: false});
            }
        }
        this.setState({
            selectedTab: e,
            buttonDescription,
        });
    }

    buttonDisabled() {
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
                <div data-cy={`import-modal-structures-select-${this.state.selectedTab}`}>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Please select a market"
                        onChange={(e) => this.setState({ structures: e })}
                    >
                        {this.getDistinctStructures().map((s) => <Option value={s.structureName}><span data-cy={`import-modal-structure-${s.structureId}`}>{s.structureName}</span></Option>)}
                    </Select>
                </div>
                <p>Please choose if you want to include personal, corporation and alliance watches:</p>
                <div style={{ marginBottom: '10px' }}>
                    <Checkbox.Group options={['Personal', 'Corporation', 'Alliance']} defaultValue={this.state.owners} onChange={(e) => this.setState({ owners: e })} data-cy="import-modal-owners" />
                </div>
            </>
        )
    }

    doImport() {
        if (this.state.selectedTab === 'evepraisal') {
            this.props.onImport({
                type: this.state.selectedTab,
                evepraisalLink: this.state.evepraisalLink,
                owner: this.state.owner,
            })
        } else {
            this.props.onImport({
                type: this.state.selectedTab,
                file: this.state.file,
                owner: this.state.owner,
            })
        }
    }

    ownerSelect() {
        if (this.props.isCorporationMaintainer || this.props.isAllianceMaintainer) {
            let options = ['Personal'];
            if (this.props.isCorporationMaintainer) {
                options.push('Corporation');
            }
            if (this.props.isAllianceMaintainer) {
                options.push('Alliance');
            }
            return (
                <>
                <p>Please select for which owner you want to import the evepraisal.</p>
                <Radio.Group options={options} defaultValue={'Personal'} onChange={(e) => this.setState({ owner: e.target.value })} id="import-modal-owners" style={{marginBottom: '10px'}} />
                </>          
            )
        } else {
            return <></>;
        }
    }

    onEvepraisalInput(e) {
        const link = e.target.value;
        
        const isValid = link.startsWith('https://evepraisal.com/a/');
        this.setState({
            evepraisalInputInvalid: !isValid
        });
        if (isValid) {
            this.setState({evepraisalLink: link, isImportDisabled: false});
        }
    }

    beforeUpload(file) {
        this.setState({
          file,
          isImportDisabled: !file
        });
        return false;
    }

    progress() {
        if (!this.props.percent) {
            return <></>;
        }
        return (
            <Progress
                strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                }}
                percent={this.props.percent}
            />
        )
    }

    render() {
        return (
            <Modal
                title="Import Watches"
                visible={this.props.visible}
                onCancel={this.props.onCancel}
                footer={[
                    <Button key="cancel" data-cy="import-modal-close" onClick={this.props.onCancel}>
                        Close
                    </Button>,
                    <Button key="submit" type="primary" disabled={this.state.isImportDisabled} loading={this.props.percent} onClick={this.doImport.bind(this)} data-cy="import-modal-submit">
                        {this.state.buttonDescription}
                    </Button>
                ]}
            >
                <Tabs defaultActiveKey={this.state.selectedTab} onChange={this.onTabChanged.bind(this)}>
                    <TabPane tab="File" key="file">
                        <p>Import an EVE Marketwatch file.</p>
                        <div style={{marginBottom: '10px'}}>
                        <Dragger 
                            name="file" 
                            multiple={false}
                            beforeUpload={this.beforeUpload.bind(this)}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag a marketwatch file to this area to import</p>
                        </Dragger>
                        </div>
                        {this.progress()}
                    </TabPane>
                    <TabPane tab="Evepraisal" key="evepraisal">
                        <p>Import an evepraisal by pasting the link below.</p>
                        <Form>
                            <Form.Item validateStatus={this.state.evepraisalInputInvalid ? 'error' : 'success'} help='Evepraisal link must start with https://evepraisal.com/a/' rules={[{ required: true, message: 'Evepraisal link is required' }, { pattern: 'https://evepraisal.com/a/', message: 'Evepraisal link must start with https://evepraisal.com/a/'}]}>
                                <Input data-cy="import-evepraisal-input" placeholder="Please paste an evepraisal link" style={{ width: '100%', marginBottom: '10px' }} onChange={this.onEvepraisalInput.bind(this)} />
                            </Form.Item>
                        </Form>
                        {this.ownerSelect()}
                        <p>With evepraisal, you can only import watches for a single station. Use the Marketwatch format to import watches for multiple stations at once.</p>
                        <p>Comparators will be replaced with "less than" and order type will be replaced with "Sell".</p>
                        {this.progress()}
                    </TabPane>
                </Tabs>
            </Modal>
        )
    }
}
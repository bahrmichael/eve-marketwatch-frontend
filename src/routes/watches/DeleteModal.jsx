import React from 'react';
import { Progress, Modal, Button, Radio } from 'antd';


export class DeleteModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            owner: 'personal'
        }
    }

    progress() {
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

    getMaintainables() {
        const maintainables = ['Personal'];
        if (this.props.isCorporationMaintainer) {
            maintainables.push('Corporation');
        }
        if (this.props.isAllianceMaintainer) {
            maintainables.push('Alliance');
        }
        return maintainables;
    }

    maintainer() {
        return (<Radio.Group options={this.getMaintainables()} defaultValue={this.state.owner} onChange={(e) => this.setState({ owner: e.target.value.toLowerCase() })} data-cy="delete-modal-owners" />);
    }

    render() {
        return (
            <Modal
                title="Delete Watches"
                visible={this.props.visible}
                onCancel={this.props.onCancel}
                footer={[
                    <Button key="cancel" onClick={this.props.onCancel} disabled={this.props.percent} data-cy="delete-modal-close">
                        Abort
                    </Button>,
                    <Button key="submit" type="danger" onClick={() => this.props.onDelete(this.state.owner)} loading={this.props.percent && this.props.percent !== 100} data-cy="delete-modal-submit">
                        Confirm Delete
                    </Button>
                ]}
            >
                { this.getMaintainables().length > 1 ? this.maintainer() : <></>}
                { this.props.percent ? this.progress() : <p>This will delete the watches you see below. Are you sure?</p> }
            </Modal>
        )
    }
}
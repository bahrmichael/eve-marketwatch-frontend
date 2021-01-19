import React from 'react';

import { Tag, Space, Button, Row, Col, Form, Radio, InputNumber, Select } from 'antd';

const {Option} = Select;

  export class WatchEdit extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            deleting: false,
            submitting: false,
            canEdit: props.selectedItem.owners.includes('personal') || (props.selectedItem.owners.includes('corporation') && props.isCorporationMaintainer) || (props.selectedItem.owners.includes('alliance') && props.isAllianceMaintainer),
            isMaintainer: (props.selectedItem.owners.includes('corporation') && props.isCorporationMaintainer) || (props.selectedItem.owners.includes('alliance') && props.isAllianceMaintainer),
            previousOwners: props.selectedItem.owners
        }
    }

    onDeleteWatch() {
        this.setState({deleting: true});
        
        const that = this;
        setTimeout(function() {
            that.setState({deleting: false});
        }, 1000);

        this.props.onDeleteWatch(this.props.selectedItem);
    }

    onFinish(e) {
        this.setState({submitting: true});
        
        const that = this;
        setTimeout(function() {
            that.setState({submitting: false});
        }, 1000);

        this.props.onUpdateWatch({
          previousOwners: this.state.previousOwners,
            ...this.props.selectedItem,
            ...e,
        });
    }

    copyButton() {
      if (!this.state.canEdit) {
        const newItem = {
          ...this.props.selectedItem,
        };
        if (this.state.buy !== undefined) {
          newItem.buy = this.state.buy;
        } 
        if (this.state.threshold !== undefined) {
          newItem.threshold = this.state.threshold;
        }
        if (this.state.comparator !== undefined) {
          newItem.comparator = this.state.comparator;
        }
        return (
            <Row style={{marginTop:'50px'}}>
                {this.state.canEdit ? <></> : <p>As you are not a corporation or alliance maintainer, you can't edit this watch. But you can copy it to your private watches.</p>}
                <Button type="default" onClick={() => this.props.onCreatePrivateWatch(newItem)}>Copy as private watch</Button>
            </Row>
        );
      }
    }

  updateButton() {
    if (this.state.canEdit) {
      return (
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={this.state.submitting} data-cy="update-watch-button">
            Update
          </Button>
        </Form.Item>
        )
    }
  }

  deleteButton() {
    if (this.state.canEdit) {
      return (
        <Button type="danger" onClick={this.onDeleteWatch.bind(this)} loading={this.state.deleting} data-cy="delete-watch-button">
            Delete
        </Button>
        )
    }
  }

  getMaintainables() {
    const result = ['Personal'];
    if (this.props.isCorporationMaintainer) {
      result.push('Corporation');
    }
    if (this.props.isAllianceMaintainer) {
      result.push('Alliance');
    }
    return result;
  }

  ownerSelect() {
    if (this.state.isMaintainer) {
      return (
        <Form.Item name="owners" label="Owners" rules={[{ required: true, min: 1, type: 'array', message: 'Please select at least one owner' }]} initialValue={this.props.selectedItem?.owners}>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Please select owners"
          >
            {this.getMaintainables().map((owner) => <Option key={owner.toLowerCase()}>{owner}</Option>)}
          </Select>
        </Form.Item>
      )
    } else {
      return (
        <Form.Item label="Owners">
        {this.props.selectedItem?.owners?.map(owner => {
            let color;
            switch (owner) {
                case 'personal':
                    color = 'green';
                    break;
                case 'corporation':
                    color = 'geekblue';
                    break;
                case 'alliance':
                    color = 'purple';
                    break;
                default:
                    color = 'yellow';
            }
        
            return (
                <Tag color={color} key={owner}>
                    {owner.toUpperCase()}
                </Tag>
            );
        })}
        </Form.Item>
      )
    }
  }

  onFormFieldsChange = (changedFields) => {
    console.log(changedFields);
    const s = {};
    changedFields.forEach((field) => {
      s[field.name[0]] = field.value;
    });
    this.setState(s);
  }

    render() {
        return (
            <>
                <h1>
                    <Space size="middle">
                        <img src={`https://images.evetech.net/types/${this.props.selectedItem?.typeId}/icon?size=64`} alt="" />
                        <span>{this.props.selectedItem?.typeName}</span>
                    </Space>
                </h1>

        <Form name="theform" layout="vertical" onFinish={this.onFinish.bind(this)} hideRequiredMark onFieldsChange={(changedFields, allFields) => {
                this.onFormFieldsChange(changedFields);
              }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="threshold"
                  label="Threshold"
                  initialValue={this.props.selectedItem?.threshold}
                  rules={[{ required: true, message: 'Please enter a threshold' }]}
                >
                  <InputNumber min={0} placeholder="Please enter a threshold" style={{width: '100%'}} data-cy="edit-watch-threshold-input" />
                </Form.Item>
              </Col>
              <Col span={12}>
                {this.ownerSelect()}
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                  <Form.Item name="buy" label="Order Type" initialValue={this.props.selectedItem?.buy} required>
                    <Radio.Group>
                      <Radio.Button value={false} data-cy="order-type-option-sell">Sell</Radio.Button>
                      <Radio.Button value={true} data-cy="order-type-option-buy">Buy</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
              </Col>
              <Col span={12}>
                  <Form.Item name="comparator" label="Comparator" initialValue={this.props.selectedItem?.comparator} required>
                    <Radio.Group>
                      <Radio.Button value="lt" data-cy="comparator-option-lt">&lt;</Radio.Button>
                      <Radio.Button value="le" data-cy="comparator-option-le">&le;</Radio.Button>
                      <Radio.Button value="ge" data-cy="comparator-option-ge">&ge;</Radio.Button>
                      <Radio.Button value="gt" data-cy="comparator-option-gt">&gt;</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
              </Col>
            </Row>
            {this.updateButton()}
          </Form>
          {this.deleteButton()}
          {this.copyButton()}
            </>
        )
    }

  }
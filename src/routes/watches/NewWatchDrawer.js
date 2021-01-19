import React from 'react';

import {  Form, AutoComplete, Radio, InputNumber, Button, Col, Row, Select } from 'antd';

import * as api from '../../Client';

const { Option } = Select;


export class NewWatchDrawerContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchDropdown: [],
      searchLoading: false,
    }
  }

  // eslint-disable-next-line no-unused-expressions
  debounce(a,b,c){var d,e;return function(){function h(){d=null,c||(e=a.apply(f,g))}var f=this,g=arguments;return clearTimeout(d),d=setTimeout(h,b),c&&!d&&(e=a.apply(f,g)),e}};

  search = this.debounce(searchTerm => {
    if (searchTerm?.length >= 3) {
      
      this.setState({
        searchLoading: true
      });
      api.searchType(searchTerm)
          .then((data) => {
            if (data?.length) {
              return data;
            } else {
              return [{
                id: 26902,
                name: 'No results :('
              }];
            }
          })
          .then((searchDropdown) => this.setState({searchDropdown, searchLoading: false}));
    }
  }, 200);

  onFinish = (e) => {

    this.setState({submitting: true});
    const that = this;
    setTimeout(function() {
      that.setState({submitting: false});
    }, 1000);
    
    const results = this.state.searchDropdown.filter((type) => type.name === e.typeName);
    if (results?.length) {
      const typeId = results[0].id;
      this.props.onSubmit({
        typeId,
        ...e
      });
    } else {
      this.props.onSubmit(e);
    }
  }

  validateType = async (rule, value) => {
    if(value?.length > 3 ){
      const response = await fetch(`https://esi.evetech.net/latest/search/?categories=inventory_type&language=en-us&search=${value}&strict=true`);
      
      // if we don't get a 200 OK response, then we don't want to block the user when ESI doesn't work
      if (response.status === 200) {
        // not quite sure why we needed to another await here, but reponse.json returned a promise
        const data = await response.json();
        if (data?.inventory_type?.length >= 1) {
          // nothing to do
        } else {
          throw new Error("Invalid type name");
        }
      }
    }
  };

  maintainer = () => {
    const owners = ['Personal'];
    if (this.props.isCorporationMaintainer) {
      owners.push('Corporation');
    }
    if (this.props.isAllianceMaintainer) {
      owners.push('Alliance');
    }
    if (owners?.length === 1) {
      return <></>;
    }
    return (
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="owner" label="Owner" initialValue="personal">
            <Radio.Group>
              {
                owners.map(owner => {
                  return <Radio.Button value={owner.toLowerCase()} data-cy={`owner-option-${owner}`}>{owner}</Radio.Button>
                })
              }
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    );
  }

  render() {
    return (
          <Form name="theform" layout="vertical" onFinish={this.onFinish}>
            <Row>
              <Col>
                <Form.Item
                    label="Location"
                    data-cy="new-watch-structure-name"
                  >{this.props.structure?.structureName}</Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="typeName"
                  label="Type Name"
                  rules={[
                    { required: true, message: 'Please enter a type name' },
                    {
                      validator: this.validateType,
                    },
                  ]}
                  data-cy="type-name-form-item"
                  
                >
                  <AutoComplete
                        loading={this.state.searchLoading}
                        placeholder="Please enter a type name"
                        onSearch={this.search}
                        data-cy="type-name-search-input"
                    >
                        {this.state.searchDropdown.map((inventoryType) => (
                          <Option key={inventoryType.id} value={inventoryType.name} data-cy={`type-name-search-option-${inventoryType.id}`}>
                            <img src={`https://images.evetech.net/types/${inventoryType.id}/icon?size=32`} alt={inventoryType.name} /> {inventoryType.name}
                          </Option>
                        ))}
                    </AutoComplete>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="threshold"
                  label="Threshold"
                  rules={[{ required: true, message: 'Please enter a threshold' }]}
                  data-cy="threshold-form-item"
                >
                  <InputNumber min={0} placeholder="Please enter a threshold" style={{width: '100%'}} data-cy="threshold-input" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                  <Form.Item name="orderType" label="Order Type" initialValue="sell">

                    <Radio.Group>
                      <Radio.Button value="sell" data-cy="order-type-option-sell">Sell</Radio.Button>
                      <Radio.Button value="buy" data-cy="order-type-option-buy">Buy</Radio.Button>
                    </Radio.Group>

                  </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="comparator" label="Comparator" initialValue="lt">

                  <Radio.Group>
                    <Radio.Button value="lt" data-cy="comparator-option-lt">&lt;</Radio.Button>
                    <Radio.Button value="le" data-cy="comparator-option-le">&le;</Radio.Button>
                    <Radio.Button value="ge" data-cy="comparator-option-ge">&ge;</Radio.Button>
                    <Radio.Button value="gt" data-cy="comparator-option-gt">&gt;</Radio.Button>
                  </Radio.Group>

                </Form.Item>
              </Col>
            </Row>
            {this.maintainer()}
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={this.state.submitting} data-cy="new-watch-submit">
                  Submit
                </Button>
              </Form.Item>
          </Form>
    );
  }
}
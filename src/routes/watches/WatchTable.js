import React from 'react';

import { WatchDetails } from './WatchDetails';
import { WatchEdit } from './WatchEdit';

import { SearchOutlined } from '@ant-design/icons';

import { decodeToken } from '../../Authenticator'


import { Table, Tag, Space, Drawer, Button, Input, message, Tooltip } from 'antd';
import * as api from '../../Client';


export class WatchTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            searchText: '',
            searchedColumn: '',
            selectedItemHistory: null,
            daysRemaining: null,
            selectedItem: null,
            selectedItemJitaSell: null,
            selectedItemJitaBuy: null,
        }
        
    }

    showDrawer = (record, showDetails) => {
        if (showDetails) {
            api.getSnapshots(this.props.structure.structureId, record.typeId, record.buy, {count: 90})
                .then((data) => {
                    this.setState({
                        selectedItemHistory: data
                    })
                });
            api.getDaysRemaining(this.props.structure.structureId, record.typeId, record.buy)
                .then((data) => {
                    this.setState({
                        daysRemaining: data.days
                    })
                });
            api.getSnapshots(60003760, record.typeId, true)
                .then((data) => {
                    let newState;
                    if (data?.length > 0) {
                        newState = {jitaBuy: data[0].price};
                    } else {
                        newState = {jitaBuy: 0};
                    }
                    this.setState(newState);
                });
            api.getSnapshots(60003760, record.typeId, false)
                .then((data) => {
                    let newState;
                    if (data?.length > 0) {
                        newState = {jitaSell: data[0].price};
                    } else {
                        newState = {jitaSell: 0};
                    }
                    this.setState(newState);
                });
        }
        this.setState({
            visible: true,
            selectedItem: record,
            showDetails
        });
    };

    onClose = () => {
        this.setState({
            visible: false,
            selectedItem: null,
            selectedItemHistory: null,
            daysRemaining: null,
            jitaSell: null,
            jitaBuy: null,
        });
    };

    getOwnerId(watch) {
        let ownerId;
        if (watch.owners.includes('personal')) {
            ownerId = decodeToken().sub;
        } else if (watch.owners.includes('corporation')) {
            ownerId = decodeToken().corporation_id;
        } else if (watch.owners.includes('alliance')) {
            ownerId = decodeToken().alliance_id;
        }
        return ownerId;
    }

    getOwnerIdByName(ownerName) {
        let ownerId;
        if (ownerName === 'personal') {
            ownerId = decodeToken().sub;
        } else if (ownerName === 'corporation') {
            ownerId = decodeToken().corporation_id;
        } else if (ownerName === 'alliance') {
            ownerId = decodeToken().alliance_id;
        }
        return ownerId;
    }

    deleteWatch = async(watch) => {
        this.onClose();

        await api.deleteWatch({
            ...watch,
            ownerId: this.getOwnerId(watch)
        });
        message.success('Watch deleted')
        
        this.props.onWatchChange();
    }

    updateWatch = async(watch, structureId) => {
        this.onClose();

        // the user may have selected multiple owners. in that case we launch an update for each of those.
        // if the user has removed an owner, we also need to delete those ()

        const promises = [];

        // add for new owners
        for (const owner of watch.owners) {
            // make sure that e.g. a corporation maintainer doesn't try to delete alliance watches
            if ((owner === 'corporation' && !this.props.isCorporationMaintainer) || (owner === 'alliance' && !this.props.isAllianceMaintainer)) {
                continue;
            }
            const data = {
                structureId,
                ownerId: this.getOwnerIdByName(owner),
                ...watch
            };

            const promise = api.putWatch(data);
            promises.push(promise);
        }
        // delete for removed owners
        for (const previousOwner of watch.previousOwners) {
            if (watch.owners.includes(previousOwner)) {
                continue;
            }
            // make sure that e.g. a corporation maintainer doesn't delete alliance watches
            if ((previousOwner === 'corporation' && !this.props.isCorporationMaintainer) || (previousOwner === 'alliance' && !this.props.isAllianceMaintainer)) {
                continue;
            }
            const promise = api.deleteWatch({
                ...watch,
                ownerId: this.getOwnerIdByName(previousOwner),
            });
            promises.push(promise);
        }

        Promise.all(promises)
            .then(_ => {
                message.success('Watch updated');
                this.props.onWatchChange();
            });        
    }

    copyToPrivateWatches = async(watch) => {
        this.onClose();
        const data = {
            ...watch,
            structureId: watch.locationId,
            // when copying to private watches, it only makes sense to copy for a character personally
            ownerId: decodeToken().sub,
        };
        await api.putWatch(data);
        message.success('Watch copied')
        
        this.props.onWatchChange();
    }

    render() {
        return (
            <>
                <Table
                    columns={this.columns}
                    rowKey={d => `${d.typeId}-${d.buy}-${d.comparator}-${d.threshold}`}
                    dataSource={this.props.data || []}
                    pagination={this.props.pagination}
                    loading={this.props.loading}
                    onChange={this.props.handleTableChange}
                    style={{
                        width: '100%'
                    }}
                    data-cy="watches-table"
                />
                <Drawer
                    width={'50%'}
                    placement="right"
                    closable={true}
                    onClose={this.onClose}
                    visible={this.state.visible}
                    destroyOnClose={true}
                >
                    {
                        this.state.showDetails ?
                        <WatchDetails 
                            selectedItemHistory={this.state.selectedItemHistory}
                            selectedItem={this.state.selectedItem}
                            daysRemaining={this.state.daysRemaining}
                            jitaSell={this.state.jitaSell}
                            jitaBuy={this.state.jitaBuy}
                            />
                        :
                        <WatchEdit 
                            selectedItem={this.state.selectedItem}
                            onDeleteWatch={this.deleteWatch}
                            onUpdateWatch={(watch) => this.updateWatch(watch, this.props.structure.structureId)}
                            onCreatePrivateWatch={this.copyToPrivateWatches}
                            isCorporationMaintainer={this.props.isCorporationMaintainer} 
                            isAllianceMaintainer={this.props.isAllianceMaintainer}
                            />
                    }
                </Drawer>
            </>
        )
    }

    imageUrl = (typeId) => {
        return `https://images.evetech.net/types/${typeId}/icon?size=32`;
    }

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
          </Button>
                    <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
          </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
    });

    fitsThreshold = (record) => {
        switch (record.comparator) {
            case 'lt':
                return record.volume >= record.threshold;
            case 'le':
                return record.volume > record.threshold;
            case 'ge':
                return record.volume < record.threshold;
            case 'gt':
                return record.volume <= record.threshold;
            default:
                throw Error('Unknown comparator: ' + record.comparator);
        }
    }
    
    isOverpriced = (record) => {
        // todo: the comparison looks fishy, it might be wrong
        let acceptablePercentage = 1 + (8 / (Math.log(record.price) + 3));
        if (!record.buy) {
            return record.price > record.jitaPrice * acceptablePercentage;
        } else {
            return record.price < record.jitaPrice * (1 - acceptablePercentage);
        }
    }

    groupNumber = (num) => {
        if (isNaN(num)) {
            return num;
        } else {
            return new Intl.NumberFormat().format(num);
        }
    }

    columns = [
        {
            title: 'Name',
            dataIndex: 'typeName',
            key: 'typeName',
            render: (text, record) => (
                <Space size="middle">
                    <img src={this.imageUrl(record.typeId)} alt="" />
                    <span>{record.typeName}</span>
                </Space>
            ),
            ...this.getColumnSearchProps('typeName'),
        },
        {
            title: 'Order Type',
            dataIndex: 'buy',
            key: 'buy',
            render: buy => {
                return buy ? 'Buy' : 'Sell';
            },
            filters: [
                {
                    text: 'Sell',
                    value: false,
                },
                {
                    text: 'Buy',
                    value: true,
                },
            ],
        },
        {
            title: 'Comparator',
            dataIndex: 'comparator',
            key: 'comparator',
            filters: [
                {
                    text: '<',
                    value: 'lt',
                },
                {
                    text: '<=',
                    value: 'le',
                },
                {
                    text: '>=',
                    value: 'ge',
                },
                {
                    text: '>',
                    value: 'gt',
                },
            ],
            // onFilter: (value, record) => value === record.comparator,
            render: text => {
                switch (text) {
                    case 'lt': return '<';
                    case 'le': return '<=';
                    case 'ge': return '>=';
                    case 'gt': return '>';
                    default: return 'n/a';
                }
            }
        },
        {
            title: 'Volume',
            dataIndex: 'volume',
            key: 'volume',
            filters: [
                {
                    text: 'Show understocked',
                    value: 'showunderstocked',
                },
                {
                    text: 'Show overpriced',
                    value: 'showoverpriced',
                },
            ],
            filterMultiple: false,
            render: (text, record) => {
                let isWithinThreshold = this.fitsThreshold(record);
                let color = isWithinThreshold ? 'green' : 'red';
                let isOverpriced = this.isOverpriced(record);
                if (color === 'green' && isOverpriced) {
                    color = 'orange';
                }
                if (!isOverpriced) {
                    return (
                        <Tag color={color}>
                            {this.groupNumber(record.volume)}/{this.groupNumber(record.threshold)}
                        </Tag>
                    )
                } else {
                    return (
                        <Tooltip title="This item is overpriced">
                            <Tag color={color}>
                                {this.groupNumber(record.volume)}/{this.groupNumber(record.threshold)}
                            </Tag>
                        </Tooltip>
                    )
                }
            }
        },
        {
            title: 'Owners',
            key: 'owners',
            dataIndex: 'owners',
            filters: [
                {
                    text: 'Personal',
                    value: 'personal',
                },
                {
                    text: 'Corporation',
                    value: 'corporation',
                },
                {
                    text: 'Alliance',
                    value: 'alliance',
                },
            ],
            render: (text, record) => (
                <>
                    {record.owners.map(owner => {
                        let color;
                        let contributors = 0;
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
                                {owner.toUpperCase() + (contributors ? ` (${contributors})` : '')}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <>
                    <Button type="link" onClick={() => this.showDrawer(record, true)} data-cy="watch-details-link">Details</Button>
                    <Button type="link" onClick={() => this.showDrawer(record, false)} data-cy="watch-edit-link">Edit</Button>
                </>
            ),
        },
    ];
}


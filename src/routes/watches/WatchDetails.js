import React from 'react';

import { Space, Row, Col, Tooltip } from 'antd';

import {Chart} from './ItemVolumeChart';


  export class WatchDetails extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            volume: 0,
            daysRemaining: 0,
            localPrice: 0,
            jitaSell: 0,
            jitaBuy: 0,
        }

        let that = this;
        let intervalId = setInterval(function(){ 
            that.setState({
                volume: that.getDots(that.state.volume),
                daysRemaining: that.getDots(that.state.daysRemaining),
                localPrice: that.getDots(that.state.localPrice),
                jitaSell: that.getDots(that.state.jitaSell),
                jitaBuy: that.getDots(that.state.jitaBuy),
            })
        }, 200);
        this.setState({
            intervalId
        })
        setTimeout(function() {
            clearInterval(intervalId);
            let newState = {};
            if (!that.props.selectedItemHistory || that.props.selectedItemHistory.length === 0) {
                newState.volume = 0;
                newState.localPrice = 0;
            }
            if (!that.props.daysRemaining) {
                newState.daysRemaining = 0;
            }
            if (!that.props.jitaSell) {
                newState.jitaSell = 0;
            }
            if (!that.props.jitaBuy) {
                newState.jitaBuy = 0;
            }
            console.log(newState);
            
            that.setState(newState);
        }, 3000);
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalId);
    }

    getDots(dots) {
        dots += ".";
        if (dots.length > 5) {
            dots = "."
        }
        return dots;
    }

    toGrouped = (num) => {
        if (!num) {
            return 0;
        }
        if (isNaN(num)) {
            return num;
        }
        return new Intl.NumberFormat().format(num);  // 12,345.67
    }

    getVolume() {
        if (this.props.selectedItemHistory && this.props.selectedItemHistory[0]?.volume >= 0) {
            return this.props.selectedItemHistory[0].volume;
        } else if (this.props.selectedItemHistory && this.props.selectedItemHistory.length === 0) {
            return 0;
        } else {
            return this.state.volume;
        }
    }

    getLocalPrice() {
        if (this.props.selectedItemHistory && this.props.selectedItemHistory[0]?.price >= 0) {
            return this.props.selectedItemHistory[0].price;
        } else if (this.props.selectedItemHistory && this.props.selectedItemHistory.length === 0) {
            return 0;
        } else {
            return this.state.localPrice;
        }
    }

    getDateOfLastEntry() {
        if (this.props.selectedItemHistory && this.props.selectedItemHistory[0]) {
            return this.props.selectedItemHistory[0].date;
        } else if (this.props.selectedItemHistory?.length === 0) {
            return 'Unknown';
        } else {
            return 'Loading ...';
        }
    }

    getDaysRemaining() {
        if (this.props.daysRemaining != null && this.props.daysRemaining >= 0) {
            return this.props.daysRemaining;
        } else {
            return this.state.daysRemaining;
        }
    }

    getMargin() {
        const localPrice = this.getLocalPrice();
        if (this.props.selectedItem && localPrice) {
            const isBuy = this.props.buy;
            if (isBuy) {
                const jita = this.getJitaBuy();
                if (!jita) {
                    return 0;
                } else {
                    return Math.round((1 - (localPrice / jita)) * 100);
                }
            } else {
                const jita = this.getJitaSell();
                if (!jita) {
                    return 0;
                } else {
                    return Math.round((1 - (jita / localPrice)) * 100);
                }
            }
        } else {
            return 0;
        }
    }

    getJitaSell() {
        if (this.props.jitaSell != null && this.props.jitaSell >= 0) {
            return this.props.jitaSell;
        } else {
            return this.state.jitaSell;
        }
    }

    getJitaBuy() {
        if (this.props.jitaBuy != null && this.props.jitaBuy >= 0) {
            return this.props.jitaBuy;
        } else {
            return this.state.jitaBuy;
        }
    }

    chart() {
        return <Chart selectedItemHistory={this.props.selectedItemHistory} />
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
                <Row>
                    <Col lg={8}>
                            <p>
                                {this.toGrouped(this.getVolume())}
                                <br/>
                                <small>Volume</small>
                            </p>
                            <p>
                                {this.toGrouped(this.getDaysRemaining())}
                                <br/>
                                <small>Days remaining</small>
                            </p>
                    </Col>
                    <Col lg={8}>
                            <p>
                                {this.toGrouped(this.getLocalPrice())} {isNaN(this.getLocalPrice()) ? '' : 'ISK'}<br/>
                                <small>Local {this.props?.selectedItem?.buy ? 'Buy' : 'Sell'} Price</small>
                            </p>
                            <p>
                                {this.toGrouped(this.getMargin())}%<br/>
                                <small>Margin {this.props?.selectedItem?.buy ? 'vs Jita Buy' : 'vs Jita Sell'}</small>
                            </p>
                    </Col>
                    <Col lg={8}>
                            <p>
                            {this.toGrouped(this.getJitaSell())} ISK<br/>
                                <small>Jita Sell</small>
                            </p>
                            <p>
                            {this.toGrouped(this.getJitaBuy())} ISK<br/>
                                <small>Jita Buy</small>
                            </p>
                    </Col>
                </Row>
                <Row style={{marginTop:'50px'}}>
                    { this.chart() }
                </Row>

                <Row>
                    <Tooltip title="New data is only collected when volume or price changes.">
                        <span>Data from: {this.getDateOfLastEntry()}</span>
                    </Tooltip>
                </Row>
            </>
        )
    }

  }
import React from 'react';

import {LOGIN_URL} from '../../Constants';

import { Col, Row, Button, Modal } from 'antd';

import BannerImage from './BannerImage';

import {isAuthenticated} from '../../Authenticator';


export default class LandingPage extends React.Component {

    state = {
        loginUrl: '&state=login',
        authenticated: isAuthenticated(),
        previewOpen: false
    }


    closeModal = e => {
        this.setState({
            previewOpen: false,
        });
      };
    
    render() {
        return (
            <>
                <Row style={{margin:'50px'}} gutter={64}>
                    <Col lg={12}>
                        <BannerImage />
                    </Col>
                    <Col lg={12}>
                        <h1>EVE Market Watch</h1>
                        <p>EVE Market Watch is the best tool for players of EVE Online to keep their markets supplied.</p>
                        <p>You define stock thresholds for items and markets. If an item's stock reaches the threshold, you get an ingame notification.</p>

                        <ul>
                            <li>Monitor Markets</li>
                            <li>Discover Market Opportunities</li>
                            <li>Prevent Market Holes</li>
                            <li>Enable Traders in your Corporation and Alliance</li>
                        </ul>
                        
                        <Row gutter={16}>
                            <Col>
                                <Button type="primary" href={this.state.authenticated ? '/watches' : `${LOGIN_URL}`} data-cy="login-button">
                                    Log in <span style={{display: this.state.authenticated ? 'none': 'inline'}}> with EVE Online</span>
                                </Button>
                            </Col>
                            <Col>
                                <Button onClick={() => this.setState({previewOpen: true})}>
                                    Preview
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Modal
                    title="Preview"
                    visible={this.state.previewOpen}
                    onOk={this.closeModal}
                    onCancel={this.closeModal}
                    width='50%'
                    footer={[
                        <Button key="back" type="primary" onClick={this.closeModal}>
                          Ok
                        </Button>
                      ]}
                    >
                        {this.state.previewOpen ? <iframe style={{width: '100%', height: '500px'}} src="https://www.youtube.com/embed/Rdy7u3vdWrY" title="EVE Marketwatch Intro Video" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> : <></>}
                        
                </Modal>
            </>
        )
    }
}
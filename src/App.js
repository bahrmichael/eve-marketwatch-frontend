
import React from 'react';

import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';

import { Watches } from './routes/watches/Watches';
import Settings from './routes/settings/Settings';
import Callback from './routes/callback/Callback';
import LandingPage from './routes/landing/LandingPage';
import Development from './routes/development/Development';
import Documentation from './routes/documentation/Documentation';

import qs from 'query-string';

import {isAuthenticated, decodeToken} from './Authenticator';

import { Menu, Layout } from 'antd';

import {
    DesktopOutlined,
    SettingOutlined, BookOutlined,
    LogoutOutlined, MessageOutlined, ExperimentOutlined
} from '@ant-design/icons';
import ImportPage from './routes/import/Import';

const { Header, Content, Footer, Sider } = Layout;

function PrivateRoute({ children, ...rest }) {
    return (
        <Route
            {...rest}
            render={({ location }) =>
                isAuthenticated() ? (
                    children
                ) : (
                        <Redirect
                            to={{
                                pathname: "/",
                                state: { from: location }
                            }}
                        />
                    )
            }
        />
    );
}

export class App extends React.Component {

    state = {
        collapsed: true,
        content: 'watches',
    };

    onCollapse = collapsed => {
        this.setState({ collapsed });
    };

    logout() {
        localStorage.removeItem('token');
        window.location.path = '/';
    }

    sider() {
        return (
            <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
                <div className="logo" />
                <Menu theme="dark" selectedKeys={[this.state.content]} mode="inline">
                    <Menu.Item key="watches" icon={<DesktopOutlined />}>
                        <Link to={'/watches'} onClick={() => this.setState({content: 'watches'})}>Watches</Link>
                    </Menu.Item>
                    <Menu.Item key="settings" icon={<SettingOutlined />}>
                        <Link to={'/settings'} onClick={() => this.setState({content: 'settings'})}>Settings</Link>
                    </Menu.Item>
                    <Menu.Item key="documentation" icon={<BookOutlined />}>
                        <Link to={'/documentation'} onClick={() => this.setState({content: 'documentation'})}>Documentation</Link>
                    </Menu.Item>
                    <Menu.Item key="development" icon={<ExperimentOutlined />}>
                        <Link to={'/development'} onClick={() => this.setState({content: 'development'})}>Development</Link>
                    </Menu.Item>
                    <Menu.Item key="chat" icon={<MessageOutlined />}>
                        <a href={'https://discord.gg/bTCdjBF'} target="_blank" rel="noopener noreferrer">Discord</a>
                    </Menu.Item>
                    <Menu.Item key="logout" icon={<LogoutOutlined />}>
                        <Link to={'/'} onClick={this.logout}>Logout</Link>
                    </Menu.Item>
                </Menu>
            </Sider>
        )
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/callback" >
                        <Callback code={qs.parse(window.location.search).code} state={qs.parse(window.location.search).state} />
                    </Route>
                    <Route exact path="/">
                        <LandingPage />
                    </Route>
                    <PrivateRoute>
                        <Layout style={{ minHeight: '100vh' }}>
                            {this.sider()}
                            <Layout className="site-layout">
                                <Header className="site-layout-background" style={{ padding: 0 }}>
                                    <div style={{float: "right", marginRight: '30px'}}>
                                        <span style={{fontWeight: 'bolder', marginRight: '30px'}}>{decodeToken().name}</span>
                                    </div>
                                </Header>
                                <Content style={{ margin: '0 16px' }}>
                                    <div className="site-layout-background" style={{ margin: '16px 0', padding: 24, minHeight: 360 }}>
                                        <Route path="/settings"><Settings /></Route>
                                        <Route path="/watches"><Watches /></Route>
                                        <Route path="/documentation"><Documentation /></Route>
                                        <Route path="/development"><Development /></Route>
                                        <Route path="/import"><ImportPage id={qs.parse(window.location.search).id} /></Route>
                                    </div>
                                </Content>
                                <Footer style={{ textAlign: 'center' }}>EVE Market Watch © 2020 Rihan Shazih</Footer>
                            </Layout>
                        </Layout>
                    </PrivateRoute>
                </Switch>
            </Router>

        );
    }
}
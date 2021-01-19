import React from 'react';

import * as api from '../../Client';

import { Redirect } from 'react-router-dom';

export default class Callback extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            code: props.code,
            st: props.state || 'watches',
            loggedIn: false
        }
    }
    
    componentDidMount() {
        api.login(this.state.code)
          .then(j => {
            localStorage.setItem('token', j.token);
            this.setState({
                loggedIn: true,
                code: null
            })
          });
    }


    render() {
        if (this.state.loggedIn) {
            return (
                <Redirect
                    to={{
                        pathname: `/${this.state.st}`,
                        state: { from: '/callback' }
                    }}
                />
            )
        } else {
            return (
                <>
                    <p>Logging in ...</p>
                </>
            )

        }
    }
}
import React from 'react';

import * as api from '../../Client';

import { Redirect } from 'react-router-dom';

export default class ImportPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
        }
    }
    
    componentDidMount() {
        if (!this.state.id) {
            this.setState({isInvalid: true});
        } else {
            api.putImport(this.state.id)
            .then(response => {
                this.setState({isDone: true})
            });
        }
    }

    render() {
        if (this.state.isInvalid) {
            return <p>You must use a valid import link, which has an id parameter.</p>
        } else if (this.state.isDone) {
            return (
                <Redirect
                    to={{
                        pathname: `/watches`,
                        state: { from: '/import' }
                    }}
                />
            )
        } else {
            return (
                <>
                    <p data-cy="import-notice">Importing watches ... This might take a while ...</p>
                </>
            )

        }
    }
}
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '@/css/comNavigation.css';

export default class comNavigation extends Component {
    render() {
        return (
            <div className="header clearfix">
                <h1>{this.props.headerName}</h1>
                {
                    this.props.back === 'true' 
                    ?
                    <a href="javascript:history.back();" className="header-back"></a>
                    :
                    <Link  to='/' className="header-back"></Link>
                }
            </div>
        )
    }
}


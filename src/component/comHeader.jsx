import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '@/css/comHeader.css';

export default class ComHeader extends Component {
    render() {
        if ( this.props.showHeader ) {
            return (
                <div className="com-header">
                    <Link to="search" className="search-logo"></Link>
                    <Link to="shopCar" className="shopping-logo"><span>{this.props.carCount}</span></Link>
                    <h1><img src="../m-images/logo.png" alt="" /></h1>
                </div>
            );
        }
        return '';
    }
}


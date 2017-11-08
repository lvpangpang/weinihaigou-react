import React, { Component } from 'react';
import '@/css/comLoading.css';

export default class comLoading extends Component {

    render() {
        if ( this.props.isLoading ) {
            return (
               <div className="com-loading">
                <img src="../m-images/loading.gif" alt="" />
            </div>
            );
        }
        return null;
    }
}


import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import store from '@/store/index';
import {
    changeIsLogin
} from '@/store/action';

export default class IsLogin extends Component {

    constructor(props, context) {
        super();
    }

    componentWillMount() {
        // 先获取用户登录状态
        window.axios.post(window.API.checkUser).then( ( data ) => {
            alert(data.data.flag);
            var flag = data.data.flag;
            store.dispatch( changeIsLogin(flag) );
            if ( !flag ) {
                this.props.history.push('login');
            }
        });
    }

    render() {
        return '';
    }
}


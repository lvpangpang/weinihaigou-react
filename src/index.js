import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import commonMethods from  '@/js/common';
import store from '@/store/index';
import App from '@/App.jsx';
import API from '@/js/api';
import axios from 'axios';
import {
    changeIsLogin,
    setCarCount
} from '@/store/action';

window.API = API;
window.axios = axios;
window.commonMethods = commonMethods;

// 获取用户购物车数量
window.axios.post(window.API.carCount).then( ( data ) => {
    store.dispatch(setCarCount(data.data.count));
});

// 先获取用户登录状态
window.axios.post(window.API.checkUser).then( ( data ) => {
    store.dispatch( changeIsLogin(data.data.flag) );
    ReactDOM.render(<App />, document.getElementById('root'));
    registerServiceWorker();
});


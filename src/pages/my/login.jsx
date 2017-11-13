import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from '@/store/index';
import commonMethods from '@/js/common';
import ComNavigation from '@/component/comNavigation';
import Toast from '@/component/toast';
import hex_md5 from '@/js/md5';
import '@/css/login.css';

import {
    changeIsLogin,
    setCarCount
} from '@/store/action';

export default class Login extends Component {
    constructor(props, context) {
        super();
        this.state = {
            isShow : '',
            msg : '',
            mobile : {value:'', success:false, errorInfo: '手机号为空或者格式不正确'},
            password: {value:'', success:false, errorInfo: '密码为空或者格式不正确（长度在6-20位之间）'},
        };

        this.checkMobile = () => {
            if( commonMethods.testPhone(this.state.mobile.value) ) {
                this.setState({
                    mobile: {
                        success : true
                    }
                });
            } else {
                this.setState({
                    mobile : {
                        success : false
                    },
                    isShow : true,
                    msg : '手机号为空或者格式不正确'
                });
            }
        };

        this.checkPassword = () => {
            if( commonMethods.testPwd(this.state.password.value) ) {
                this.setState({
                     password : {
                        success : true
                    }
                });
            } else {
               this.setState({
                    password : {
                        success : false
                    },
                    isShow : true,
                    msg : '密码为空或者格式不正确（长度在6-20位之间）'
                });
            }
        };

        this.login = () => {
            console.log(this.state.mobile.value);
            console.log(this.state.password.value);
            if ( this.state.mobile.value==="" || this.state.password.value==="" ) {
                return;
            }
            // this.checkMobile();
            // if ( this.state.mobile.success ) {
                this.checkPassword();
                // if ( this.state.password.success ) {
                     window.axios.post(window.API.login, window.commonMethods.param({
                        mobile : this.state.mobile.value,
                        password : hex_md5(this.state.password.value)
                    })).then( ( data ) => {
                        var msg = data.data.msg;
                        if( msg==='00000000' ) {
                            this.props.history.go(-1);
                            store.dispatch( changeIsLogin(true) );
                            window.axios.post(window.API.carCount).then( ( data ) => {
                                store.dispatch( setCarCount(data.data.count) );
                            });
                        } else if( msg==='00000001' ) {
                            this.setState({
                                isShow : true,
                                msg : '用户名或者密码错误'
                            });
                        } else if( msg==='00000007' ) {
                            this.setState({
                                isShow : true,
                                msg : '手机号错误'
                            });
                        }
                    });
                // }
            // }
        };

        this.handle1 = (event) => {
            this.setState({
                 mobile : {
                     value : event.target.value
                 }
            });
        };

        this.handle2 = (event) => {
            this.setState({
                 password : {
                     value : event.target.value
                 }
            });
        };

        // 该事件将被子组件触发
        this.noShow = (obj) => {
            this.setState({
                 isShow : false
            });
        };

    }

    componentWillMount() {
        if ( store.getState().reducer.isLogin ) {
             this.props.history.push('/');
        }
    }

    render() {
        return (
            <div>
                <Toast
                    isShow={this.state.isShow}
                    msg={this.state.msg}
                    noShow={this.noShow}
                />
                <ComNavigation
                    headerName="登录"
                    back='false'
                />
                <div className="login-header">
                    <img src="../m-images/login-bg.jpg" alt="" />
                </div>
                <div className="login-main">
                    <div className="phone-pwd">
                        <div className="phone">
                            <input type="text" placeholder="请输入账号"  value={this.state.mobile.value} onChange={this.handle1} />
                        </div>
                        <div className="pwd">
                            <input type="password" placeholder="请输入密码" value={this.state.password.value} onChange={this.handle2} />
                        </div>
                    </div>
                    <a onClick={this.login} className={ (this.state.mobile.value==='' || this.state.password.value==='') ? 'com-next unable' : 'com-next'}>登录</a>
                    <p className="register-back">
                        <Link to="register" className="com-color">注册账号</Link>
                    </p>
                </div>
            </div>
        )
    }
}



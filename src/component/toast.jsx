import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '@/css/toast.css';

export default class toast extends Component {

    constructor(props) {
        super();
        this.state = {
            isShow : props.isShow,
            msg : props.msg
        };
    }

    // 这个钩子可以获取props的变化
    componentWillReceiveProps(nextProps) {
        if ( nextProps.isShow ) {
            this.setState({
                isShow: nextProps.isShow,
                msg : nextProps.msg
            }, () => {
                let timer = null;
                if ( this.state.isShow===true ) {
                    clearTimeout(timer);
                    timer = setTimeout( () => {
                        // 触发父组件的noShow方法，改变父组件的isShow
                        this.props.noShow();
                        this.setState({
                            isShow : false,
                        });
                    }, 2000);
                }
            });
        }
    }

    render() {
        if ( this.state.isShow ) {
            return (
                <div className="pop-box">
                    <div className="pop-msg">{this.state.msg}</div>
                </div>
            );
        }
        return '';
    }
}


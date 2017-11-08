import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import '@/css/numControl.css';

export default class NumControl extends Component {
    constructor(props, context) {
        super();
        this.state = {
            val : props.number
        };

        this.add = () => {
            if ( this.state.val >= this.props.count ) {
                return;
            }
            this.setState({
                val : this.state.val + 1
            }, () => {
                this.props.changeVal({
                    val : this.state.val,
                    changeVal : 1,
                    indexArr : this.props.indexArr
                });
            });
        };

        this.reduce = () => {
            if ( this.state.val <= 1 || this.props.count === 0 ) {
                return;
            }
            this.setState({
                val : this.state.val - 1
            }, () => {
                this.props.changeVal({
                    val : this.state.val,
                    changeVal : -1,
                    indexArr : this.props.indexArr                    
                });
            });
        };
    }

     // 这个钩子可以获取props的变化
    componentWillReceiveProps(nextProps) {
        let count = nextProps.count;
        if ( this.state.val > count ) {
            this.setState({
                val : nextProps.count
            });
        }
    }

    render() {
        return(
            <div className="quantity-selector clearfix">
                <span onClick={this.reduce} className={ (this.state.val===1||this.props.count===0) ? 'reduce disable' : 'reduce' }>－</span>
                <input type="text" className="number" value={this.state.val} readOnly="true" />
                <span onClick={this.add} className={(this.state.val===this.props.count||this.props.count===0) ? 'add disable' : 'add'}>＋</span>
            </div>
        )
    }
}


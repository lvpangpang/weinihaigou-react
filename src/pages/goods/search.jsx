import React, { Component } from 'react';
import '@/css/search.css';

export default class Search extends Component {
    constructor(props, context) {
        super();
        this.state = {
            searchKey : '',//搜索词
            responseList : [],//按键感应内容
            hotSearch : [],//热搜词
            history : [],//历史记录
            lastGo : true,
            linkContent : ''//默认搜索
        };

        // 判断是不是无痕模式
        this.storageTest = (storage) => {
            if(!!storage) {
                try {
                    storage.setItem("key", "value");
                    storage.removeItem("key");
                    return true;
                } catch(e) {
                    return false;
                }
            } else {
                return false;
            }
        };

        // 默认搜索
        this.getTextSearch = () => {
            this.responseList = [];
            window.axios.post(window.API.getTextSearch)
            .then( (data) => {
                var data1 = data.data;
                if( data1.message ) {
                    if( data1.list.length>0 ) {
                        this.setState({
                            linkContent : data1.list[0]['linkContent']
                        });
                    }
                }
            });
        };

        // 按键精灵
        this.getResponseData = () => {
            if( this.lastGo ) {
                this.lastGo = false;
                window.axios.post(window.API.hotSearch, window.commonMethods.param({
                    keyword : this.searchKey
                }))
                .then( (data) => {
                    if( data.message ) {
                        this.setState({
                            responseList : data.data
                        });
                    } else {
                        this.setState({
                            responseList : []
                        });
                    }
                });
            }
        };

        // 清除搜索关键词
        this.clearSearch = () => {
            this.setState({
                searchKey : '',
                responseList : []
            });
        };

        // 获取热门搜索数据
        this.getHotList = () => {
            window.axios.post(window.API.getHotSearch)
            .then( (data) => {
                if( data.data.message ) {
                    this.setState({
                        hotSearch : data.data.hotList
                    });
                }
            });
        };

        // 跳转到搜索结果
        this.go = (event) => {
            if ( event ) {
                this.setState({
                    searchKey : event.target.innerText
                });
            }
            if( this.state.searchKey.trim()==='' ) {
                this.props.history.push({
                     pathname: 'goodsResult', 
                     query: { 
                         keyword : this.state.linkContent 
                    }
                });
                return;
            }
            if ( this.storageTest(window.localStorage) ) {
                this.setHistory(this.state.searchKey);
            }
            this.props.history.push({
                pathname : '/goodsResult',
                search : `?keyword=${this.state.searchKey}`
            });
            this.setState({
                searchKey : '',
                responseList : []
            });
        };

        this.go1 = () => {
            if( this.state.searchKey==='' ) {
                this.setState({
                    searchKey : this.state.linkContent
                });
            }     
            this.props.history.push({
                pathname : '/goodsResult',
                search : `?keyword=${this.state.searchKey}`
            });               
        };

        this.searchKeyChange = (e) => {

             this.setState({
                 searchKey : e.target.value
            });
        };

        this.hotClick = (event) => {
            this.setState({
                searchKey : event.target.innerText
            }, ()=> {
                this.go();
            });
        };

        // 设置历史记录
        this.setHistory = (strKey) => {
            var nowtime = (new Date()).getTime(),
            storage = window.localStorage,
            obj = JSON.parse(storage.getItem('nisu'));//字符串转对象
            obj[strKey] = nowtime;
            storage.setItem('nisu', JSON.stringify(obj));//对象转字符串
        };

        // 获取历史记录
        this.getHistory = () => {
            var storage = window.localStorage,
                length = 10,
                arr = [],
                arr1 = [],
                obj = {},
                newObj = {};
            this.history = [];
            obj = JSON.parse(storage.getItem('nisu'));//字符串转对象
            for(var x in obj) {
                arr.push(obj[x]);
            }
            arr.sort(function(a, b) {
                return b-a;
            });
            arr.length>=10 ? length = 10 : length = arr.length;
            for(var i=0; i<length; i++) {
                for(var y in obj) {
                    if( obj[y]===arr[i] ) {
                        arr1.push({q : y});
                        newObj[y] = arr[i];
                    }
                }
            }
            this.setState({
                history : arr1
            });
            storage.setItem('nisu', JSON.stringify(newObj));//对象转字符串
        };

        // 清除历史记录
        this.removeHistory = () => {
            if( this.storageTest(window.localStorage) ) {
                this.setState({
                    history : []
                });
                window.localStorage.removeItem('nisu');
                var storage = window.localStorage,
                    obj = {};
                storage.setItem('nisu', JSON.stringify(obj));//对象转字符串
            }
        };

        this.throttle = (method, context) => {
            clearTimeout(method.tId);
                method.tId = setTimeout(function(){
                    method.call(context);
            }, 100);
        };
    }

    componentWillMount() {
        
        // 非无痕模式取本地存储
        if( this.storageTest(window.localStorage) ) {
            // 获取历史记录数据
            let storage = window.localStorage,
               obj = {};
            if( storage.getItem('nisu') === '{}' ) {
                storage.setItem('nisu', JSON.stringify(obj));//对象转字符串
            }
            this.getHistory();
        }
        // 获取默认搜索
        this.getTextSearch();
        // 获取热门搜索数据
        this.getHotList();

    }

    render() {
        return (
            <div>
                <div className="search-wrap">
                    <div className="search-main">
                        <a href="javascript:history.back()" className="header-back"></a>
                        <div className="search-box">
                            <input type="text"  placeholder={this.state.linkContent} value={this.state.searchKey} onChange={this.searchKeyChange}  className="search" />
                            {
                               this.state.searchKey !== '' && <a className="empty-search" onClick={this.clearSearch}></a>       
                            }
                        </div>
                        <a className="search-btn" onClick={this.go}></a>
                        <ul className="response-box" v-if="responseList.length">
                            <li v-for="data in responseList" track-by="window.$index"><a  v-html="data" onClick={this.go}></a></li>
                        </ul>
                    </div>
                </div>
                <div className="hot-search">
                    <p>热门搜索</p>
                    <ul className="hot-items clearfix">
                        {
                            this.state.hotSearch.map(( data, index, arr) => {
                                return (
                                    <li key={index}>
                                        <a onClick={this.hotClick}>{data.linkContent}</a>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>

                <div className="history">
                    <div className="history-header">历史记录
                        <a className="empty-history" onClick={this.removeHistory}>清空记录</a>
                    </div>
                    <ul className="history-items">
                        {
                            this.state.history.map(( data, index, arr) => {
                                return (
                                    <li key={index}>
                                        <a onClick={this.hotClick}>{data.q}</a>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        )
    }
}



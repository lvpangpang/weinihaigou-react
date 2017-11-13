import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ComLoading from '@/component/comLoading';
import GoodsItem from  '@/component/goodsItem';
import ComNavigation  from '@/component/comNavigation';
import lazyImg from '@/js/imgLazy';
import '@/css/goodsResult.css';

export default class GoodsResult extends Component {
    constructor(props, context) {
        super();
        this.state = {
            queryParams : {
                pageNum : 1,//第几页
                sort : '',//排序类型
                order : '',//1：升；0：降
                name : window.commonMethods.getUrlPram('keyword') || '',
                threeCategoryId : window.commonMethods.getUrlPram('threeCategoryId') || '',
                brandId :  window.commonMethods.getUrlPram('brandId')|| ''
            },
            goodsList : [],
            pageTotal : 0,
            isLoading : true,
            isNoNum : false,
        };

        // 上拉加载
        this.scrollGetData = () => {
            // 下面都是谷歌浏览器才识别的
            // 页面滚动条距离顶部的高度
            // console.log(document.documentElement.scrollTop);
            // 页面的总高度
            // console.log(document.documentElement.scrollHeight);
            //屏幕的高度
            // console.log(document.documentElement.clientHeight);
            if( document.documentElement.scrollTop === document.documentElement.scrollHeight - document.documentElement.clientHeight ) {
                if (  this.state.pageTotal>0 && this.state.queryParams.pageNum<this.state.pageTotal+1 && this.state.runing ) {
                    this.getGoodsList();
                }
            }
        };

        // 获取商品列表数据
        this.getGoodsList = () => {
            if( this.state.queryParams.pageNum===1 ) {
                this.setState({
                    goodsList : []
                });
                document.documentElement.scrollTop = 0;
            }

            this.setState({
                isLoading : true,
                end : false,
                runing : false,
                isNoNum : false
            });

            window.axios.post( window.API.searchGoods, window.commonMethods.param(this.state.queryParams) )
            .then( (data) => {
                var dat = data.data;
                if( dat.message ) {
                    //第一次加载
                    if( this.state.queryParams.pageNum===1 ) {
                        this.setState({
                            goodsList : dat.list,
                            pageTotal : dat.pages
                        });
                        // 没有数据
                        if( this.state.goodsList.length===0 ) {
                            this.setState({
                                isLoading : false,
                                isNoNum : false
                            });
                        }
                    } else {
                        var data1 = this.state.goodsList.concat(dat.list);
                        this.setState({
                            goodsList : data1
                        });
                    }
                    this.setState({
                        nowTime : dat.nowTime,
                        runing : true,
                    });
                    new lazyImg();

                    // 只改变state里面对象的某个属性
                    this.setState(Object.assign({}, this.state.queryParams.pageNum, { pageNum : this.state.queryParams.pageNum++ }));

                    // // 数据加载完毕
                    if( this.state.queryParams.pageNum===this.state.pageTotal+1 ) {
                        this.setState({
                            end: true,
                            isLoading : false,
                        });
                    }
                }
            });
        };

        // 按销量排序（只支持降序）
        this.setXl = () => {
            if ( this.state.queryParams.sort!=='xl' ) {
                this.set({
                   sort : 'xl',
                   order : 0
               });
            } else {
                return;
            }
        };

        // 按售价排序
        this.setSj = () => {
             this.setType('sj');
        };

        // 按库存排序
        this.setKc = () => {
            this.setType('kc');
        };

        // 按上架时间排序
        this.setSjsj = () => {
            this.setType('sjsj');
        };

        this.setType = (type) => {
            let order = 0;
            if ( this.state.queryParams.sort===type ) {
               order =  1 - this.state.queryParams.order;
            }
            this.set({
                sort : type,
                order : order
            });
        };

        this.set = (option) => {
            this.setState({
                queryParams : {
                    sort : option.sort,
                    pageNum  : 1,
                    order : option.order,
                    name : window.commonMethods.getUrlPram('keyword') || '',
                    threeCategoryId : window.commonMethods.getUrlPram('threeCategoryId') || '',
                    brandId :  window.commonMethods.getUrlPram('brandId')|| ''
                }
            }, ()=> {
                this.getGoodsList();
            });
        };

        // 设置排序样式
        this.setStyle = (type) => {
            if ( this.state.queryParams.sort===type ) {
                return this.state.queryParams.order===0 ? 'items down' : 'items up';
            }
            return 'items';
        };
    }

    componentDidMount() {
        this.getGoodsList();
        // DOM2可以在同一个dom上面绑定多个事件，DOM0只能在同一个dom上面绑定一个事件
        window.addEventListener('scroll', () => {
            this.scrollGetData(); 
        }, false);
    }

    render() {
        return (
            <div className="goods-box">

                {/*商品关键词搜索*/}
                {
                    this.state.queryParams.name
                    && 
                    <div className="search-wrap">
                        <div className="search-main">
                            <a href="javascript:history.back()" className="header-back"></a>
                            <Link to="search">
                                <div className="search-box search-tips">{this.state.queryParams.name}</div>
                            </Link>
                        </div>
                    </div>
                }
    
                {/*分类搜索*/}
                {
                    this.state.queryParams.threeCategoryId 
                    &&
                    <ComNavigation 
                        back='true'
                        headerName={ window.commonMethods.getUrlPram('twoCategoryName') }
                    />
                }

                {/*品牌搜索*/}
                 {
                    this.state.queryParams.brandId
                    &&
                    <ComNavigation 
                        back='true'
                        headerName={ window.commonMethods.getUrlPram('brandName') }
                    />
                }

                {/*排序类型*/}
                <div className="goods-sort-box">
                    <div className="com-goods-sort">
                        <a  
                            className={ this.state.queryParams.sort==='xl' ? 'items down' : 'items'} 
                            onClick={ this.setXl }
                        >销量</a>
                        <a  
                            onClick={this.setSj} 
                            className={ this.setStyle('sj') }
                        >售价</a>
                        <a 
                            onClick={this.setKc}
                            className={ this.setStyle('kc') }                            
                        >库存量</a>
                        <a 
                            onClick={this.setSjsj}
                            className={ this.setStyle('sjsj') }                            
                        >上架时间</a>
                    </div>
                </div>

                {/*商品列表*/}
                <ul className="clearfix com-goods-list goods-list">
                    {
                        this.state.goodsList.map(( data, index, arr) => {
                            return(
                                <GoodsItem 
                                    key={index} 
                                    goodsItem={data}
                                />
                            );
                        })
                    }
                </ul>

                {/*loading*/}
                <ComLoading 
                    isLoading={this.state.isLoading}
                />

            </div>
        )
    }
}



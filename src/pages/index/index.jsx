import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from '@/store/index';
import GoodsItem from  '@/component/goodsItem';
import ComHeader from '@/component/comHeader';
import ComFooter from '@/component/comFooter';
import ComLoading from '@/component/comLoading';
import lazyImg from '@/js/imgLazy';
import '@/css/index.css';
import '@/css/swiper.min.css';

export default class Index extends Component {

    constructor(props, context) {
        super();

        this.state = {
            indexData : null,
            isLoading : true
        };

        this.getData = () => {
            window.axios.post(window.API.indexMo).then( ( data ) => {
                var data1 = data.data;
                this.setState({
                    indexData : data1,
                    isLoading : false
                });
                new lazyImg();
            });
        };
    }

    componentWillMount() {
        this.getData();
    }

    render() {
        return (
            <div>
                {
                    <ComHeader showHeader="true" carCount={store.getState().reducer.carCount} />
                }
                {/*轮播*/}
                <div className="swiper-container swiper-container1">
                    <div className="swiper-wrapper">
                        {
                            this.state.indexData !== null && this.state.indexData.bannerList.map((data, index) => {
                                return(
                                    <div className="swiper-slide" key={index}>
                                        <a href="data.adUrl">
                                            <img src={data.adImgUrl} alt=""/>
                                        </a>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className="pagination"></div>
                </div>

                <ComLoading isLoading={this.state.isLoading} />

                {/*导航跳转*/}
                <div className="nav clearfix">
                    <Link to="" className="nav-item"><img src="../../m-images/index-top.png" alt=""/>TOP榜</Link>
                    <Link to="" className="nav-item"><img src="../../m-images/index-new.png" alt=""/>每周上新</Link>
                    <Link to="" className="nav-item"><img src="../../m-images/index-support.png" alt=""/>唯妮保障</Link>
                    <Link to="" className="nav-item"><img src="../../m-images/index-gift.png" alt=""/>邀请有礼</Link>
                </div>

                {/*热门推荐*/}
                <div className="hot clearfix">
                    <h2><a>Hot<span className="no-explan">热门推荐</span></a></h2>
                    <ul className="clearfix">
                        {
                            this.state.indexData !== null && this.state.indexData.subject.map((data, index) => {
                                return(
                                    <li key={index}>
                                        <Link to={{
                                            pathname: `hot?themeId=${data.id}`,
                                        }}>
                                            <img data-src={data.url} alt="" />
                                        </Link>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>

                {/*全球精选好货*/}
                <div className="global-selection">
                    <h2><a>Global<span className="explan">全球精选好货</span></a></h2>
                    <ul className="clearfix com-goods-list">
                        {
                            this.state.indexData !== null && this.state.indexData.goodsType.map((data, index) => {
                                return(
                                    <GoodsItem key={index}  goodsItem={data} />
                                );
                            })
                        }
                    </ul>
                </div>

                <ComFooter
                    showFooter='true'
                    activeClass="activeIndex"
                />

            </div>
        )
    }
}


/*// 下面的链接，组件里面才能访问store
const mapStateToProps = function(store) {
    return store;
};
// 连接 store，作为 props
export default connect(mapStateToProps)(Index);*/


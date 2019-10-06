/**
 * Routes:
 *   - ./src/pages/Authorized.tsx
 *
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import {Tabs} from 'antd';
import BasicInfo from './components/basicInfo'
import AgentInfo from './components/agentInfo'
import BrandInfo from './components/brandInfo'
import TypeResource from './components/typeResource'
import styles from './index.less'
import { StateType} from './model';
import { Dispatch } from 'redux';
const {TabPane} = Tabs
interface propsType{
    dispatch:Dispatch<any>
    shopinfo:any,
}
interface stateType{
    allList:any
}
// 装饰器
@connect(
	({
		loading,
		shopinfo,
	}: {
		loading: {
			models: { [key: string]: boolean };
		};
		shopinfo: StateType;
	}) => ({
		loading: loading.models.shopinfo,
		shopinfo,
	}),
)
class ShopInfo extends Component<propsType,stateType>{
    constructor(props:any){
        super(props);
        this.state = {
            allList : ''
        }
    }
    callback =(key) =>{
        console.log(key);
    }
    init =() =>{
        this.props.dispatch({
            type:'shopinfo/getShopinfo',
            payload:{}
        });
        this.setState({
            allList:this.props.shopinfo
        })
    }
    componentWillMount(){
        this.init();
        console.log('data',this.props);
    }
    render(){
        console.log(this.props);
        return (<div className={styles.shopInfo}>
                    <Tabs defaultActiveKey="1" onChange={this.callback}>
                        <TabPane tab="基本信息" key="1" >
                            <BasicInfo allData={this.props.shopinfo.list} dispatch={this.props.dispatch}/>
                        </TabPane>
                        <TabPane tab="主体信息" key="2">
                            <AgentInfo allData={this.props.shopinfo.list}/>
                        </TabPane>
                        <TabPane tab="品牌信息" key="3">
                            <BrandInfo allData={this.props.shopinfo.list}/>
                        </TabPane>
                        {/* <TabPane tab="类目资源" key="4">
                            <TypeResource allData={this.props.shopinfo.list}/>
                        </TabPane> */}
                    </Tabs>
                </div>)
    }

}
export default ShopInfo;
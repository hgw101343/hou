import React, { Component } from 'react';
import styles from '../index.less'
interface propstype{
    allData : any
}
interface stateType{}
class brandInfo extends Component<propstype,stateType>{
    constructor(props){
        super(props);
    }
    render(){
        return (<div className={styles.brandInfo}>
            {this.props.allData.brandInfoRespList.map((item,index) =>{
                console.log(item.type);
                return <div key={index}>
                        <div><p className={styles.title}>品牌类型：</p><p>{item.type}</p></div>
                        <div><p className={styles.title}>品牌名称：</p><p>{item.name}</p></div>
                        <div><p className={styles.title}>商标注册人类型：</p><p>{item.registrantType}</p></div>
                        <div><p className={styles.title}>商标注册号：</p><p>{item.regNo}</p></div>
                        <div><p className={styles.title}>商标注册证明：</p><p>{item.type}</p></div>
                        <div><p className={styles.title}>证明有效期：</p><p>{item.cerExpiredDate}</p></div>
                    </div>
            })}
    </div>)
    }
}

export default brandInfo
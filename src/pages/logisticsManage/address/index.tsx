/**
 * Routes:
 *   - ./src/pages/Authorized.tsx
 *
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Spin, Card, Button } from 'antd';
import { Dispatch } from 'redux';
import AddressList from './components/addressList';
import { StateType as addressManageStateType } from './model';
import styles from './index.less';
import { PaginationConfig } from 'antd/es/pagination';
import TableShowModal, { tableShowModalType } from './components/tableShowModal';
import router from 'umi/router';

interface AddressPropsType {
	dispatch: Dispatch<any>;
	loading: boolean;
	addressManage: addressManageStateType;
	pagination: PaginationConfig;
}

interface AddressStateType {}

@connect(
	({
		loading,
		addressManage,
	}: {
		loading: {
			models: {
				[key: string]: boolean;
			};
		};
		addressManage: addressManageStateType;
	}) => ({
		loading: loading.models['addressManage'],
		addressManage,
	}),
)
class Address extends Component<AddressPropsType, AddressStateType> {
	componentDidMount() {
		this.props.dispatch({
			type: 'addressManage/getPaginationData',
			payload: {},
		});
	}

	handleShowTableModal = () => {
		this.props.dispatch({
			type: 'addressManage/save',
			payload: {
				tableShowModal: true,
			},
		});
	};

	render() {
		const {
			loading,
			addressManage: { list, columnItems, pagination, tableShowModal, modal },
			dispatch,
		} = this.props;

		const listProps = {
			list,
			columnItems,
			pagination,
			modal,
			setModal(modal: boolean) {
				dispatch({
					type: 'addressManage/save',
					payload: {
						modal,
					},
				});
			},
			handleRadioUpdate(id: number, key: string) {
				dispatch({
					type: 'addressManage/updateDefaultAddress',
					payload: {
						key,
						id,
					},
				});
			},
			handleDelete(id: number) {
				dispatch({
					type: 'addressManage/deleteAddress',
					payload: {
						id,
					},
				});
			},
			changeAddress(data) {
				let typeArr = [false, false];
				if (data.type === 1) {
					typeArr[0] = true;
					typeArr[1] = false;
				} else if (data.type === 2) {
					typeArr[0] = false;
					typeArr[1] = true;
				} else if (data.type === 3) {
					typeArr[0] = true;
					typeArr[1] = true;
				}
				dispatch({
					type: 'addressManage/save',
					payload: {
						submit: value => {
							dispatch({
								type: 'addressManage/updateAddress',
								payload: value,
							});
						},
						detailData: {
							...data,
							area: data.area.split('-'),
							telephone: data.telephone.split('-'),
							type: typeArr,
						},
						detailTitle: '编辑地址',
					},
				});
				router.push({
					pathname: '/logisticsManage/address/detail',
					query: {
						from: 'edit',
					},
				});
			},
		};

		function handleAddAddress() {
			dispatch({
				type: 'addressManage/save',
				payload: {
					detailTitle: '新增地址',
					submit: value => {
						dispatch({
							type: 'addressManage/addAddress',
							payload: value,
						});
					},
				},
			});
			router.push({ pathname: '/logisticsManage/address/detail', query: { from: 'new' } });
		}

		// const tableShowModalProps: tableShowModalType = {
		//   tableShowModal,
		//   columnItems,
		//   submit(value) {

		//   },
		//   cancel() {

		//   },
		//   updateCheck() {

		//   },
		//   updateCheckAll() {

		//   }
		// }

		return (
			<Spin spinning={loading === true}>
				<Card bordered={false}>
					<div className={styles.header}>
						<div>
							<Button type="primary" onClick={() => handleAddAddress()}>
								新增地址
							</Button>
							{/* <Button type="primary" onClick={this.handleShowTableModal}>显示列表</Button> */}
						</div>
					</div>
					<AddressList {...listProps} />
				</Card>
				{/* <TableShowModal {...tableShowModalProps} /> */}
			</Spin>
		);
	}
}

export default Address;

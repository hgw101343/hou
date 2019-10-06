import React, { useState } from 'react';
import styles from '../index.less';
import { Row, Col, Card, Button } from 'antd';
import { data, optionType } from './config';
import router from 'umi/router';

interface storeTypePropsType {}

const StoreType = (props: storeTypePropsType) => {
	const [description, setDescription] = useState<optionType | undefined>();

	function handleNextStep() {
		if (description) {
			if (description.type < 20) {
				router.push({
					pathname: '/user/register/personal',
					query: {
						type: description.type,
					},
				});
			} else {
				router.push({
					pathname: '/user/register/enterprise',
					query: {
						type: description.type,
					},
				});
			}
		}
		return;
	}

	function matchType(type: number) {
		if (description) {
			return description.type === type ? styles.selectedTypeItem : null;
		}
		return null;
	}

	return (
		<div className={styles.container}>
			<div className={styles.typeRouteContent}>
				<h3 className={styles.title}>请选择入住的店铺类型</h3>
				<Row gutter={24} type="flex">
					{data.map(item => {
						return (
							<Col span={12} className={styles.cell}>
								<Card bordered={false} className={styles.selectCart}>
									<h3 className={styles.typeTitle}>{item.title}</h3>
									<div className={styles.typeDesc}>{item.desc}</div>
									{item.options.map(item => {
										return (
											<div
												className={
													styles.typeItem + ' ' + matchType(item.type)
												}
												onClick={() => setDescription(item)}
											>
												<Row>
													<Col span={5} className={styles.itemTitle}>
														{item.name}
													</Col>
													<Col offset={1} span={18}>
														{item.desc}
													</Col>
												</Row>
											</div>
										);
									})}
								</Card>
							</Col>
						);
					})}
				</Row>
				{description ? (
					<div className={styles.description}>
						<div className={styles.descriptionTitle}>{description.name}</div>
						{description.detailDesc.map(item => {
							return <div>{item}</div>;
						})}
					</div>
				) : null}

				<Button
					size="large"
					type="primary"
					className={styles.nextStep}
					disabled={description === undefined}
					onClick={handleNextStep}
				>
					下一步
				</Button>
			</div>
		</div>
	);
};

export default StoreType;

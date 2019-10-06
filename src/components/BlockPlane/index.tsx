import React from 'react';
import styles from './index.less';

export interface propsType {
	title?: string | React.ReactNode;
}

class BlockPlane extends React.Component<propsType> {
	render() {
		const { title, children } = this.props;
		return (
			<div className={styles.plane}>
				{title ? <div className={styles.planeTitle}>{title}</div> : null}
				<div className={styles.planeContent}>{children}</div>
			</div>
		);
	}
}

export default BlockPlane;
